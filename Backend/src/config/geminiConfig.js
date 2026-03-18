import Groq from "groq-sdk";
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const modelCandidates = 'llama-3.1-8b-instant,llama-3.3-70b-versatile,mixtral-8x7b-32768'
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);

const parseQuestionsJson = (responseText) => {
  const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
  const jsonPayload = arrayMatch ? arrayMatch[0] : cleaned;
  return JSON.parse(jsonPayload);
};

const toSafeString = (value) => (value === undefined || value === null ? '' : String(value));

const buildUserContextBlock = (userContext = {}) => {
  if (!userContext || typeof userContext !== 'object') {
    return 'No user context provided.';
  }

  return [
    `Username: ${toSafeString(userContext.username) || 'unknown'}`,
    `XP: ${toSafeString(userContext.xp) || '0'}`,
    `Current Streak: ${toSafeString(userContext.currentStreak) || '0'}`,
    `Completed Lessons: ${toSafeString(userContext.completedLessonsCount) || '0'}`,
    `Badges: ${Array.isArray(userContext.badges) && userContext.badges.length ? userContext.badges.join(', ') : 'none'}`,
    `Unlocked Modules: ${Array.isArray(userContext.unlockedModules) && userContext.unlockedModules.length ? userContext.unlockedModules.join(', ') : 'none'}`,
    `Interests: ${Array.isArray(userContext.interests) && userContext.interests.length ? userContext.interests.join(', ') : 'general finance learning'}`,
  ].join('\n');
};

const normalizeQuestions = (questions) => {
  if (!Array.isArray(questions)) return [];

  return questions
    .filter((q) => q && typeof q === 'object')
    .map((q) => ({
      question: toSafeString(q.question).trim(),
      options: Array.isArray(q.options) ? q.options.map((opt) => toSafeString(opt)).slice(0, 4) : [],
      correctAnswer: Number.isInteger(q.correctAnswer) ? q.correctAnswer : 0,
      explanation: toSafeString(q.explanation).trim(),
    }))
    .filter((q) => q.question && q.options.length >= 2);
};

const generateQuestionsWithFallback = async (prompt) => {
  let lastError;
  const modelErrors = [];

  for (const modelName of modelCandidates) {
    try {
      const completion = await groq.chat.completions.create({
        model: modelName,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const responseText = completion?.choices?.[0]?.message?.content?.trim() || '';
      if (!responseText) {
        throw new Error(`Groq returned an empty response for model ${modelName}`);
      }

      return parseQuestionsJson(responseText);
    } catch (error) {
      lastError = error;
      const message = (error?.message || '').toLowerCase();
      const isModelNotFound = message.includes('model') && (message.includes('not found') || message.includes('does not exist'));
      const isRateLimit = message.includes('rate limit') || message.includes('429') || message.includes('quota');

      if (isModelNotFound || isRateLimit) {
        modelErrors.push(`${modelName}: ${error?.message || 'unknown error'}`);
        continue;
      }

      throw error;
    }
  }

  if (modelErrors.length) {
    throw new Error(`All configured Groq models failed. ${modelErrors.join(' | ')}`);
  }

  throw lastError || new Error('No Groq model candidates are available.');
};

export const generateQuestionsFromAI = async (topic, count = 5, options = {}) => {
  const { userContext = {}, previousQuestions = [], dayLabel = '' } = options;
  const safeCount = Math.min(Math.max(Number(count) || 5, 5), 10);
  const alreadyUsedQuestions = Array.isArray(previousQuestions)
    ? previousQuestions.map((q) => toSafeString(q?.question)).filter(Boolean)
    : [];

  const prompt = `Generate ${safeCount} multiple-choice questions on the topic of "${topic}" suitable for high school students learning financial literacy.
Contest day: ${dayLabel || 'general'}

Use this learner context:
${buildUserContextBlock(userContext)}

Avoid repeating these already-generated questions:
${alreadyUsedQuestions.length ? alreadyUsedQuestions.join('\n') : 'None'}

Provide the response strictly as a valid JSON array with this structure:
[
  {
    "question": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Why this is the correct answer"
  }
]
Do not include markdown or extra commentary.`;

  const questions = await generateQuestionsWithFallback(prompt);
  return normalizeQuestions(questions).slice(0, safeCount);
};

export const generateDailyContestFromAI = async ({
  topic,
  days = 7,
  questionsPerDay = 5,
  startDate,
  userContext = {},
  existingQuestions = [],
}) => {
  const contestTopic = toSafeString(topic).trim() || 'financial literacy';
  const totalDays = Math.min(Math.max(Number(days) || 1, 1), 14);
  const dailyCount = Math.min(Math.max(Number(questionsPerDay) || 5, 5), 10);
  const start = startDate ? new Date(startDate) : new Date();
  const allQuestions = normalizeQuestions(existingQuestions);
  const daysData = [];

  for (let offset = 0; offset < totalDays; offset += 1) {
    const dayDate = new Date(start);
    dayDate.setDate(start.getDate() + offset);
    const dayLabel = dayDate.toISOString().split('T')[0];

    const dayQuestions = await generateQuestionsFromAI(contestTopic, dailyCount, {
      userContext,
      previousQuestions: allQuestions,
      dayLabel,
    });

    allQuestions.push(...dayQuestions);
    daysData.push({
      date: dayLabel,
      topic: contestTopic,
      questions: dayQuestions,
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    topic: contestTopic,
    userContextUsed: {
      username: userContext?.username || null,
      xp: userContext?.xp || 0,
      currentStreak: userContext?.currentStreak || 0,
      badges: Array.isArray(userContext?.badges) ? userContext.badges : [],
      completedLessonsCount: userContext?.completedLessonsCount || 0,
    },
    totalQuestions: allQuestions.length,
    allQuestions,
    days: daysData,
  };
};

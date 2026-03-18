import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import Question from '../models/Question.js';
import { generateLearningCardsFromAI, generateQuestionsFromAI } from '../config/geminiConfig.js';

const clampQuestionsPerLesson = (value) => Math.min(Math.max(Number(value) || 5, 5), 10);
const FRESHNESS_WINDOW_MS = 24 * 60 * 60 * 1000;

const isFresh = (timestamp) => {
  if (!timestamp) return false;
  return Date.now() - new Date(timestamp).getTime() < FRESHNESS_WINDOW_MS;
};

const toQuestionDocs = (lessonId, questions) => {
  return questions.map((q) => ({
    lessonId,
    text: q.question,
    options: q.options,
    correctOptionIndex: q.correctAnswer,
    explanation: q.explanation,
  }));
};

const toAIQuestionShape = (questionDoc) => ({
  question: questionDoc.text,
  options: Array.isArray(questionDoc.options) ? questionDoc.options : [],
  correctAnswer: typeof questionDoc.correctOptionIndex === 'number' ? questionDoc.correctOptionIndex : 0,
  explanation: questionDoc.explanation || '',
});

const buildFallbackQuestions = (topic, count, lessonOrder = 1) => {
  const bank = [
    {
      question: `In ${topic}, what is the safest first step before making a decision?`,
      options: ['Act quickly without checking', 'Verify details from trusted source', 'Share credentials with friends', 'Ignore warnings'],
      correctAnswer: 1,
      explanation: 'Safe financial behavior starts with verification from trusted sources.',
    },
    {
      question: `For a Class 12 learner, which approach builds long-term confidence in ${topic}?`,
      options: ['Memorize blindly', 'Understand concept and apply to scenarios', 'Skip explanations', 'Depend on luck'],
      correctAnswer: 1,
      explanation: 'Conceptual understanding plus scenario practice improves decision-making quality.',
    },
    {
      question: `Which option best reduces risk while learning ${topic}?`,
      options: ['One-time learning only', 'Use a simple checklist every time', 'Copy others', 'Avoid asking questions'],
      correctAnswer: 1,
      explanation: 'A repeatable checklist prevents common mistakes and improves consistency.',
    },
    {
      question: `As lesson difficulty increases, what should improve first?`,
      options: ['Guess speed', 'Reasoning depth', 'Message forwarding', 'Ignoring context'],
      correctAnswer: 1,
      explanation: 'Higher levels require better reasoning and context-based choices, not faster guessing.',
    },
    {
      question: `How should you treat explanations after each question?`,
      options: ['Skip them', 'Use them to refine your next decision', 'Read only if wrong', 'Memorize words only'],
      correctAnswer: 1,
      explanation: 'Explanations are feedback loops; use them to improve your next choices.',
    },
  ];

  return Array.from({ length: count }, (_, idx) => {
    const q = bank[idx % bank.length];
    return {
      question: `[L${lessonOrder}] ${q.question}`,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    };
  });
};

export const generateAndPersistModuleContent = async ({
  moduleId,
  userContext = {},
  questionsPerLesson = 5,
  forceRegenerate = false,
}) => {
  const moduleDoc = await Module.findById(moduleId);
  if (!moduleDoc) {
    throw new Error('Module not found');
  }

  let lessons = await Lesson.find({ moduleId: moduleDoc._id }).sort({ order: 1 });
  while (lessons.length < 3) {
    const nextOrder = lessons.length ? Math.max(...lessons.map((lesson) => lesson.order || 0)) + 1 : 1;
    const newLesson = await Lesson.create({
      moduleId: moduleDoc._id,
      title: `${moduleDoc.title} - Level ${nextOrder}`,
      order: nextOrder,
      xpReward: 50,
    });
    lessons.push(newLesson);
  }
  lessons = lessons.sort((a, b) => (a.order || 0) - (b.order || 0));

  const safeQuestionsPerLesson = clampQuestionsPerLesson(questionsPerLesson);

  const hasExistingCards = Array.isArray(moduleDoc.learningCards) && moduleDoc.learningCards.length > 0;
  const shouldRegenerateCards = forceRegenerate || !hasExistingCards || !isFresh(moduleDoc.aiGeneratedAt);

  if (shouldRegenerateCards) {
    const learningCards = await generateLearningCardsFromAI({
      moduleTitle: moduleDoc.title,
      moduleDescription: moduleDoc.description,
      cardsCount: 4,
      userContext,
    });

    moduleDoc.learningCards = learningCards;
    moduleDoc.aiGeneratedAt = new Date();
    await moduleDoc.save();
  }

  const allQuestionsForContext = [];
  const lessonSummaries = [];
  const learningContextText = (moduleDoc.learningCards || [])
    .map((card) => `${card.order}. ${card.title}: ${card.text}`)
    .join('\n');

  for (const lesson of lessons) {
    const existingQuestions = await Question.find({ lessonId: lesson._id });
    const hasEnoughExistingQuestions = existingQuestions.length >= safeQuestionsPerLesson;
    const shouldRegenerateLesson = forceRegenerate || !hasEnoughExistingQuestions || !isFresh(lesson.aiGeneratedAt);

    if (!shouldRegenerateLesson) {
      allQuestionsForContext.push(...existingQuestions.map(toAIQuestionShape));
      lessonSummaries.push({
        _id: lesson._id,
        title: lesson.title,
        order: lesson.order,
        aiExplanation: lesson.aiExplanation,
        questionsCount: existingQuestions.length,
      });
      continue;
    }

    const topic = `${moduleDoc.title} - ${lesson.title}`;
    let generatedQuestions = [];
    try {
      generatedQuestions = await generateQuestionsFromAI(topic, safeQuestionsPerLesson, {
        userContext,
        previousQuestions: allQuestionsForContext,
        dayLabel: `lesson-${lesson.order}`,
        lessonOrder: lesson.order,
        learningContext: learningContextText,
      });
    } catch (error) {
      generatedQuestions = buildFallbackQuestions(topic, safeQuestionsPerLesson, lesson.order);
    }

    if (!generatedQuestions.length) {
      generatedQuestions = buildFallbackQuestions(topic, safeQuestionsPerLesson, lesson.order);
    }

    allQuestionsForContext.push(...generatedQuestions);

    await Question.deleteMany({ lessonId: lesson._id });
    await Question.insertMany(toQuestionDocs(lesson._id, generatedQuestions));

    lesson.aiExplanation = generatedQuestions[0]?.explanation || `In this lesson, you will learn ${lesson.title}.`;
    lesson.aiGeneratedAt = new Date();
    await lesson.save();

    lessonSummaries.push({
      _id: lesson._id,
      title: lesson.title,
      order: lesson.order,
      aiExplanation: lesson.aiExplanation,
      questionsCount: generatedQuestions.length,
    });
  }

  return {
    module: {
      _id: moduleDoc._id,
      title: moduleDoc.title,
      description: moduleDoc.description,
      learningCards: moduleDoc.learningCards,
      aiGeneratedAt: moduleDoc.aiGeneratedAt,
    },
    lessons: lessonSummaries,
  };
};

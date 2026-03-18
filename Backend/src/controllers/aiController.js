import { generateDailyContestFromAI, generateQuestionsFromAI } from '../config/geminiConfig.js';
import User from '../models/User.js';

export const generateNewQuestion = async (req, res) => {
    const { topic, count = 5, userContext = {}, previousQuestions = [], dayLabel = '' } = req.body;
    
    if (!topic) {
        return res.status(400).json({ message: 'Topic is required to generate questions' });
    }

    try {
        const numQuestions = Math.min(Math.max(count, 5), 10); // clamp between 5 and 10
        const questionsData = await generateQuestionsFromAI(topic, numQuestions, {
            userContext,
            previousQuestions,
            dayLabel,
        });
        res.status(200).json(questionsData);
    } catch (error) {
        console.error("Error in generateNewQuestion controller:", error);
        res.status(500).json({ message: 'Failed to generate questions', error: error.message });
    }
};

export const generateDailyContest = async (req, res) => {
    const {
        topic = 'financial literacy',
        days = 7,
        questionsPerDay = 5,
        startDate,
        userContext = {},
        existingQuestions = [],
    } = req.body;

    try {
        const clampedQuestionsPerDay = Math.min(Math.max(Number(questionsPerDay) || 5, 5), 10);
        const contest = await generateDailyContestFromAI({
            topic,
            days,
            questionsPerDay: clampedQuestionsPerDay,
            startDate,
            userContext,
            existingQuestions,
        });

        res.status(200).json(contest);
    } catch (error) {
        console.error('Error in generateDailyContest controller:', error);
        res.status(500).json({ message: 'Failed to generate daily contest', error: error.message });
    }
};

export const getOrCreateCurrentDayContest = async (req, res) => {
    const { username } = req.params;
    const { topic = 'financial literacy for Indian students', count = 5 } = req.query;

    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }

    try {
        const user = await User.findOne({ username })
            .populate('unlockedModules')
            .populate('completedLessons');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const today = new Date().toISOString().split('T')[0];
        const existingEntry = user.dailyContests?.find((entry) => entry.date === today);

        if (existingEntry?.questions?.length) {
            return res.status(200).json({
                username: user.username,
                date: today,
                topic: existingEntry.topic,
                source: 'stored',
                questions: existingEntry.questions,
            });
        }

        const safeCount = Math.min(Math.max(Number(count) || 5, 5), 10);
        const userContext = {
            username: user.username,
            xp: user.xp || 0,
            currentStreak: user.currentStreak || 0,
            completedLessonsCount: Array.isArray(user.completedLessons) ? user.completedLessons.length : 0,
            badges: Array.isArray(user.badges) ? user.badges.map((b) => b.name) : [],
            unlockedModules: Array.isArray(user.unlockedModules)
                ? user.unlockedModules.map((m) => m?.title || m?.name).filter(Boolean)
                : [],
        };

        const previousQuestions = Array.isArray(user.dailyContests)
            ? user.dailyContests.flatMap((entry) => entry.questions || [])
            : [];

        const generatedQuestions = await generateQuestionsFromAI(topic, safeCount, {
            userContext,
            previousQuestions,
            dayLabel: today,
        });

        user.dailyContests = Array.isArray(user.dailyContests) ? user.dailyContests : [];
        user.dailyContests.push({
            date: today,
            topic,
            questions: generatedQuestions,
            generatedAt: new Date(),
        });

        await user.save();

        res.status(200).json({
            username: user.username,
            date: today,
            topic,
            source: 'generated',
            questions: generatedQuestions,
        });
    } catch (error) {
        console.error('Error in getOrCreateCurrentDayContest controller:', error);
        res.status(500).json({ message: 'Failed to get daily contest questions', error: error.message });
    }
};

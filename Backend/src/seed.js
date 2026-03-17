import Module from './models/Module.js';
import Lesson from './models/Lesson.js';
import Question from './models/Question.js';
import mongoose from 'mongoose';

const seedDatabase = async () => {
    try {
        const moduleCount = await Module.countDocuments();

        // Only seed if empty
        if (moduleCount > 0) {
            console.log('Database already seeded. Skipping...');
            return;
        }

        console.log('Seeding Database with Viksit Bharat content...');

        // 1. Create Modules
        const upiModule = await Module.create({
            title: 'UPI Safety',
            description: 'Learn to be a Digital Defender',
            icon: 'ShieldCheck', // Use Lucide icons or similar in frontend
            order: 1
        });

        const stocksModule = await Module.create({
            title: 'Stock Market Basics',
            description: 'Become a Wealth Weaver',
            icon: 'TrendingUp',
            order: 2
        });

        const taxModule = await Module.create({
            title: 'Taxation 101',
            description: 'Contribute as a Nation Builder',
            icon: 'Landmark',
            order: 3
        });


        // 2. Create Lessons for UPI Module
        const upiLesson1 = await Lesson.create({
            moduleId: upiModule._id,
            title: 'What is a UPI PIN?',
            order: 1,
            xpReward: 50
        });

        // 3. Create Questions for UPI Lesson 1
        await Question.create({
            lessonId: upiLesson1._id,
            text: 'Your friend asks for your UPI PIN to send you money. What do you do?',
            options: [
                'Give them the PIN',
                'Tell them PIN is only for sending money, not receiving',
                'Change the PIN'
            ],
            correctOptionIndex: 1,
            explanation: 'You NEVER need to enter a UPI PIN to receive money. PIN is strictly for sending money.'
        });

        await Question.create({
            lessonId: upiLesson1._id,
            text: 'You receive an SMS link promising a scratch card reward. The link asks for your UPI PIN to claim it.',
            options: [
                'Click and enter the PIN',
                'Ignore and report the SMS'
            ],
            correctOptionIndex: 1,
            explanation: 'Never click on suspicious links or enter your PIN for rewards. Scammers use this to drain accounts.'
        });

        console.log('Database Seeding Complete!');

    } catch (error) {
        console.error('Error seeding database:', error);
    }
};

export default seedDatabase;

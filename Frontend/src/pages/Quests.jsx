import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Award, Flame, Star, CheckCircle } from 'lucide-react';

const getDateKey = (date = new Date()) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const Quests = () => {
    const { user } = useAuth();

    if (!user) return null;

    const today = getDateKey();
    const dailyProgress = user.dailyProgress || {};
    const isTodayProgress = dailyProgress.dateKey === today;
    const todayXp = isTodayProgress ? Number(dailyProgress.xpEarned) || 0 : 0;
    const todayLessons = isTodayProgress ? Number(dailyProgress.lessonsCompleted) || 0 : 0;
    const streak = Number(user.currentStreak) || 0;

    const quests = [
        {
            title: 'Streak Builder',
            description: 'Maintain a 7-day learning streak',
            progress: Math.min(streak, 7),
            total: 7,
            xp: 25,
            icon: <Flame className="text-orange-500" size={32} />
        },
        {
            title: 'XP Hunter',
            description: 'Earn 50 XP today',
            progress: Math.min(todayXp, 50),
            total: 50,
            xp: 20,
            icon: <Star className="text-yellow-500" size={32} />
        },
        {
            title: 'Knowledge Seeker',
            description: 'Complete 3 lessons today',
            progress: Math.min(todayLessons, 3),
            total: 3,
            xp: 30,
            icon: <Award className="text-duo-blue" size={32} />
        }
    ];

    return (
        <div className="flex flex-col h-full bg-[#F7F7F7] pb-24">
            <div className="sticky top-0 bg-white z-10 border-b-2 border-gray-200 p-4 shadow-sm text-center">
                <h1 className="font-bold text-xl text-gray-700">Daily Quests</h1>
            </div>

            <div className="p-6 max-w-lg mx-auto w-full">
                <div className="space-y-4">
                    {quests.map((quest, index) => {
                        const isComplete = quest.progress >= quest.total;
                        const percentage = Math.min((quest.progress / quest.total) * 100, 100);

                        return (
                            <div key={index} className={`bg-white rounded-2xl p-4 border-2 ${isComplete ? 'border-duo-green-dark bg-green-50' : 'border-gray-200'} flex items-center shadow-sm`}>
                                <div className="mr-4">
                                    {quest.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="font-bold text-gray-800 text-lg">{quest.title}</h3>
                                        <span className="font-bold text-duo-yellow-dark">+{quest.xp} XP</span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-500 mb-2">{quest.description}</p>

                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full ${isComplete ? 'bg-duo-green' : 'bg-duo-yellow'}`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-right text-xs font-bold text-gray-500 mt-1">
                                        {quest.progress} / {quest.total}
                                    </div>
                                </div>
                                {isComplete && (
                                    <div className="ml-4 text-duo-green">
                                        <CheckCircle size={28} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Quests;

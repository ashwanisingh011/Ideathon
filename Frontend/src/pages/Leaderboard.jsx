import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '../services/api';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await getLeaderboard();
                setLeaderboard(res.data);
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-gray-500 font-bold">Loading...</div>;
    }

    return (
        <div className="flex flex-col h-auto bg-[#F7F7F7] pb-24">
            <div className="sticky top-0 bg-white z-10 border-b-2 border-gray-200 p-4 shadow-sm text-center">
                <h1 className="font-bold text-xl text-gray-700">Leaderboard</h1>
            </div>

            <div className="p-6 max-w-lg mx-auto w-full">
                <div className="bg-white rounded-2xl border-2">
                    {leaderboard.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 font-semibold">No users yet! Start learning to earn XP.</div>
                    ) : (
                        leaderboard.map((user, index) => {
                            let rankColor = "text-gray-500";
                            let rankBg = "bg-gray-100";
                            if (index === 0) {
                                rankColor = "text-yellow-600";
                                rankBg = "bg-yellow-100 border-yellow-400";
                            } else if (index === 1) {
                                rankColor = "text-gray-600";
                                rankBg = "bg-gray-200 border-gray-400";
                            } else if (index === 2) {
                                rankColor = "text-orange-700";
                                rankBg = "bg-orange-100 border-orange-400";
                            }

                            return (
                                <div key={user._id} className={`flex items-center p-4 border-b last:border-b-0 ${index < 3 ? 'border-b-2' : 'border-white-100'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mr-4 ${rankBg} ${index < 3 ? 'border-2' : ''}`}>
                                        <span className={rankColor}>{index + 1}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-gray-800 text-lg">{user.username}</div>
                                        <div className="text-sm font-semibold text-gray-500">
                                            Streak: {user.currentStreak} 🔥
                                        </div>
                                    </div>
                                    <div className="font-bold text-duo-yellow-dark text-xl">{user.xp} XP</div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../services/api';
import { User as UserIcon, ShieldCheck, TrendingUp, Landmark, Flame, Award, ArrowLeft } from 'lucide-react';

const badgeIcons = {
    'Digital Defender': <ShieldCheck size={48} className="text-duo-blue" />,
    'Wealth Weaver': <TrendingUp size={48} className="text-duo-green" />,
    'Nation Builder': <Landmark size={48} className="text-purple-500" />
};

const Profile = () => {
    const { user, logout, setUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if(!user) return navigate('/');
        const fetchProfile = async () => {
            const res = await getUserProfile(user.username);
            setUser(res.data);
        };
        fetchProfile();
    }, []);

    if(!user) return null;

    return (
        <div className="min-h-screen bg-[#F7F7F7] pb-24">
            {/* Top Bar */}
            <div className="sticky top-0 bg-white z-10 border-b-2 border-gray-200 p-4 flex items-center shadow-sm">
                <button onClick={() => navigate('/home')} className="text-gray-400 hover:text-gray-600 mr-4">
                    <ArrowLeft size={28} />
                </button>
                <div className="font-bold text-xl text-gray-700">Profile</div>
            </div>

            <div className="p-6">
                {/* Header Card */}
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm flex items-center space-x-6">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                        <UserIcon size={40} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{user.username}</h1>
                        <p className="text-gray-500 font-semibold mt-1">Viksit Bharat Ambassador</p>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl p-4 border-2 border-gray-200 flex items-center space-x-4">
                        <Flame size={32} className="text-orange-500" />
                        <div>
                            <div className="text-2xl font-bold text-gray-800">{user.currentStreak}</div>
                            <div className="text-gray-500 font-semibold text-sm">Day Streak</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 border-2 border-gray-200 flex items-center space-x-4">
                        <Award size={32} className="text-yellow-500" />
                        <div>
                            <div className="text-2xl font-bold text-gray-800">{user.xp}</div>
                            <div className="text-gray-500 font-semibold text-sm">Total XP</div>
                        </div>
                    </div>
                </div>

                {/* Badges Section */}
                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Achievements</h2>
                    <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 grid grid-cols-3 gap-4">
                        {user.badges.length > 0 ? (
                            user.badges.map((b, i) => (
                                <div key={i} className="flex flex-col items-center text-center">
                                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-2 border-2 border-blue-200">
                                        {badgeIcons[b.name] || <Award className="text-gray-400"/>}
                                    </div>
                                    <span className="font-bold text-gray-700 text-sm leading-tight">{b.name}</span>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 text-center text-gray-400 font-semibold py-4">
                                Complete lessons to earn Viksit Bharat badges!
                            </div>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="w-full mt-12 bg-white text-red-500 border-2 border-gray-200 font-bold py-4 rounded-xl text-lg hover:bg-gray-50 transition-colors"
                >
                    SIGN OUT
                </button>
            </div>
        </div>
    );
};

export default Profile;
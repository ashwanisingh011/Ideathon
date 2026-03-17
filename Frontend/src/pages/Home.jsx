import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getModules, getUserProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, TrendingUp, Landmark, Flame, User as UserIcon } from 'lucide-react';

const iconMap = {
    'ShieldCheck': <ShieldCheck size={32} color="white" />,
    'TrendingUp': <TrendingUp size={32} color="white" />,
    'Landmark': <Landmark size={32} color="white" />
};

const Home = () => {
    const { user, setUser } = useAuth();
    const [modules, setModules] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHomeData = async () => {
            if(!user) {
                navigate('/');
                return;
            }
            try {
                // Refresh user data to get accurate XP and streaks
                const userRes = await getUserProfile(user.username);
                setUser(userRes.data);

                // Fetch Content path
                const modRes = await getModules();
                setModules(modRes.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchHomeData();
    }, []);

    if(!user) return null;

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* Top Stats Bar */}
            <div className="sticky top-0 bg-white z-10 border-b-2 border-gray-200 p-4 flex justify-between items-center shadow-sm">
                <div className="font-bold text-xl text-duo-blue flex items-center">
                   Viksit
                </div>
                <div className="flex space-x-6 font-bold text-gray-600">
                    <div className="flex items-center space-x-1 text-orange-500">
                        <Flame size={24} />
                        <span>{user.currentStreak}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-duo-green">
                        <span className="text-xl px-1">XP</span>
                        <span>{user.xp}</span>
                    </div>
                </div>
            </div>

            {/* Path View (Duolingo Style) */}
            <div className="p-6 flex flex-col items-center mt-8 space-y-16">
                {modules.map((mod, idx) => {
                    const isUnlocked = true; // In MVP all are unlocked, or we can add logic
                    return (
                        <div key={mod._id} className="relative flex flex-col items-center w-full max-w-sm">

                            <div className="mb-4 text-center">
                                <h2 className="text-2xl font-bold text-gray-800">{mod.title}</h2>
                                <p className="text-gray-500 font-semibold">{mod.description}</p>
                            </div>

                            {/* Node Button */}
                            <button
                                onClick={() => {
                                    if (idx === 0) {
                                        navigate(`/module/${mod._id}/lessons`)
                                    } else {
                                        alert("Module locked for MVP Demo! Please try the first module.");
                                    }
                                }}
                                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${idx === 0 ? 'bg-duo-green shadow-[0_8px_0_#58a700] hover:translate-y-[2px] hover:shadow-[0_6px_0_#58a700] active:translate-y-[8px] active:shadow-none' : 'bg-gray-300 shadow-[0_8px_0_#b3b3b3]'}`}
                            >
                                {iconMap[mod.icon]}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 w-full bg-white border-t-2 border-gray-200 flex justify-around p-4 z-10">
                <button className="text-duo-green"><ShieldCheck size={32} /></button>
                <button className="text-gray-400 hover:text-duo-blue" onClick={() => navigate('/profile')}><UserIcon size={32} /></button>
            </div>
        </div>
    );
};

export default Home;

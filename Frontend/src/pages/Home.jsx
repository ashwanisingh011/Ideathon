import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getModules, getUserProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Flame, Sparkles } from 'lucide-react';
import LearningPath from '../components/LearningPath';

const Home = () => {
    const { user, setUser } = useAuth();
    const [modules, setModules] = useState([]);
    const [unlockBanner, setUnlockBanner] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state?.unlockTitle) {
            setUnlockBanner(location.state.unlockTitle);
            navigate(location.pathname, { replace: true, state: {} });
            const timer = setTimeout(() => setUnlockBanner(null), 4500);
            return () => clearTimeout(timer);
        }
    }, [location, navigate]);

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
                if (err.response && err.response.status === 404) {
                    setUser(null); // Clear local context
                    localStorage.removeItem('user'); // Clear local storage manually if logout context isn't available
                    navigate('/');
                }
            }
        };
        fetchHomeData();
    }, []);

    if(!user) return null;

    return (
        <div className="min-h-screen bg-white">
            {unlockBanner && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#58cc02] text-white px-5 py-4 rounded-2xl shadow-[0_8px_0_#3b8f1f] border-2 border-white animate-bounce">
                    <div className="flex items-center gap-3">
                        <Sparkles size={22} />
                        <div>
                            <p className="font-extrabold text-sm uppercase tracking-wide">New Path Unlocked</p>
                            <p className="font-bold text-lg leading-5">{unlockBanner}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Stats Bar */}
            <div className="sticky top-0 bg-gray-900/80 backdrop-blur-md z-20 border-b-2 border-gray-800 p-4 flex justify-between items-center shadow-sm">
                {/* Logo visible only on mobile, desktop handled by Layout Sidebar */}
                <div className="md:hidden font-black text-2xl text-duo-green flex items-center tracking-tighter">
                   VIKSIT
                </div>
                <div className="hidden md:block font-black text-gray-400 text-sm uppercase tracking-widest">
                    Learning Path
                </div>

                <div className="flex space-x-6 font-black text-gray-100">
                    <div className="flex items-center space-x-2 bg-gray-800/50 px-3 py-1.5 rounded-2xl border-2 border-gray-700 shadow-inner hover:bg-gray-800 transition-colors cursor-default">
                        <Flame size={20} className="text-orange-500 fill-orange-500/20" />
                        <span className="text-sm">{user.currentStreak}</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-800/50 px-3 py-1.5 rounded-2xl border-2 border-gray-700 shadow-inner hover:bg-gray-800 transition-colors cursor-default">
                        <span className="text-sm font-black text-blue-400">XP</span>
                        <span className="text-sm">{user.xp}</span>
                    </div>
                </div>
            </div>

            {/* Path View Component */}
            <div className="w-full">
                {modules.length > 0 ? <LearningPath modules={modules} /> : (
                    <div className="flex flex-col items-center justify-center p-20 text-gray-500 space-y-4 animate-pulse">
                        <div className="w-16 h-16 bg-gray-800 rounded-full"></div>
                        <p className="font-bold tracking-widest uppercase text-xs">Loading Modules...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;

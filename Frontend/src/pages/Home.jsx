import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getModules, getUserProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Flame } from 'lucide-react';
import LearningPath from '../components/LearningPath';

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
            {/* Top Stats Bar */}
            <div className="sticky top-0 bg-white z-10 border-b-2 border-gray-200 p-4 flex justify-between items-center shadow-sm">
                {/* Logo visible only on mobile, desktop handled by Layout Sidebar */}
                <div className="md:hidden font-extrabold text-2xl text-duo-green flex items-center tracking-tight">
                   Viksit
                </div>
                <div className="hidden md:block font-bold text-gray-400 text-lg">
                    Learning Path
                </div>

                <div className="flex space-x-6 font-bold text-gray-600">
                    <div className="flex items-center space-x-1 text-orange-500">
                        <Flame size={24} />
                        <span>{user.currentStreak}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-duo-blue">
                        <span className="text-xl px-1">XP</span>
                        <span>{user.xp}</span>
                    </div>
                </div>
            </div>

            {/* Path View Component */}
            {modules.length > 0 ? <LearningPath modules={modules} /> : <div className="p-8 text-center text-gray-500">Loading modules...</div>}
        </div>
    );
};

export default Home;

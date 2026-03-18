import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, User, ShieldCheck, Trophy, Map, ChartBar } from 'lucide-react';

const navItems = [
    { name: 'Learn', icon: <Home size={28} />, path: '/home' },
    { name: 'Leaderboard', icon: <Trophy size={28} />, path: '/leaderboard' },
    { name: 'Quests', icon: <Map size={28} />, path: '/quests' },
    { name: 'Trading', icon: <ChartBar size={28} />, path: '/trading' },
    { name: 'Profile', icon: <User size={28} />, path: '/profile' },
];

const Layout = ({ children }) => {
    return (
        <div className="flex h-screen bg-white md:bg-gray-100 overflow-hidden font-sans">

            {/* Desktop Sidebar (md: and up) */}
            <aside className="hidden md:flex flex-col w-64 h-full bg-white border-r-2 border-gray-200 z-20 shrink-0">
                <div className="p-6">
                    <h1 className="text-3xl font-extrabold text-duo-green mb-8 tracking-tight">Viksit</h1>
                    <nav className="flex flex-col space-y-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center space-x-4 px-4 py-3 rounded-xl transition-colors ${
                                        isActive
                                        ? 'bg-blue-50 text-duo-blue border-2 border-blue-200 font-bold'
                                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 font-semibold border-2 border-transparent'
                                    }`
                                }
                            >
                                {item.icon}
                                <span className="text-lg">{item.name}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Main Content Area (Scrollable Column) */}
            <main className="flex-1 h-full overflow-y-auto w-full flex justify-center pb-24 md:pb-0">
                <div className="w-full max-w-[600px] bg-white min-h-full border-x-0 md:border-x-2 border-gray-200 shadow-sm relative">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation (Hidden on md:) */}
            <nav className="md:hidden fixed bottom-0 w-full bg-white border-t-2 border-gray-200 flex justify-around p-3 z-20 pb-safe">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${
                                isActive ? 'text-duo-blue bg-blue-50 border-2 border-blue-200' : 'text-gray-400 border-2 border-transparent'
                            }`
                        }
                    >
                        {item.icon}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default Layout;

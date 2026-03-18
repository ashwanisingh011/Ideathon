import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PathNode = ({ module, index, state }) => {
    const navigate = useNavigate();

    // Stagger logic for winding path
    const getOffset = (idx) => {
        const pattern = [0, -40, -60, -40, 0, 40, 60, 40]; // Pixel offsets from center
        return pattern[idx % pattern.length];
    };

    const offset = getOffset(index);

    let btnClasses = "w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all border-[3px]";
    let shadowClasses = "";

    if (state === 'LOCKED') {
        btnClasses += " bg-gray-800 border-gray-700 text-gray-600 opacity-80";
        shadowClasses = "shadow-[0_8px_0_#1f2937]";
    } else if (state === 'CURRENT') {
        btnClasses += " bg-duo-green border-white text-white z-10 animate-pulse-dark ring-[6px] ring-duo-green/40 hover:bg-duo-green-dark";
        shadowClasses = "shadow-[0_8px_0_#2e7d32] active:translate-y-[8px] active:shadow-none";
    } else if (state === 'COMPLETED') {
        btnClasses += " bg-duo-yellow border-white text-white shadow-xl";
        shadowClasses = "shadow-[0_8px_0_#f9a825] active:translate-y-[8px] active:shadow-none";
    }

    const handleClick = () => {
        if (state === 'LOCKED') {
            alert("Complete previous modules first!");
        } else {
            // Navigate to Story Mode passing the module ID
            navigate(`/story/${module._id}`);
        }
    };

    return (
        <div
            className="flex justify-center w-full py-6 relative"
            style={{ transform: `translateX(${offset}px)` }}
        >
            <button
                onClick={handleClick}
                className={`${btnClasses} ${shadowClasses}`}
            >
               {state === 'COMPLETED' ? <Check strokeWidth={4} size={36}/> : <Star strokeWidth={3} fill={state === 'CURRENT' ? 'white' : 'transparent'} size={36} />}
            </button>
        </div>
    );
};

const LearningPath = ({ modules }) => {
    const { user } = useAuth();
    const orderedModules = [...modules].sort((a, b) => (a.order || 0) - (b.order || 0));

    // Three visible units mapped by module order.
    const units = [
        {
            title: "Securing Digital India",
            subtitle: "UPI Safety",
            bgColor: "bg-duo-blue",
            btnColor: "bg-duo-blue-dark",
            modules: orderedModules.filter((m) => m.order === 1)
        },
        {
            title: "Fueling India's Growth",
            subtitle: "Stock Market Basics",
            bgColor: "bg-duo-green",
            btnColor: "bg-duo-green-dark",
            modules: orderedModules.filter((m) => m.order === 2)
        },
        {
            title: "Building Responsible Citizens",
            subtitle: "Taxation 101",
            bgColor: "bg-orange-500",
            btnColor: "bg-orange-700",
            modules: orderedModules.filter((m) => m.order === 3)
        }
    ];

    // Dynamic progress state based on user's unlockedModules
    // For MVP: a module is CURRENT if it is unlocked and the *next* module in the sequence is NOT unlocked.
    // If it is unlocked AND the next module is unlocked, it is COMPLETED.
    // Otherwise, it is LOCKED.
    const getNodeState = (module) => {
        if (!user || !user.unlockedModules) return module.order <= 2 ? 'CURRENT' : 'LOCKED';

        // Find index of this module in the global modules list
        const currentIndex = orderedModules.findIndex(m => m._id === module._id);

        // Baseline unlock: UPI + Stocks are available immediately.
        const isStarterUnlocked = module.order <= 2;
        const isUnlockedFromProfile = user.unlockedModules.some(m => m._id === module._id || m === module._id);
        const isUnlocked = isStarterUnlocked || isUnlockedFromProfile;

        if (!isUnlocked) return 'LOCKED';

        // If there's a next module, check if it's unlocked
        if (currentIndex < orderedModules.length - 1) {
            const nextModule = orderedModules[currentIndex + 1];
            const isNextUnlocked = nextModule.order <= 2 || user.unlockedModules.some(m => m._id === nextModule._id || m === nextModule._id);
            if (isNextUnlocked) {
                return 'COMPLETED';
            }
        } else {
             // If it's the very last module and it's unlocked, let's just make it CURRENT for now
             // Or if we had a "fully completed path" state, we could use that.
        }

        return 'CURRENT';
    };

    return (
        <div className="flex flex-col w-full pb-20 max-w-2xl mx-auto">
            {units.map((unit, unitIdx) => (
                <div key={unitIdx} className="mb-12">
                    {/* Unit Header */}
                    <div className={`mx-4 rounded-2xl ${unit.bgColor} p-6 mb-10 text-white relative shadow-lg border-b-4 border-black/30 transform transition-transform hover:scale-[1.01]`}>
                        <div className="relative z-10">
                            <h2 className="font-black text-xl uppercase tracking-widest mb-1 opacity-70">Unit {unitIdx + 1}</h2>
                            <p className="font-extrabold text-2xl mb-1">{unit.title}</p>
                            <p className="font-bold text-sm opacity-90">{unit.subtitle}</p>
                        </div>
                        {/* Decorative Background Element */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                            <Star size={80} fill="white" />
                        </div>
                    </div>

                    {/* Winding Path Nodes */}
                    <div className="flex flex-col items-center justify-center space-y-2">
                        {unit.modules.map((mod, i) => {
                            const state = getNodeState(mod);
                            const node = <PathNode key={mod._id} module={mod} index={i} state={state} />;
                            return node;
                        })}
                        {/* Fill with empty mock nodes if less than 5 to show winding pattern */}
                                {unit.modules.length < 3 && Array.from({length: 3 - unit.modules.length}).map((_, i) => (
                             <PathNode
                                key={`mock-${unitIdx}-${i}`}
                                module={{_id: 'mock'}}
                                index={unit.modules.length + i}
                                state='LOCKED'
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LearningPath;

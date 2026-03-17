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
        btnClasses += " bg-[#E5E5E5] border-[#E5E5E5] text-gray-400 opacity-80";
        shadowClasses = "shadow-[0_8px_0_#B3B3B3]";
    } else if (state === 'CURRENT') {
        btnClasses += " bg-duo-green border-white text-white z-10 animate-pulse ring-[6px] ring-duo-green/40";
        shadowClasses = "shadow-[0_8px_0_#58A700] hover:translate-y-[2px] hover:shadow-[0_6px_0_#58A700] active:translate-y-[8px] active:shadow-none";
    } else if (state === 'COMPLETED') {
        btnClasses += " bg-[#FFC800] border-[#FFC800] text-white";
        shadowClasses = "shadow-[0_8px_0_#D7A700] hover:translate-y-[2px] hover:shadow-[0_6px_0_#D7A700] active:translate-y-[8px] active:shadow-none";
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
    // Mock Units for MVP - grouping the modules
    const units = [
        {
            title: "Securing Digital India",
            subtitle: "UPI Safety",
            bgColor: "bg-duo-blue",
            btnColor: "bg-duo-blue-dark",
            modules: modules.slice(0, 3) // Assuming first few are UPI
        },
        {
            title: "Fueling India's Growth",
            subtitle: "Stock Market Basics",
            bgColor: "bg-duo-green",
            btnColor: "bg-duo-green-dark",
            modules: modules.slice(3)
        }
    ];

    // Dynamic progress state based on user's unlockedModules
    // For MVP: a module is CURRENT if it is unlocked and the *next* module in the sequence is NOT unlocked.
    // If it is unlocked AND the next module is unlocked, it is COMPLETED.
    // Otherwise, it is LOCKED.
    const getNodeState = (module) => {
        if (!user || !user.unlockedModules) return 'LOCKED';

        // Find index of this module in the global modules list
        const currentIndex = modules.findIndex(m => m._id === module._id);

        // Check if this module is in user's unlockedModules
        // Also automatically unlock the very first module for brand new users
        const isUnlocked = currentIndex === 0 || user.unlockedModules.some(m => m._id === module._id || m === module._id);

        if (!isUnlocked) return 'LOCKED';

        // If there's a next module, check if it's unlocked
        if (currentIndex < modules.length - 1) {
            const nextModule = modules[currentIndex + 1];
            const isNextUnlocked = user.unlockedModules.some(m => m._id === nextModule._id || m === nextModule._id);
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
        <div className="flex flex-col w-full pb-20">
            {units.map((unit, unitIdx) => (
                <div key={unitIdx} className="mb-12">
                    {/* Unit Header */}
                    <div className={`w-full ${unit.bgColor} p-6 mb-8 text-white relative flex justify-between items-center`}>
                        <div>
                            <h2 className="font-extrabold text-2xl uppercase tracking-wider mb-1">Unit {unitIdx + 1}</h2>
                            <p className="font-bold text-lg opacity-90">{unit.title}</p>
                            <p className="font-semibold text-sm opacity-80">{unit.subtitle}</p>
                        </div>
                    </div>

                    {/* Winding Path Nodes */}
                    <div className="flex flex-col items-center justify-center">
                        {unit.modules.map((mod, i) => {
                            const state = getNodeState(mod);
                            const node = <PathNode key={mod._id} module={mod} index={i} state={state} />;
                            return node;
                        })}
                        {/* Fill with empty mock nodes if less than 5 to show winding pattern */}
                        {unit.modules.length < 5 && Array.from({length: 5 - unit.modules.length}).map((_, i) => (
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

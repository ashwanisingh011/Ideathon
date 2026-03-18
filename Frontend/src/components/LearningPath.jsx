import { useNavigate } from 'react-router-dom';
import { Star, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const normalizeId = (value) => {
    if (value == null) return null;
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    if (typeof value === 'object') {
        if (value._id != null) return String(value._id);
        if (value.id != null) return String(value.id);
    }
    return null;
};

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
        btnClasses += " bg-gray-200 border-gray-300 text-gray-400 opacity-80";
        shadowClasses = "shadow-[0_8px_0_#e5e7eb]";
    } else if (state === 'CURRENT') {
        btnClasses += " bg-duo-green border-white text-white z-10 animate-blink ring-[6px] ring-duo-green/40 hover:animate-blink hover:bg-duo-green-dark";
        shadowClasses = "shadow-[0_8px_0_#2e7d32] active:translate-y-[8px] active:shadow-none";
    } else if (state === 'COMPLETED') {
        btnClasses += " bg-duo-yellow border-white text-white shadow-xl";
        shadowClasses = "shadow-[0_8px_0_#f9a825] active:translate-y-[8px] active:shadow-none";
    }

    const handleClick = () => {
        if (state === 'LOCKED') {
            alert("Complete the previous lesson in this unit first.");
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
    const LESSONS_PER_UNIT = 3;

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

    const unlockedModuleIds = new Set(
        (user?.unlockedModules || [])
            .map((entry) => normalizeId(entry))
            .filter(Boolean)
    );

    const completedCountsByModule = (user?.completedLessons || []).reduce((acc, lesson) => {
        const moduleId = normalizeId(lesson?.moduleId);
        if (!moduleId) return acc;
        acc[moduleId] = (acc[moduleId] || 0) + 1;
        return acc;
    }, {});

    // Dynamic lesson-node state within one unit/module:
    // - COMPLETED: node index is lower than completed lesson count
    // - CURRENT: first not-yet-completed node
    // - LOCKED: any node after CURRENT
    const getNodeState = (module, lessonIndex) => {
        const moduleId = normalizeId(module?._id);
        if (!moduleId) return 'LOCKED';

        // First classes in all units should be available by default for smooth onboarding.
        const isStarterUnlocked = Number(module?.order) <= 3;
        const isUnlockedFromProfile = unlockedModuleIds.has(moduleId);
        const isUnlocked = isStarterUnlocked || isUnlockedFromProfile;

        if (!isUnlocked) return 'LOCKED';

        const completedCountRaw = completedCountsByModule[moduleId] || 0;
        const completedCount = Math.min(completedCountRaw, LESSONS_PER_UNIT);

        if (lessonIndex < completedCount) return 'COMPLETED';
        if (lessonIndex === completedCount) return 'CURRENT';
        return 'LOCKED';
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

                    {/* Winding Path Nodes (3 lesson levels per unit/module) */}
                    <div className="flex flex-col items-center justify-center">
                        {unit.modules.map((mod) => (
                            Array.from({ length: LESSONS_PER_UNIT }).map((_, lessonIndex) => (
                                <PathNode
                                    key={`${mod._id}-lesson-${lessonIndex}`}
                                    module={mod}
                                    index={lessonIndex}
                                    state={getNodeState(mod, lessonIndex)}
                                />
                            ))
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LearningPath;

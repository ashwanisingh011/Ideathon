import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X } from 'lucide-react';

// Hardcoded story data for MVP Demo
const storyContent = {
    'upi-safety': [
        { id: 1, title: 'What is UPI?', text: 'UPI is your digital wallet. It lets you send money instantly from your bank.', color: 'bg-duo-blue' },
        { id: 2, title: 'The Golden Rule', text: 'NEVER share your UPI PIN to receive money. PIN is ONLY used when YOU are paying someone.', color: 'bg-duo-yellow-dark' },
        { id: 3, title: 'Phishing Links', text: 'Scammers send fake "You Won ₹5000" links. Clicking them can drain your account.', color: 'bg-duo-red' },
        { id: 4, title: 'Ready for the Test?', text: 'Let’s see if you can spot a scammer in our interactive swipe game.', color: 'bg-duo-green' }
    ]
};

const StoryCard = () => {
    const { moduleId } = useParams();
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [progress, setProgress] = useState(0);

    // Using a default story for MVP to guarantee content loads regardless of dynamic moduleId
    const slides = storyContent['upi-safety'];

    useEffect(() => {
        // Auto-advance progress bar simulating Instagram story timing (e.g. 5s per slide)
        const timer = setInterval(() => {
            setProgress((oldProgress) => {
                if (oldProgress === 100) {
                    handleNextSlide();
                    return 0;
                }
                return Math.min(oldProgress + 2, 100); // 100 / 50 ticks = 50 * 100ms = 5 seconds
            });
        }, 100);

        return () => clearInterval(timer);
    }, [currentSlide]);

    const handleNextSlide = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
            setProgress(0);
        } else {
            // End of story, transition to the interactive swipe lesson
            navigate(`/module/${moduleId}/lessons`);
        }
    };

    const handlePrevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
            setProgress(0);
        }
    };

    const handleScreenClick = (e) => {
        const screenWidth = window.innerWidth;
        const clickX = e.clientX;
        // Tap right 70% of screen goes next, left 30% goes back
        if (clickX > screenWidth * 0.3) {
            handleNextSlide();
        } else {
            handlePrevSlide();
        }
    };

    const currentData = slides[currentSlide];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">

            {/* Desktop Constraints (looks like a phone screen on desktop) */}
            <div
                onClick={handleScreenClick}
                className={`w-full h-full max-w-[450px] md:h-[85vh] md:rounded-3xl shadow-2xl relative overflow-hidden flex flex-col transition-colors duration-500 ${currentData.color}`}
            >

                {/* Story Progress Bars Top Navigation */}
                <div className="absolute top-0 w-full p-4 flex gap-2 z-10 pt-safe">
                    {slides.map((_, idx) => (
                        <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white transition-all duration-100 ease-linear"
                                style={{
                                    width: idx === currentSlide ? `${progress}%` : (idx < currentSlide ? '100%' : '0%')
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Close Button */}
                <button
                    onClick={(e) => { e.stopPropagation(); navigate('/home'); }}
                    className="absolute top-8 right-4 z-20 text-white opacity-80 hover:opacity-100"
                >
                    <X size={32} />
                </button>

                {/* Slide Content */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-white mt-12">
                    <h1 className="text-4xl font-extrabold mb-6 drop-shadow-md">{currentData.title}</h1>
                    <p className="text-2xl font-bold opacity-90 leading-relaxed drop-shadow-sm">
                        {currentData.text}
                    </p>
                </div>

                {/* Interactive Hint Bottom */}
                <div className="absolute bottom-10 w-full text-center text-white/50 text-sm font-bold animate-pulse pointer-events-none">
                    Tap to continue
                </div>
            </div>

        </div>
    );
};

export default StoryCard;

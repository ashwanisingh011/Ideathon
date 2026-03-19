import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { generateModuleAIContent, getModuleContentBundle } from '../services/api';

const cardColors = ['bg-duo-blue', 'bg-duo-yellow-dark', 'bg-duo-red', 'bg-duo-green'];
const FRESHNESS_WINDOW_MS = 24 * 60 * 60 * 1000;

const isFresh = (timestamp) => {
    if (!timestamp) return false;
    return Date.now() - new Date(timestamp).getTime() < FRESHNESS_WINDOW_MS;
};

const mapSlides = (cards = []) => cards.map((card, index) => ({
    id: card.order || index + 1,
    title: card.title,
    text: card.text,
    color: cardColors[index % cardColors.length],
}));

const fallbackSlide = {
    id: 1,
    title: 'AI Content Unavailable',
    text: 'We could not generate AI learning content right now. Please try again in a moment.',
    color: 'bg-duo-blue',
};

const StoryCard = () => {
    const { moduleId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [progress, setProgress] = useState(0);
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadModuleStory = async () => {
            if (!user) {
                navigate('/');
                return;
            }

            try {
                const bundleRes = await getModuleContentBundle(moduleId);
                const bundle = bundleRes.data || {};
                const bundleCards = bundle.module?.learningCards || [];
                const moduleFresh = isFresh(bundle.module?.aiGeneratedAt);
                const lessons = Array.isArray(bundle.lessons) ? bundle.lessons : [];
                const hasQuestionsForEachLesson = lessons.length > 0 && lessons.every(
                    (lesson) => Array.isArray(lesson.questions) && lesson.questions.length > 0
                );
                const hasAIQuestionsOnly = lessons.length > 0 && lessons.every(
                    (lesson) => Array.isArray(lesson.questions) && lesson.questions.every((q) => q?.generationSource === 'ai')
                );
                const hasBundleContent = bundleCards.length > 0 && hasQuestionsForEachLesson && hasAIQuestionsOnly;

                if (hasBundleContent && moduleFresh) {
                    const mappedFromBundle = mapSlides(bundleCards);
                    setSlides(mappedFromBundle.length ? mappedFromBundle : [fallbackSlide]);
                    return;
                }

                const generated = await generateModuleAIContent(moduleId, {
                    username: user.username,
                    questionsPerLesson: 5,
                    regenerate: true,
                });

                const generatedCards = generated.data?.module?.learningCards || [];
                const mappedGenerated = mapSlides(generatedCards);
                setSlides(mappedGenerated.length ? mappedGenerated : [fallbackSlide]);
            } catch (error) {
                setSlides([fallbackSlide]);
            } finally {
                setLoading(false);
            }
        };

        loadModuleStory();
    }, [moduleId, navigate, user]);

    useEffect(() => {
        if (loading || !slides.length) return;

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
    }, [currentSlide, loading, slides.length]);

    const handleNextSlide = () => {
        const isErrorSlide = slides.length === 1 && slides[0]?.title === 'AI Content Unavailable';
        if (isErrorSlide) {
            navigate('/home');
            return;
        }

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
        if (loading || !slides.length) return;
        const screenWidth = window.innerWidth;
        const clickX = e.clientX;
        // Tap right 70% of screen goes next, left 30% goes back
        if (clickX > screenWidth * 0.3) {
            handleNextSlide();
        } else {
            handlePrevSlide();
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white">
                <p className="text-xl font-bold">Generating AI learning cards...</p>
            </div>
        );
    }

    const currentData = slides[currentSlide] || {
        title: 'Learning Journey',
        text: 'Tap to continue',
        color: 'bg-duo-blue',
    };

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

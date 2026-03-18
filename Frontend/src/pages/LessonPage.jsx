import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLessons, getQuestions, updateProgress } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight } from 'lucide-react';

const LessonPage = () => {
    const { moduleId } = useParams();
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    const [lessonData, setLessonData] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswerChecked, setIsAnswerChecked] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [loading, setLoading] = useState(true);
    const [attemptsLeft, setAttemptsLeft] = useState(2);
    const [shake, setShake] = useState(false);
    const [earnedXP, setEarnedXP] = useState(0);

    useEffect(() => {
        const fetchContent = async () => {
            if(!user) return navigate('/');
            try {
                // Fetch first lesson of module (For MVP)
                const lessonsRes = await getLessons(moduleId);
                const lesson = lessonsRes.data[0];
                setLessonData(lesson);

                // Fetch questions
                const qRes = await getQuestions(lesson._id);
                setQuestions(qRes.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                navigate('/home');
            }
        };
        fetchContent();
    }, [moduleId]);

    const handleCheck = () => {
        if(selectedOption === null) return;
        const currentQ = questions[currentIndex];
        const correct = selectedOption === currentQ.correctOptionIndex;

        setIsCorrect(correct);
        setIsAnswerChecked(true);

        if (correct) {
            // Give XP based on attempts left BEFORE this check
            // If they had 2 attempts left when they answered, they get 10 XP.
            // If they had 1 attempt left, they get 5 XP.
            let xpToGaint = 0;
            if (attemptsLeft === 2) xpToGaint = 10;
            else if (attemptsLeft === 1) xpToGaint = 5;

            setEarnedXP(prev => prev + xpToGaint);
        } else {
            setShake(true);
            setTimeout(() => setShake(false), 500);
            if (attemptsLeft > 0) {
                setAttemptsLeft(prev => prev - 1);
            }
        }
    };

    const handleRetry = () => {
        setIsAnswerChecked(false);
        setSelectedOption(null);
    };

    const handleNext = async () => {
        if(currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswerChecked(false);
            setAttemptsLeft(2);
        } else {
            // Finish lesson
            try {
                const res = await updateProgress({
                    username: user.username,
                    lessonId: lessonData._id,
                    xpGained: earnedXP,
                    moduleId
                });
                setUser(res.data); // Update context with new XP
                navigate('/home');
            } catch(e) {
                console.error(e);
            }
        }
    };

    if(loading) return <div className="text-center p-8 font-bold text-gray-500">Loading lesson...</div>;
    if(!questions.length) return <div className="text-center p-8 text-gray-500">No content for this lesson yet.</div>;

    const currentQ = questions[currentIndex];
    const progressPercent = ((currentIndex) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-white flex flex-col">

            {/* Top Progress Bar */}
            <div className="p-4 flex items-center space-x-4">
                <button onClick={() => navigate('/home')} className="text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>
                <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        className="h-full bg-duo-green"
                    />
                </div>
            </div>

            {/* Question Container */}
            <div className="flex-1 p-6 flex flex-col items-center">
                <div className="w-full flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Select the correct option</h2>
                    <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                        {attemptsLeft} attempts left
                    </span>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ x: 50, opacity: 0 }}
                        animate={shake ? { x: [-10, 10, -10, 10, 0] } : { x: 0, opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        exit={{ x: -50, opacity: 0 }}
                        className="w-full max-w-md"
                    >
                        <p className="text-xl font-semibold mb-8 text-gray-700">{currentQ.text}</p>

                        <div className="space-y-4">
                            {currentQ.options.map((opt, idx) => {
                                const isSelected = selectedOption === idx;
                                let btnClasses = "w-full text-left p-4 rounded-xl border-2 font-bold text-lg transition-all shadow-[0_4px_0_0] ";

                                if (!isAnswerChecked) {
                                    btnClasses += isSelected
                                        ? "border-duo-blue bg-blue-50 text-duo-blue shadow-duo-blue translate-y-[2px]"
                                        : "border-gray-200 text-gray-700 hover:bg-gray-50 shadow-gray-200 hover:border-gray-300";
                                } else {
                                    if(idx === currentQ.correctOptionIndex) {
                                        btnClasses += "border-duo-green bg-green-50 text-duo-green shadow-duo-green";
                                    } else if(isSelected) {
                                        btnClasses += "border-red-400 bg-red-50 text-red-500 shadow-red-400";
                                    } else {
                                        btnClasses += "border-gray-200 text-gray-400 shadow-gray-200 opacity-50";
                                    }
                                }

                                return (
                                    <button
                                        key={idx}
                                        disabled={isAnswerChecked}
                                        onClick={() => setSelectedOption(idx)}
                                        className={btnClasses}
                                    >
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom Check Bar */}
            <div className={`p-6 border-t-2 border-gray-200 flex flex-col items-center justify-between min-h-[140px] transition-colors ${isAnswerChecked ? (isCorrect ? 'bg-green-100' : 'bg-red-100') : 'bg-white'}`}>

                {isAnswerChecked && (
                    <div className={`w-full max-w-md flex font-bold text-xl mb-4 ${isCorrect ? 'text-duo-green-dark' : 'text-red-500'}`}>
                        {isCorrect ? (
                            <span className="flex items-center"><Check className="mr-2" size={32}/> Excellent!</span>
                        ) : (
                            <span className="flex items-center"><X className="mr-2" size={32}/> {attemptsLeft > 0 ? 'Oops, try again!' : 'Incorrect'}</span>
                        )}
                    </div>
                )}

                {!isAnswerChecked ? (
                    <button
                        onClick={handleCheck}
                        disabled={selectedOption === null}
                        className={`w-full max-w-md text-white font-bold py-4 rounded-xl text-lg shadow-[0_4px_0_0] active:translate-y-[4px] active:shadow-none transition-all ${selectedOption !== null ? 'bg-duo-green shadow-[#58a700]' : 'bg-gray-300 shadow-[#b3b3b3] text-gray-400'}`}
                    >
                        CHECK
                    </button>
                ) : (
                    <>
                        {isCorrect || attemptsLeft === 0 ? (
                            <button
                                onClick={handleNext}
                                className={`w-full max-w-md text-white font-bold py-4 rounded-xl text-lg shadow-[0_4px_0_0] active:translate-y-[4px] active:shadow-none transition-all ${isCorrect ? 'bg-duo-green shadow-[#58a700]' : 'bg-red-500 shadow-[#d32f2f]'}`}
                            >
                                CONTINUE
                            </button>
                        ) : (
                            <button
                                onClick={handleRetry}
                                className={`w-full max-w-md text-white font-bold py-4 rounded-xl text-lg shadow-[0_4px_0_0] active:translate-y-[4px] active:shadow-none transition-all bg-red-500 shadow-[#d32f2f]`}
                            >
                                RETRY
                            </button>
                        )}
                    </>
                )}
            </div>

        </div>
    );
};

export default LessonPage;

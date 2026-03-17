import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import Question from '../models/Question.js';

export const getModules = async (req, res) => {
  try {
    const modules = await Module.find().sort({ order: 1 });
    res.status(200).json(modules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLessonsByModule = async (req, res) => {
  try {
    const lessons = await Lesson.find({ moduleId: req.params.moduleId }).sort({ order: 1 });
    res.status(200).json(lessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getQuestionsByLesson = async (req, res) => {
  try {
    const questions = await Question.find({ lessonId: req.params.lessonId });
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

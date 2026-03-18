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

export const getModuleContentBundle = async (req, res) => {
  try {
    const moduleDoc = await Module.findById(req.params.moduleId);
    if (!moduleDoc) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const lessons = await Lesson.find({ moduleId: req.params.moduleId }).sort({ order: 1 });
    const lessonIds = lessons.map((lesson) => lesson._id);
    const questions = await Question.find({ lessonId: { $in: lessonIds } });

    const questionsByLessonId = questions.reduce((acc, question) => {
      const key = question.lessonId.toString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(question);
      return acc;
    }, {});

    const lessonBundle = lessons.map((lesson) => ({
      ...lesson.toObject(),
      questions: questionsByLessonId[lesson._id.toString()] || [],
    }));

    res.status(200).json({
      module: {
        _id: moduleDoc._id,
        title: moduleDoc.title,
        description: moduleDoc.description,
        order: moduleDoc.order,
        learningCards: moduleDoc.learningCards || [],
        aiGeneratedAt: moduleDoc.aiGeneratedAt,
      },
      lessons: lessonBundle,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

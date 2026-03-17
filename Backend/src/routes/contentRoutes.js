import express from 'express';
import { getModules, getLessonsByModule, getQuestionsByLesson } from '../controllers/contentController.js';

const router = express.Router();

router.get('/modules', getModules);
router.get('/modules/:moduleId/lessons', getLessonsByModule);
router.get('/lessons/:lessonId/questions', getQuestionsByLesson);

export default router;
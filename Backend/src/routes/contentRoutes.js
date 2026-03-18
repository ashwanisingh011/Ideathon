import express from 'express';
import { getModules, getLessonsByModule, getModuleContentBundle, getQuestionsByLesson } from '../controllers/contentController.js';

const router = express.Router();

router.get('/modules', getModules);
router.get('/modules/:moduleId/lessons', getLessonsByModule);
router.get('/modules/:moduleId/bundle', getModuleContentBundle);
router.get('/lessons/:lessonId/questions', getQuestionsByLesson);

export default router;
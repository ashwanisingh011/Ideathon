import express from 'express';
import { generateDailyContest, generateModuleContent, generateNewQuestion, getOrCreateCurrentDayContest } from '../controllers/aiController.js';

const router = express.Router();

router.post('/generate-question', generateNewQuestion);
router.post('/daily-contest', generateDailyContest);
router.get('/daily-contest/:username/current', getOrCreateCurrentDayContest);
router.post('/module-content/:moduleId', generateModuleContent);

export default router;

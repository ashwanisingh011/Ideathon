import express from 'express';
import { generateDailyContest, generateNewQuestion, getOrCreateCurrentDayContest } from '../controllers/aiController.js';

const router = express.Router();

router.post('/generate-question', generateNewQuestion);
router.post('/daily-contest', generateDailyContest);
router.get('/daily-contest/:username/current', getOrCreateCurrentDayContest);

export default router;

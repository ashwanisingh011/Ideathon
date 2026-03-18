import express from 'express';
import { getUserProfile, updateProgress, getLeaderboard } from '../controllers/userController.js';

const router = express.Router();

router.get('/leaderboard', getLeaderboard);
router.get('/:username', getUserProfile);
router.post('/progress', updateProgress);

export default router;

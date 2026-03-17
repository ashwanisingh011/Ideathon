import express from 'express';
import { loginUser, getUserProfile, updateProgress } from '../controllers/userController.js';

const router = express.Router();

router.post('/login', loginUser);
router.get('/:username', getUserProfile);
router.post('/progress', updateProgress);

export default router;

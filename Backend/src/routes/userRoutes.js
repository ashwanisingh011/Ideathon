import express from 'express';
import { getUserProfile, updateProgress } from '../controllers/userController.js';

const router = express.Router();

router.get('/:username', getUserProfile);
router.post('/progress', updateProgress);
// router.get('/stats/:username' , getUserStats);

export default router;

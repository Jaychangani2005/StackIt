import express from 'express';
import auth from '../middleware/auth.js';
import usersController from '../controllers/usersController.js';

const router = express.Router();

// Public routes
router.get('/:id', usersController.getUserById);

// Protected routes
router.get('/profile/me', auth, usersController.getCurrentUser);
router.put('/profile/me', auth, usersController.updateProfile);
router.get('/profile/me/questions', auth, usersController.getUserQuestions);
router.get('/profile/me/answers', auth, usersController.getUserAnswers);

export default router; 
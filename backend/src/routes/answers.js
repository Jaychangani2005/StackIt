import express from 'express';
import auth from '../middleware/auth.js';
import answersController from '../controllers/answersController.js';

const router = express.Router();

// Public routes
router.get('/question/:questionId', answersController.getAnswersByQuestion);

// Protected routes
router.post('/', auth, answersController.createAnswer);
router.put('/:id', auth, answersController.updateAnswer);
router.delete('/:id', auth, answersController.deleteAnswer);
router.post('/:id/vote', auth, answersController.voteAnswer);

export default router; 
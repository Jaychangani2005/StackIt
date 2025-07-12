import express from 'express';
import auth from '../middleware/auth.js';
import questionsController from '../controllers/questionsController.js';

const router = express.Router();

// Public routes
router.get('/', questionsController.getAllQuestions);
router.get('/:id', questionsController.getQuestionById);
router.get('/:id/answers', questionsController.getQuestionAnswers);

// Protected routes
router.post('/', auth, questionsController.createQuestion);
router.put('/:id', auth, questionsController.updateQuestion);
router.delete('/:id', auth, questionsController.deleteQuestion);
router.post('/:id/vote', auth, questionsController.voteQuestion);
router.post('/:id/accept-answer/:answerId', auth, questionsController.acceptAnswer);

export default router; 
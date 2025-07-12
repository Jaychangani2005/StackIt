import express from 'express';
import { body, validationResult } from 'express-validator';
import { executeQuery } from '../config/database.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/answers
// @desc    Create a new answer
// @access  Private
router.post('/', protect, [
  body('content').isLength({ min: 10 }).withMessage('Answer must be at least 10 characters'),
  body('question_id').isInt().withMessage('Valid question ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { content, question_id } = req.body;
    const userId = req.user.id;

    // Check if question exists
    const questions = await executeQuery(
      'SELECT id FROM questions WHERE id = ?',
      [question_id]
    );

    if (questions.length === 0) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    const result = await executeQuery(
      'INSERT INTO answers (content, question_id, user_id) VALUES (?, ?, ?)',
      [content, question_id, userId]
    );

    const [newAnswer] = await executeQuery(`
      SELECT 
        a.*,
        u.username as author_username
      FROM answers a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      data: newAnswer
    });
  } catch (error) {
    console.error('Create answer error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   PUT /api/answers/:id
// @desc    Update an answer
// @access  Private
router.put('/:id', protect, [
  body('content').isLength({ min: 10 }).withMessage('Answer must be at least 10 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Check if answer exists and user owns it
    const answers = await executeQuery(
      'SELECT user_id FROM answers WHERE id = ?',
      [id]
    );

    if (answers.length === 0) {
      return res.status(404).json({ success: false, error: 'Answer not found' });
    }

    if (answers[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await executeQuery(
      'UPDATE answers SET content = ?, updated_at = NOW() WHERE id = ?',
      [content, id]
    );

    const [updatedAnswer] = await executeQuery(`
      SELECT 
        a.*,
        u.username as author_username
      FROM answers a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.id = ?
    `, [id]);

    res.json({
      success: true,
      data: updatedAnswer
    });
  } catch (error) {
    console.error('Update answer error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   DELETE /api/answers/:id
// @desc    Delete an answer
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if answer exists and user owns it
    const answers = await executeQuery(
      'SELECT user_id FROM answers WHERE id = ?',
      [id]
    );

    if (answers.length === 0) {
      return res.status(404).json({ success: false, error: 'Answer not found' });
    }

    if (answers[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // Delete related votes first
    await executeQuery('DELETE FROM votes WHERE answer_id = ?', [id]);
    await executeQuery('DELETE FROM answers WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Answer deleted successfully'
    });
  } catch (error) {
    console.error('Delete answer error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   POST /api/answers/:id/accept
// @desc    Accept an answer (mark as best answer)
// @access  Private
router.post('/:id/accept', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get answer with question info
    const answers = await executeQuery(`
      SELECT a.*, q.user_id as question_user_id
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      WHERE a.id = ?
    `, [id]);

    if (answers.length === 0) {
      return res.status(404).json({ success: false, error: 'Answer not found' });
    }

    const answer = answers[0];

    // Only question author can accept answers
    if (answer.question_user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only question author can accept answers' });
    }

    // Unaccept all other answers for this question
    await executeQuery(
      'UPDATE answers SET is_accepted = 0 WHERE question_id = ?',
      [answer.question_id]
    );

    // Accept this answer
    await executeQuery(
      'UPDATE answers SET is_accepted = 1 WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Answer accepted successfully'
    });
  } catch (error) {
    console.error('Accept answer error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   POST /api/answers/:id/vote
// @desc    Vote on an answer
// @access  Private
router.post('/:id/vote', protect, [
  body('vote_type').isIn(['up', 'down']).withMessage('Vote type must be up or down')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const { vote_type } = req.body;
    const userId = req.user.id;

    // Check if answer exists
    const answers = await executeQuery(
      'SELECT id FROM answers WHERE id = ?',
      [id]
    );

    if (answers.length === 0) {
      return res.status(404).json({ success: false, error: 'Answer not found' });
    }

    // Check if user already voted
    const existingVotes = await executeQuery(
      'SELECT id, vote_type FROM votes WHERE answer_id = ? AND user_id = ?',
      [id, userId]
    );

    if (existingVotes.length > 0) {
      const existingVote = existingVotes[0];
      
      if (existingVote.vote_type === vote_type) {
        // Remove vote if same type
        await executeQuery(
          'DELETE FROM votes WHERE id = ?',
          [existingVote.id]
        );
      } else {
        // Update vote if different type
        await executeQuery(
          'UPDATE votes SET vote_type = ? WHERE id = ?',
          [vote_type, existingVote.id]
        );
      }
    } else {
      // Create new vote
      await executeQuery(
        'INSERT INTO votes (answer_id, user_id, vote_type) VALUES (?, ?, ?)',
        [id, userId, vote_type]
      );
    }

    res.json({
      success: true,
      message: 'Vote recorded successfully'
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router; 
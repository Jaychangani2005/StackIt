import express from 'express';
import { body, validationResult } from 'express-validator';
import { executeQuery } from '../config/database.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const [user] = await executeQuery(`
      SELECT 
        id,
        username,
        email,
        role,
        created_at,
        updated_at
      FROM users 
      WHERE id = ?
    `, [userId]);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Get user stats
    const [questionCount] = await executeQuery(
      'SELECT COUNT(*) as count FROM questions WHERE user_id = ?',
      [userId]
    );

    const [answerCount] = await executeQuery(
      'SELECT COUNT(*) as count FROM answers WHERE user_id = ?',
      [userId]
    );

    const [reputation] = await executeQuery(`
      SELECT 
        COALESCE(SUM(
          CASE 
            WHEN v.vote_type = 'up' THEN 10
            WHEN v.vote_type = 'down' THEN -2
            ELSE 0
          END
        ), 0) as reputation
      FROM users u
      LEFT JOIN questions q ON u.id = q.user_id
      LEFT JOIN answers a ON u.id = a.user_id
      LEFT JOIN votes v ON (q.id = v.question_id OR a.id = v.answer_id)
      WHERE u.id = ?
    `, [userId]);

    res.json({
      success: true,
      data: {
        ...user,
        stats: {
          questions: questionCount.count,
          answers: answerCount.count,
          reputation: reputation.reputation
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update current user profile
// @access  Private
router.put('/profile', protect, [
  body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').optional().isEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const userId = req.user.id;
    const { username, email } = req.body;

    // Check if username or email already exists
    if (username || email) {
      const existingUser = await executeQuery(
        'SELECT id FROM users WHERE (email = ? OR username = ?) AND id != ?',
        [email || req.user.email, username || req.user.username, userId]
      );

      if (existingUser.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Username or email already exists' 
        });
      }
    }

    // Build update query
    const updates = [];
    const params = [];

    if (username) {
      updates.push('username = ?');
      params.push(username);
    }

    if (email) {
      updates.push('email = ?');
      params.push(email);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    updates.push('updated_at = NOW()');
    params.push(userId);

    await executeQuery(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const [updatedUser] = await executeQuery(`
      SELECT 
        id,
        username,
        email,
        role,
        created_at,
        updated_at
      FROM users 
      WHERE id = ?
    `, [userId]);

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [user] = await executeQuery(`
      SELECT 
        id,
        username,
        role,
        created_at
      FROM users 
      WHERE id = ?
    `, [id]);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Get user stats
    const [questionCount] = await executeQuery(
      'SELECT COUNT(*) as count FROM questions WHERE user_id = ?',
      [id]
    );

    const [answerCount] = await executeQuery(
      'SELECT COUNT(*) as count FROM answers WHERE user_id = ?',
      [id]
    );

    const [reputation] = await executeQuery(`
      SELECT 
        COALESCE(SUM(
          CASE 
            WHEN v.vote_type = 'up' THEN 10
            WHEN v.vote_type = 'down' THEN -2
            ELSE 0
          END
        ), 0) as reputation
      FROM users u
      LEFT JOIN questions q ON u.id = q.user_id
      LEFT JOIN answers a ON u.id = a.user_id
      LEFT JOIN votes v ON (q.id = v.question_id OR a.id = v.answer_id)
      WHERE u.id = ?
    `, [id]);

    // Get recent questions
    const recentQuestions = await executeQuery(`
      SELECT 
        id,
        title,
        views,
        created_at,
        (SELECT COUNT(*) FROM answers WHERE question_id = q.id) as answer_count
      FROM questions q
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `, [id]);

    // Get recent answers
    const recentAnswers = await executeQuery(`
      SELECT 
        a.id,
        a.content,
        a.created_at,
        q.title as question_title,
        q.id as question_id
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      WHERE a.user_id = ?
      ORDER BY a.created_at DESC
      LIMIT 5
    `, [id]);

    res.json({
      success: true,
      data: {
        ...user,
        stats: {
          questions: questionCount.count,
          answers: answerCount.count,
          reputation: reputation.reputation
        },
        recentQuestions,
        recentAnswers
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   GET /api/users/:id/questions
// @desc    Get questions by user ID
// @access  Public
router.get('/:id/questions', async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const questions = await executeQuery(`
      SELECT 
        q.id,
        q.title,
        q.content,
        q.tags,
        q.views,
        q.created_at,
        q.updated_at,
        COUNT(DISTINCT a.id) as answer_count,
        COUNT(DISTINCT v.id) as vote_count
      FROM questions q
      LEFT JOIN answers a ON q.id = a.question_id
      LEFT JOIN votes v ON q.id = v.question_id
      WHERE q.user_id = ?
      GROUP BY q.id
      ORDER BY q.created_at DESC
      LIMIT ? OFFSET ?
    `, [id, limit, offset]);

    const [countResult] = await executeQuery(
      'SELECT COUNT(*) as total FROM questions WHERE user_id = ?',
      [id]
    );

    res.json({
      success: true,
      data: questions,
      pagination: {
        page,
        limit,
        total: countResult.total,
        pages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Get user questions error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   GET /api/users/:id/answers
// @desc    Get answers by user ID
// @access  Public
router.get('/:id/answers', async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const answers = await executeQuery(`
      SELECT 
        a.id,
        a.content,
        a.is_accepted,
        a.created_at,
        a.updated_at,
        q.title as question_title,
        q.id as question_id,
        COUNT(v.id) as vote_count
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      LEFT JOIN votes v ON a.id = v.answer_id
      WHERE a.user_id = ?
      GROUP BY a.id
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `, [id, limit, offset]);

    const [countResult] = await executeQuery(
      'SELECT COUNT(*) as total FROM answers WHERE user_id = ?',
      [id]
    );

    res.json({
      success: true,
      data: answers,
      pagination: {
        page,
        limit,
        total: countResult.total,
        pages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Get user answers error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const users = await executeQuery(`
      SELECT 
        id,
        username,
        email,
        role,
        created_at,
        updated_at
      FROM users
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    const [countResult] = await executeQuery('SELECT COUNT(*) as total FROM users');

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total: countResult.total,
        pages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router; 
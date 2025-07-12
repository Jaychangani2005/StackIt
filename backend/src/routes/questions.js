import express from 'express';
import { body, validationResult } from 'express-validator';
import { executeQuery } from '../config/database.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/questions
// @desc    Get all questions with pagination
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const tag = req.query.tag || '';

    let whereClause = '';
    let params = [];

    if (search) {
      whereClause += 'WHERE (q.title LIKE ? OR q.content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (tag) {
      whereClause += whereClause ? ' AND ' : 'WHERE ';
      whereClause += 'q.tags LIKE ?';
      params.push(`%${tag}%`);
    }

    // Get questions with user info and answer count
    const questions = await executeQuery(`
      SELECT 
        q.id,
        q.title,
        q.content,
        q.tags,
        q.views,
        q.created_at,
        q.updated_at,
        u.username as author_username,
        u.id as author_id,
        COUNT(DISTINCT a.id) as answer_count,
        COUNT(DISTINCT v.id) as vote_count
      FROM questions q
      LEFT JOIN users u ON q.user_id = u.id
      LEFT JOIN answers a ON q.id = a.question_id
      LEFT JOIN votes v ON q.id = v.question_id
      ${whereClause}
      GROUP BY q.id
      ORDER BY q.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    // Get total count
    const [countResult] = await executeQuery(`
      SELECT COUNT(*) as total
      FROM questions q
      ${whereClause}
    `, params);

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
    console.error('Get questions error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   GET /api/questions/:id
// @desc    Get single question by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Increment view count
    await executeQuery(
      'UPDATE questions SET views = views + 1 WHERE id = ?',
      [id]
    );

    // Get question with user info
    const questions = await executeQuery(`
      SELECT 
        q.*,
        u.username as author_username,
        u.id as author_id
      FROM questions q
      LEFT JOIN users u ON q.user_id = u.id
      WHERE q.id = ?
    `, [id]);

    if (questions.length === 0) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    const question = questions[0];

    // Get answers for this question
    const answers = await executeQuery(`
      SELECT 
        a.*,
        u.username as author_username,
        u.id as author_id,
        COUNT(v.id) as vote_count
      FROM answers a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN votes v ON a.id = v.answer_id
      WHERE a.question_id = ?
      GROUP BY a.id
      ORDER BY a.is_accepted DESC, a.created_at ASC
    `, [id]);

    res.json({
      success: true,
      data: {
        ...question,
        answers
      }
    });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   POST /api/questions
// @desc    Create a new question
// @access  Private
router.post('/', protect, [
  body('title').isLength({ min: 10, max: 200 }).withMessage('Title must be between 10 and 200 characters'),
  body('content').isLength({ min: 20 }).withMessage('Content must be at least 20 characters'),
  body('tags').isArray({ min: 1, max: 5 }).withMessage('Must provide 1-5 tags')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, content, tags } = req.body;
    const userId = req.user.id;

    const result = await executeQuery(
      'INSERT INTO questions (title, content, tags, user_id) VALUES (?, ?, ?, ?)',
      [title, content, JSON.stringify(tags), userId]
    );

    const [newQuestion] = await executeQuery(`
      SELECT 
        q.*,
        u.username as author_username
      FROM questions q
      LEFT JOIN users u ON q.user_id = u.id
      WHERE q.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      data: newQuestion
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   PUT /api/questions/:id
// @desc    Update a question
// @access  Private
router.put('/:id', protect, [
  body('title').isLength({ min: 10, max: 200 }).withMessage('Title must be between 10 and 200 characters'),
  body('content').isLength({ min: 20 }).withMessage('Content must be at least 20 characters'),
  body('tags').isArray({ min: 1, max: 5 }).withMessage('Must provide 1-5 tags')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const { title, content, tags } = req.body;
    const userId = req.user.id;

    // Check if question exists and user owns it
    const questions = await executeQuery(
      'SELECT user_id FROM questions WHERE id = ?',
      [id]
    );

    if (questions.length === 0) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    if (questions[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await executeQuery(
      'UPDATE questions SET title = ?, content = ?, tags = ?, updated_at = NOW() WHERE id = ?',
      [title, content, JSON.stringify(tags), id]
    );

    const [updatedQuestion] = await executeQuery(`
      SELECT 
        q.*,
        u.username as author_username
      FROM questions q
      LEFT JOIN users u ON q.user_id = u.id
      WHERE q.id = ?
    `, [id]);

    res.json({
      success: true,
      data: updatedQuestion
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   DELETE /api/questions/:id
// @desc    Delete a question
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if question exists and user owns it
    const questions = await executeQuery(
      'SELECT user_id FROM questions WHERE id = ?',
      [id]
    );

    if (questions.length === 0) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    if (questions[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // Delete related records first (answers, votes, etc.)
    await executeQuery('DELETE FROM votes WHERE question_id = ?', [id]);
    await executeQuery('DELETE FROM answers WHERE question_id = ?', [id]);
    await executeQuery('DELETE FROM questions WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router; 
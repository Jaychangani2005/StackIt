import db from '../config/database.js';

// Get current user profile
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT id, name, email, reputation, created_at
      FROM users
      WHERE id = ?
    `;
    
    const [users] = await db.query(query, [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[0];
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      reputation: user.reputation,
      createdAt: user.created_at
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT id, name, reputation, created_at
      FROM users
      WHERE id = ?
    `;
    
    const [users] = await db.query(query, [id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[0];
    
    res.json({
      id: user.id,
      name: user.name,
      reputation: user.reputation,
      createdAt: user.created_at
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    await db.query('UPDATE users SET name = ? WHERE id = ?', [name, userId]);
    
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Get user's questions
export const getUserQuestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT 
        q.*,
        GROUP_CONCAT(t.name) as tags
      FROM questions q
      LEFT JOIN question_tags qt ON q.id = qt.question_id
      LEFT JOIN tags t ON qt.tag_id = t.id
      WHERE q.user_id = ?
      GROUP BY q.id
      ORDER BY q.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [questions] = await db.query(query, [userId, parseInt(limit), offset]);
    
    const formattedQuestions = questions.map(q => ({
      id: q.id,
      title: q.title,
      description: q.description,
      tags: q.tags ? q.tags.split(',') : [],
      votes: q.vote_count,
      answers: q.answer_count,
      views: q.view_count,
      createdAt: q.created_at,
      hasAcceptedAnswer: q.has_accepted_answer === 1
    }));
    
    res.json(formattedQuestions);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Get user's answers
export const getUserAnswers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT 
        a.*,
        q.title as question_title,
        q.id as question_id
      FROM answers a
      LEFT JOIN questions q ON a.question_id = q.id
      WHERE a.user_id = ?
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [answers] = await db.query(query, [userId, parseInt(limit), offset]);
    
    const formattedAnswers = answers.map(a => ({
      id: a.id,
      content: a.content,
      votes: a.vote_count,
      isAccepted: a.is_accepted === 1,
      createdAt: a.created_at,
      question: {
        id: a.question_id,
        title: a.question_title
      }
    }));
    
    res.json(formattedAnswers);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

export default {
  getCurrentUser,
  getUserById,
  updateProfile,
  getUserQuestions,
  getUserAnswers
}; 
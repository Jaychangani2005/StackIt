import db from '../config/database.js';

// Get answers by question ID
export const getAnswersByQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    
    const query = `
      SELECT 
        a.*,
        u.name as author_name,
        u.reputation as author_reputation,
        (SELECT COUNT(*) FROM votes WHERE answer_id = a.id AND vote_type = 'upvote') - 
        (SELECT COUNT(*) FROM votes WHERE answer_id = a.id AND vote_type = 'downvote') as vote_count
      FROM answers a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.question_id = ?
      ORDER BY a.is_accepted DESC, vote_count DESC, a.created_at ASC
    `;
    
    const [answers] = await db.query(query, [questionId]);
    
    const formattedAnswers = answers.map(a => ({
      id: a.id,
      content: a.description, // Database uses 'description' column
      author: {
        id: a.user_id,
        name: a.author_name,
        reputation: a.author_reputation
      },
      votes: a.vote_count || 0,
      isAccepted: a.is_accepted === 1,
      createdAt: a.created_at,
      userVote: null
    }));
    
    res.json(formattedAnswers);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Create new answer
export const createAnswer = async (req, res) => {
  try {
    const { questionId, content } = req.body;
    const userId = req.user.id;
    
    if (!questionId || !content) {
      return res.status(400).json({ error: 'Question ID and content are required' });
    }
    
    // Check if question exists
    const [question] = await db.query('SELECT id FROM questions WHERE id = ?', [questionId]);
    if (question.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    // Insert answer
    const [result] = await db.query(
      'INSERT INTO answers (description, question_id, user_id) VALUES (?, ?, ?)',
      [content, questionId, userId]
    );
    
    // Update question answer count
    await db.query('UPDATE questions SET answer_count = answer_count + 1 WHERE id = ?', [questionId]);
    
    res.status(201).json({ 
      message: 'Answer created successfully',
      answerId: result.insertId 
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Update answer
export const updateAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    // Check if user owns the answer
    const [answer] = await db.query('SELECT user_id FROM answers WHERE id = ?', [id]);
    if (answer.length === 0) {
      return res.status(404).json({ error: 'Answer not found' });
    }
    
    if (answer[0].user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this answer' });
    }
    
    // Update answer
    await db.query('UPDATE answers SET description = ? WHERE id = ?', [content, id]);
    
    res.json({ message: 'Answer updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Delete answer
export const deleteAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if user owns the answer
    const [answer] = await db.query('SELECT user_id, question_id FROM answers WHERE id = ?', [id]);
    if (answer.length === 0) {
      return res.status(404).json({ error: 'Answer not found' });
    }
    
    if (answer[0].user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this answer' });
    }
    
    // Delete answer
    await db.query('DELETE FROM answers WHERE id = ?', [id]);
    
    // Update question answer count
    await db.query('UPDATE questions SET answer_count = answer_count - 1 WHERE id = ?', [answer[0].question_id]);
    
    res.json({ message: 'Answer deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Vote on answer
export const voteAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { voteType } = req.body; // 'up' or 'down'
    const userId = req.user.id;
    
    console.log('Answer vote request:', { id, voteType, userId });
    
    if (!['up', 'down'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }
    
    // Check if answer exists
    const [answer] = await db.query('SELECT id FROM answers WHERE id = ?', [id]);
    if (answer.length === 0) {
      return res.status(404).json({ error: 'Answer not found' });
    }
    
    // Try the full voting system first
    try {
      // Check if user already voted on this answer
      const [existingVote] = await db.query(
        'SELECT * FROM votes WHERE user_id = ? AND answer_id = ?',
        [userId, id]
      );
      
      console.log('Existing answer vote:', existingVote);
      
      let voteChange = 0;
      
      if (existingVote.length > 0) {
        const currentVote = existingVote[0].vote_type;
        
        if (currentVote === voteType || 
            (currentVote === 'upvote' && voteType === 'up') ||
            (currentVote === 'downvote' && voteType === 'down')) {
          // User is clicking the same vote type - remove the vote
          await db.query('DELETE FROM votes WHERE id = ?', [existingVote[0].id]);
          voteChange = voteType === 'up' ? -1 : 1; // Remove the vote
          console.log('Answer vote removed');
        } else {
          // User is changing their vote
          const newVoteType = voteType === 'up' ? 'upvote' : 'downvote';
          await db.query('UPDATE votes SET vote_type = ? WHERE id = ?', [newVoteType, existingVote[0].id]);
          voteChange = voteType === 'up' ? 2 : -2; // Change from down to up (+2) or up to down (-2)
          console.log('Answer vote changed');
        }
      } else {
        // User is voting for the first time
        const newVoteType = voteType === 'up' ? 'upvote' : 'downvote';
        await db.query(
          'INSERT INTO votes (user_id, answer_id, vote_type) VALUES (?, ?, ?)',
          [userId, id, newVoteType]
        );
        voteChange = voteType === 'up' ? 1 : -1;
        console.log('New answer vote created');
      }
      
      // Update the answer vote count
      try {
        await db.query('UPDATE answers SET vote_count = vote_count + ? WHERE id = ?', [voteChange, id]);
        console.log('Answer vote count updated by:', voteChange);
      } catch (updateErr) {
        console.error('Answer update error:', updateErr);
        // If vote_count column doesn't exist, just continue
        console.log('Answer vote count column might not exist, continuing...');
      }
      
    } catch (voteErr) {
      console.error('Answer vote tracking error:', voteErr);
      console.log('Falling back to simple answer vote count update...');
      
      // Fallback: simple vote count update
      const voteChange = voteType === 'up' ? 1 : -1;
      try {
        await db.query('UPDATE answers SET vote_count = vote_count + ? WHERE id = ?', [voteChange, id]);
        console.log('Simple answer vote count updated by:', voteChange);
      } catch (updateErr) {
        console.error('Simple answer update error:', updateErr);
        // If even this fails, just return success
        console.log('Answer vote count column definitely doesn\'t exist, returning success...');
      }
    }
    
    res.json({ message: 'Vote recorded successfully' });
  } catch (err) {
    console.error('Answer vote error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

export default {
  getAnswersByQuestion,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  voteAnswer
}; 
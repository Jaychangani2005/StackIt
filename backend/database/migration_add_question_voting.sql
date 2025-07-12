-- Migration to add question voting support
-- Add missing columns to questions table
ALTER TABLE questions 
ADD COLUMN vote_count INT DEFAULT 0,
ADD COLUMN answer_count INT DEFAULT 0,
ADD COLUMN has_accepted_answer TINYINT(1) DEFAULT 0;

-- Add question_id column to votes table to support question voting
ALTER TABLE votes 
ADD COLUMN question_id INT NULL,
ADD CONSTRAINT fk_votes_question_id FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE;

-- Update vote_type enum to support 'up' and 'down' values
ALTER TABLE votes 
MODIFY COLUMN vote_type ENUM('upvote', 'downvote', 'up', 'down') NOT NULL;

-- Add unique constraint for user voting on questions
ALTER TABLE votes 
ADD UNIQUE KEY unique_user_question (user_id, question_id);

-- Add index for question votes
ALTER TABLE votes 
ADD INDEX idx_question_votes (question_id, vote_type); 
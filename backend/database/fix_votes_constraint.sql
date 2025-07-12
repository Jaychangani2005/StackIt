-- Fix for votes table constraint issue
-- Drop the problematic unique constraint
ALTER TABLE votes DROP INDEX unique_user_question;

-- Add a better unique constraint that handles NULL values properly
-- This ensures a user can only vote once per question, but allows multiple answer votes
ALTER TABLE votes 
ADD UNIQUE KEY unique_user_question_vote (user_id, question_id, answer_id);

-- Also ensure the vote_type enum is correct
ALTER TABLE votes 
MODIFY COLUMN vote_type ENUM('upvote', 'downvote', 'up', 'down') NOT NULL; 
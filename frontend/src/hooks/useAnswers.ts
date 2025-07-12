import { useState } from 'react';
import { api } from '@/lib/api';

interface Answer {
  id: string;
  content: string;
  author: {
    id: number;
    name: string;
    reputation: number;
  };
  votes: number;
  userVote: 'up' | 'down' | null;
  isAccepted: boolean;
  createdAt: string;
  updatedAt?: string;
  commentCount?: number;
}

interface UseAnswersProps {
  questionId: string;
  onAnswerPosted?: (answer: Answer) => void;
  onAnswerUpdated?: (answerId: string, updates: Partial<Answer>) => void;
  onAnswerDeleted?: (answerId: string) => void;
}

export const useAnswers = ({
  questionId,
  onAnswerPosted,
  onAnswerUpdated,
  onAnswerDeleted
}: UseAnswersProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const postAnswer = async (content: string): Promise<void> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await api.createAnswer({
        questionId,
        content
      });
      
      if (onAnswerPosted) {
        // Create a mock answer object from the response
        const newAnswer: Answer = {
          id: response.answerId,
          content,
          author: {
            id: 0, // Will be filled by the API response
            name: 'Current User',
            reputation: 0
          },
          votes: 0,
          userVote: null,
          isAccepted: false,
          createdAt: new Date().toISOString()
        };
        onAnswerPosted(newAnswer);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to post answer';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const voteAnswer = async (answerId: string, voteType: 'up' | 'down'): Promise<void> => {
    try {
      await api.voteAnswer(answerId, voteType);
      
      if (onAnswerUpdated) {
        // Update the answer with new vote count (this would come from API response)
        onAnswerUpdated(answerId, {
          userVote: voteType
        });
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to vote on answer';
      setError(errorMessage);
      throw err;
    }
  };

  const acceptAnswer = async (answerId: string): Promise<void> => {
    try {
      await api.acceptAnswer(questionId, answerId);
      
      if (onAnswerUpdated) {
        onAnswerUpdated(answerId, { isAccepted: true });
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to accept answer';
      setError(errorMessage);
      throw err;
    }
  };

  const editAnswer = async (answerId: string, content: string): Promise<void> => {
    try {
      await api.updateAnswer(answerId, { content });
      
      if (onAnswerUpdated) {
        onAnswerUpdated(answerId, {
          content,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to edit answer';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteAnswer = async (answerId: string): Promise<void> => {
    try {
      await api.deleteAnswer(answerId);
      
      if (onAnswerDeleted) {
        onAnswerDeleted(answerId);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete answer';
      setError(errorMessage);
      throw err;
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    postAnswer,
    voteAnswer,
    acceptAnswer,
    editAnswer,
    deleteAnswer,
    isSubmitting,
    error,
    clearError
  };
}; 
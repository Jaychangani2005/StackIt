import { useState } from 'react';

interface Answer {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    reputation: number;
  };
  votes: number;
  userVote: 'up' | 'down' | null;
  isAccepted: boolean;
  createdAt: Date;
  updatedAt?: Date;
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

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  };

  const postAnswer = async (content: string): Promise<void> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/answers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          content,
          question_id: questionId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to post answer');
      }

      const data = await response.json();
      
      if (data.success && onAnswerPosted) {
        onAnswerPosted(data.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to post answer';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const voteAnswer = async (answerId: string, voteType: 'up' | 'down'): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/answers/${answerId}/vote`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ vote_type: voteType })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to vote on answer');
      }

      const data = await response.json();
      
      if (data.success && onAnswerUpdated) {
        // Update the answer with new vote count
        onAnswerUpdated(answerId, {
          votes: data.data.votes,
          userVote: data.data.userVote
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to vote on answer';
      setError(errorMessage);
      throw err;
    }
  };

  const acceptAnswer = async (answerId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/answers/${answerId}/accept`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to accept answer');
      }

      const data = await response.json();
      
      if (data.success && onAnswerUpdated) {
        onAnswerUpdated(answerId, { isAccepted: true });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept answer';
      setError(errorMessage);
      throw err;
    }
  };

  const editAnswer = async (answerId: string, content: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/answers/${answerId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to edit answer');
      }

      const data = await response.json();
      
      if (data.success && onAnswerUpdated) {
        onAnswerUpdated(answerId, {
          content: data.data.content,
          updatedAt: new Date()
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to edit answer';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteAnswer = async (answerId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/answers/${answerId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete answer');
      }

      const data = await response.json();
      
      if (data.success && onAnswerDeleted) {
        onAnswerDeleted(answerId);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete answer';
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
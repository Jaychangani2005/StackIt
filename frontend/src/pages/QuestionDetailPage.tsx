import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QuestionDetail } from '@/components/questions/QuestionDetail';
import { useAnswers } from '@/hooks/useAnswers';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Answer {
  id: string;
  content: string;
  author: {
    id: number;
    name: string;
    reputation: number;
  };
  votes: number;
  userVote?: 'up' | 'down' | null;
  isAccepted: boolean;
  createdAt: string;
  updatedAt?: string;
  commentCount?: number;
}

interface Question {
  id: string;
  title: string;
  description: string;
  tags: string[];
  author: {
    id: number;
    name: string;
    reputation: number;
  };
  votes: number;
  userVote: 'up' | 'down' | null;
  answers: Answer[];
  views: number;
  createdAt: string;
  hasAcceptedAnswer: boolean;
}

export const QuestionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [question, setQuestion] = useState<Question | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    postAnswer,
    voteAnswer,
    acceptAnswer,
    editAnswer,
    deleteAnswer,
    isSubmitting: isSubmittingAnswer,
    error: answerError,
    clearError: clearAnswerError
  } = useAnswers({
    questionId: id || '',
    onAnswerPosted: (newAnswer) => {
      if (question) {
        setQuestion({
          ...question,
          answers: [...question.answers, newAnswer]
        });
        toast({
          title: 'Answer posted successfully!',
          description: 'Your answer has been added to the question.',
        });
      }
    },
    onAnswerUpdated: (answerId, updates) => {
      if (question) {
        setQuestion({
          ...question,
          answers: question.answers.map(answer =>
            answer.id === answerId ? { ...answer, ...updates } : answer
          )
        });
        toast({
          title: 'Answer updated successfully!',
          description: 'Your answer has been updated.',
        });
      }
    },
    onAnswerDeleted: (answerId) => {
      if (question) {
        setQuestion({
          ...question,
          answers: question.answers.filter(answer => answer.id !== answerId)
        });
        toast({
          title: 'Answer deleted successfully!',
          description: 'Your answer has been removed.',
        });
      }
    }
  });

  useEffect(() => {
    const loadQuestion = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch question details
        const questionData = await api.getQuestionById(id);
        
        // Fetch answers for the question
        const answers = await api.getQuestionAnswers(id);
        
        // Combine question and answers
        const fullQuestion: Question = {
          ...questionData,
          answers: answers
        };
        
        setQuestion(fullQuestion);
        
        // Try to get current user if authenticated
        try {
          const user = await api.getCurrentUser();
          setCurrentUser(user);
        } catch (userError) {
          // User not authenticated, that's okay
          console.log('User not authenticated');
        }
        
      } catch (err: any) {
        console.error('Error loading question:', err);
        setError(err.message || 'Failed to load question');
        toast({
          title: 'Error loading question',
          description: err.message || 'Failed to load question details.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadQuestion();
  }, [id, toast]);

  const handleVoteQuestion = async (vote: 'up' | 'down') => {
    if (!question || !id) return;
    
    try {
      await api.voteQuestion(id, vote);
      
      // Update local state
      setQuestion({
        ...question,
        votes: question.votes + (vote === 'up' ? 1 : -1),
        userVote: vote
      });
      
      toast({
        title: 'Vote recorded!',
        description: `Your ${vote}vote has been recorded.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error voting',
        description: error.message || 'Failed to record your vote.',
        variant: 'destructive',
      });
    }
  };

  const handleVoteAnswer = async (answerId: string, vote: 'up' | 'down') => {
    try {
      await voteAnswer(answerId, vote);
    } catch (error: any) {
      toast({
        title: 'Error voting on answer',
        description: error.message || 'Failed to record your vote.',
        variant: 'destructive',
      });
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    try {
      await acceptAnswer(answerId);
      
      // Update question to show it has an accepted answer
      if (question) {
        setQuestion({
          ...question,
          hasAcceptedAnswer: true
        });
      }
      
      toast({
        title: 'Answer accepted!',
        description: 'This answer has been marked as the accepted solution.',
      });
    } catch (error: any) {
      toast({
        title: 'Error accepting answer',
        description: error.message || 'Failed to accept the answer.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitAnswer = async (content: string) => {
    try {
      await postAnswer(content);
      clearAnswerError();
    } catch (error: any) {
      toast({
        title: 'Error posting answer',
        description: error.message || 'Failed to post your answer.',
        variant: 'destructive',
      });
    }
  };

  const handleEditAnswer = (answerId: string) => {
    // In a real app, you would navigate to an edit page or open an edit modal
    console.log('Edit answer:', answerId);
    toast({
      title: 'Edit functionality',
      description: 'Edit answer functionality will be implemented soon.',
    });
  };

  const handleDeleteAnswer = async (answerId: string) => {
    try {
      await deleteAnswer(answerId);
    } catch (error: any) {
      toast({
        title: 'Error deleting answer',
        description: error.message || 'Failed to delete the answer.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            {error || 'Question not found'}
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button 
        variant="outline" 
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Questions
      </Button>

      <QuestionDetail
        question={question}
        currentUser={currentUser}
        onVoteQuestion={handleVoteQuestion}
        onVoteAnswer={handleVoteAnswer}
        onAcceptAnswer={handleAcceptAnswer}
        onSubmitAnswer={handleSubmitAnswer}
        onEditAnswer={handleEditAnswer}
        onDeleteAnswer={handleDeleteAnswer}
        isSubmittingAnswer={isSubmittingAnswer}
        answerError={answerError}
      />
    </div>
  );
}; 
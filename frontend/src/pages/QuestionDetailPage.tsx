import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QuestionDetail } from '@/components/questions/QuestionDetail';
import { useAnswers } from '@/hooks/useAnswers';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface Question {
  id: string;
  title: string;
  content: string;
  tags: string[];
  author: {
    id: string;
    name: string;
    avatar?: string;
    reputation: number;
  };
  votes: number;
  userVote: 'up' | 'down' | null;
  answers: Answer[];
  views: number;
  createdAt: Date;
}

export const QuestionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [question, setQuestion] = useState<Question | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  const mockQuestion: Question = {
    id: '1',
    title: 'How to implement authentication in React with JWT?',
    content: `
      <p>I'm building a React application and need to implement user authentication using JWT tokens. I've been looking at various approaches but I'm not sure which one is the best practice.</p>
      
      <p>Here's what I need:</p>
      <ul>
        <li>User registration and login</li>
        <li>Token storage and management</li>
        <li>Protected routes</li>
        <li>Token refresh mechanism</li>
      </ul>
      
      <p>I'm using React Router for navigation and Axios for API calls. Any help would be greatly appreciated!</p>
    `,
    tags: ['react', 'authentication', 'jwt', 'javascript'],
    author: {
      id: '1',
      name: 'John Doe',
      avatar: 'https://github.com/shadcn.png',
      reputation: 1250
    },
    votes: 15,
    userVote: null,
    answers: [
      {
        id: '1',
        content: `
          <p>Here's a comprehensive approach to implement JWT authentication in React:</p>
          
          <h3>1. Create an Auth Context</h3>
          <pre><code>const AuthContext = createContext();</code></pre>
          
          <h3>2. Store tokens securely</h3>
          <p>Use httpOnly cookies or secure localStorage with proper expiration handling.</p>
          
          <h3>3. Implement protected routes</h3>
          <p>Create a PrivateRoute component that checks authentication status.</p>
        `,
        author: {
          id: '2',
          name: 'Jane Smith',
          avatar: 'https://github.com/shadcn.png',
          reputation: 2100
        },
        votes: 8,
        userVote: null,
        isAccepted: true,
        createdAt: new Date('2024-01-15T10:30:00Z'),
        commentCount: 3
      },
      {
        id: '2',
        content: `
          <p>I recommend using a library like <code>react-auth-kit</code> or <code>@auth0/auth0-react</code> for production applications. They handle many edge cases and security concerns automatically.</p>
          
          <p>For a custom implementation, make sure to:</p>
          <ul>
            <li>Implement token refresh logic</li>
            <li>Handle token expiration gracefully</li>
            <li>Use secure storage methods</li>
            <li>Implement proper error handling</li>
          </ul>
        `,
        author: {
          id: '3',
          name: 'Mike Johnson',
          avatar: 'https://github.com/shadcn.png',
          reputation: 850
        },
        votes: 5,
        userVote: null,
        isAccepted: false,
        createdAt: new Date('2024-01-15T14:20:00Z'),
        commentCount: 1
      }
    ],
    views: 245,
    createdAt: new Date('2024-01-15T09:00:00Z')
  };

  const mockCurrentUser = {
    id: '4',
    name: 'Current User',
    email: 'user@example.com',
    role: 'user'
  };

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
    questionId: id || '1',
    onAnswerPosted: (newAnswer) => {
      if (question) {
        setQuestion({
          ...question,
          answers: [...question.answers, newAnswer]
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
      }
    },
    onAnswerDeleted: (answerId) => {
      if (question) {
        setQuestion({
          ...question,
          answers: question.answers.filter(answer => answer.id !== answerId)
        });
      }
    }
  });

  useEffect(() => {
    // Simulate API call
    const loadQuestion = async () => {
      try {
        setLoading(true);
        // In a real app, you would fetch from API here
        await new Promise(resolve => setTimeout(resolve, 1000));
        setQuestion(mockQuestion);
        setCurrentUser(mockCurrentUser);
      } catch (err) {
        setError('Failed to load question');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadQuestion();
    }
  }, [id]);

  const handleVoteQuestion = (vote: 'up' | 'down') => {
    if (question) {
      setQuestion({
        ...question,
        votes: question.votes + (vote === 'up' ? 1 : -1),
        userVote: vote
      });
    }
  };

  const handleVoteAnswer = (answerId: string, vote: 'up' | 'down') => {
    voteAnswer(answerId, vote).catch(console.error);
  };

  const handleAcceptAnswer = (answerId: string) => {
    // Only one answer can be accepted at a time
    if (question) {
      setQuestion({
        ...question,
        answers: question.answers.map(a => ({
          ...a,
          isAccepted: a.id === answerId
        }))
      });
      toast({
        title: 'Answer accepted!',
        description: 'You have marked this answer as the best solution.',
      });
    }
    acceptAnswer(answerId).catch(console.error);
  };

  const handleSubmitAnswer = async (content: string) => {
    await postAnswer(content);
  };

  const handleEditAnswer = (answerId: string) => {
    // In a real app, you would navigate to an edit page or open an edit modal
    console.log('Edit answer:', answerId);
  };

  const handleDeleteAnswer = (answerId: string) => {
    deleteAnswer(answerId).catch(console.error);
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
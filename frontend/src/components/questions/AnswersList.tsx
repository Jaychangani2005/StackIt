import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Filter } from 'lucide-react';
import { AnswerCard } from './AnswerCard';
import { AnswerForm } from './AnswerForm';

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

interface AnswersListProps {
  questionId: string;
  questionAuthorId: string;
  answers: Answer[];
  currentUser: any;
  onVoteAnswer: (answerId: string, vote: 'up' | 'down') => void;
  onAcceptAnswer: (answerId: string) => void;
  onSubmitAnswer: (content: string) => Promise<void>;
  onEditAnswer?: (answerId: string) => void;
  onDeleteAnswer?: (answerId: string) => void;
  isSubmittingAnswer?: boolean;
  answerError?: string;
}

type SortOption = 'votes' | 'newest' | 'oldest' | 'accepted';

export const AnswersList = ({
  questionId,
  questionAuthorId,
  answers,
  currentUser,
  onVoteAnswer,
  onAcceptAnswer,
  onSubmitAnswer,
  onEditAnswer,
  onDeleteAnswer,
  isSubmittingAnswer = false,
  answerError
}: AnswersListProps) => {
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('votes');

  const sortAnswers = (answers: Answer[], sortOption: SortOption): Answer[] => {
    const sorted = [...answers];
    
    switch (sortOption) {
      case 'votes':
        return sorted.sort((a, b) => {
          // Accepted answers first
          if (a.isAccepted && !b.isAccepted) return -1;
          if (!a.isAccepted && b.isAccepted) return 1;
          // Then by votes
          return b.votes - a.votes;
        });
      
      case 'newest':
        return sorted.sort((a, b) => {
          // Accepted answers first
          if (a.isAccepted && !b.isAccepted) return -1;
          if (!a.isAccepted && b.isAccepted) return 1;
          // Then by creation date (newest first)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      
      case 'oldest':
        return sorted.sort((a, b) => {
          // Accepted answers first
          if (a.isAccepted && !b.isAccepted) return -1;
          if (!a.isAccepted && b.isAccepted) return 1;
          // Then by creation date (oldest first)
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });
      
      case 'accepted':
        return sorted.sort((a, b) => {
          // Accepted answers first
          if (a.isAccepted && !b.isAccepted) return -1;
          if (!a.isAccepted && b.isAccepted) return 1;
          // Then by votes
          return b.votes - a.votes;
        });
      
      default:
        return sorted;
    }
  };

  const sortedAnswers = sortAnswers(answers, sortBy);
  const acceptedAnswers = answers.filter(a => a.isAccepted);
  const regularAnswers = sortedAnswers.filter(a => !a.isAccepted);

  const handleSubmitAnswer = async (content: string) => {
    await onSubmitAnswer(content);
    setShowAnswerForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">
            {answers.length} Answer{answers.length !== 1 ? 's' : ''}
          </h2>
          
          {answers.length > 1 && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="votes">Most Voted</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="accepted">Accepted First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        {currentUser && !showAnswerForm && (
          <Button onClick={() => setShowAnswerForm(true)}>
            Post Answer
          </Button>
        )}
      </div>

      {/* Answer Form */}
      {showAnswerForm && (
        <AnswerForm
          questionId={questionId}
          onSubmit={handleSubmitAnswer}
          onCancel={() => setShowAnswerForm(false)}
          isSubmitting={isSubmittingAnswer}
          error={answerError}
        />
      )}

      {/* No Answers State */}
      {answers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No answers yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to answer this question!
            </p>
            {currentUser && !showAnswerForm && (
              <Button onClick={() => setShowAnswerForm(true)}>
                Post Answer
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Answers List */}
      {answers.length > 0 && (
        <div className="space-y-4">
          {/* Accepted Answers */}
          {acceptedAnswers.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-green-700 dark:text-green-400">
                Accepted Answer{acceptedAnswers.length !== 1 ? 's' : ''}
              </h3>
              {acceptedAnswers.map((answer) => (
                <AnswerCard
                  key={answer.id}
                  answer={answer}
                  questionAuthorId={questionAuthorId}
                  currentUser={currentUser}
                  onVote={onVoteAnswer}
                  onAccept={onAcceptAnswer}
                  onEdit={onEditAnswer}
                  onDelete={onDeleteAnswer}
                />
              ))}
            </div>
          )}

          {/* Regular Answers */}
          {regularAnswers.length > 0 && (
            <div className="space-y-4">
              {acceptedAnswers.length > 0 && (
                <h3 className="text-lg font-medium">
                  Other Answer{regularAnswers.length !== 1 ? 's' : ''}
                </h3>
              )}
              {regularAnswers.map((answer) => (
                <AnswerCard
                  key={answer.id}
                  answer={answer}
                  questionAuthorId={questionAuthorId}
                  currentUser={currentUser}
                  onVote={onVoteAnswer}
                  onAccept={onAcceptAnswer}
                  onEdit={onEditAnswer}
                  onDelete={onDeleteAnswer}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 
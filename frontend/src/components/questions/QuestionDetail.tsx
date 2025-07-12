import React, { useState } from 'react';
import { Eye, Calendar, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Voting } from '@/components/ui/voting';
import { AnswersList } from './AnswersList';

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

interface QuestionDetailProps {
  question: Question;
  currentUser: any;
  onVoteQuestion: (vote: 'up' | 'down') => void;
  onVoteAnswer: (answerId: string, vote: 'up' | 'down') => void;
  onAcceptAnswer: (answerId: string) => void;
  onSubmitAnswer: (content: string) => Promise<void>;
  onEditAnswer?: (answerId: string) => void;
  onDeleteAnswer?: (answerId: string) => void;
  isSubmittingAnswer?: boolean;
  answerError?: string;
}

export const QuestionDetail = ({
  question,
  currentUser,
  onVoteQuestion,
  onVoteAnswer,
  onAcceptAnswer,
  onSubmitAnswer,
  onEditAnswer,
  onDeleteAnswer,
  isSubmittingAnswer = false,
  answerError
}: QuestionDetailProps) => {

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };



  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Question */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            {/* Voting */}
            <Voting
              votes={question?.votes || 0}
              userVote={question?.userVote || null}
              onVote={onVoteQuestion}
              size="lg"
            />
            
            {/* Question content */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-4">{question?.title || 'Loading...'}</h1>
              
              {/* Question meta */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Asked {question?.createdAt ? formatTimeAgo(question.createdAt) : 'Loading...'}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {question?.views || 0} views
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {question?.answers?.length || 0} answers
                </div>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {question?.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                )) || []}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex gap-4">
            <div className="w-16 flex-shrink-0" /> {/* Spacer for alignment */}
            <div className="flex-1">
              {/* Question content */}
              <div 
                className="prose prose-sm max-w-none mb-6"
                dangerouslySetInnerHTML={{ __html: question?.description || 'Loading...' }}
              />
              
              {/* Author info */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {question?.author?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">{question?.author?.name || 'Unknown User'}</div>
                    <div className="text-xs text-muted-foreground">
                      {question?.author?.reputation || 0} reputation
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answers */}
      <AnswersList
        questionId={question?.id?.toString() || ''}
        questionAuthorId={question?.author?.id?.toString() || ''}
        answers={question?.answers || []}
        currentUser={currentUser}
        onVoteAnswer={onVoteAnswer}
        onAcceptAnswer={onAcceptAnswer}
        onSubmitAnswer={onSubmitAnswer}
        onEditAnswer={onEditAnswer}
        onDeleteAnswer={onDeleteAnswer}
        isSubmittingAnswer={isSubmittingAnswer}
        answerError={answerError}
      />
    </div>
  );
}; 
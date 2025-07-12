import React, { useState } from 'react';
import { MessageSquare, Eye, Calendar, User, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Voting } from '@/components/ui/voting';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Answer {
  id: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    reputation: number;
  };
  votes: number;
  userVote: 'up' | 'down' | null;
  isAccepted: boolean;
  createdAt: Date;
}

interface Question {
  id: string;
  title: string;
  content: string;
  tags: string[];
  author: {
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

interface QuestionDetailProps {
  question: Question;
  currentUser: any;
  onVoteQuestion: (vote: 'up' | 'down') => void;
  onVoteAnswer: (answerId: string, vote: 'up' | 'down') => void;
  onAcceptAnswer: (answerId: string) => void;
  onSubmitAnswer: (content: string) => void;
}

export const QuestionDetail = ({
  question,
  currentUser,
  onVoteQuestion,
  onVoteAnswer,
  onAcceptAnswer,
  onSubmitAnswer
}: QuestionDetailProps) => {
  const [answerContent, setAnswerContent] = useState('');
  const [answerDialogOpen, setAnswerDialogOpen] = useState(false);

  const formatTimeAgo = (date: Date) => {
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

  const handleSubmitAnswer = () => {
    if (answerContent.trim()) {
      onSubmitAnswer(answerContent);
      setAnswerContent('');
      setAnswerDialogOpen(false);
    }
  };

  const sortedAnswers = [...question.answers].sort((a, b) => {
    // Accepted answers first
    if (a.isAccepted && !b.isAccepted) return -1;
    if (!a.isAccepted && b.isAccepted) return 1;
    // Then by votes
    return b.votes - a.votes;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Question */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            {/* Voting */}
            <Voting
              votes={question.votes}
              userVote={question.userVote}
              onVote={onVoteQuestion}
              size="lg"
            />
            
            {/* Question content */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-4">{question.title}</h1>
              
              {/* Question meta */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Asked {formatTimeAgo(question.createdAt)}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {question.views} views
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {question.answers.length} answers
                </div>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {question.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
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
                dangerouslySetInnerHTML={{ __html: question.content }}
              />
              
              {/* Author info */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={question.author.avatar} />
                    <AvatarFallback>
                      {question.author.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">{question.author.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {question.author.reputation} reputation
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {question.answers.length} Answer{question.answers.length !== 1 ? 's' : ''}
          </h2>
          {currentUser && (
            <Dialog open={answerDialogOpen} onOpenChange={setAnswerDialogOpen}>
              <DialogTrigger asChild>
                <Button>Post Answer</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Post Your Answer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <RichTextEditor
                    content={answerContent}
                    onChange={setAnswerContent}
                    placeholder="Write your answer here..."
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSubmitAnswer} disabled={!answerContent.trim()}>
                      Post Answer
                    </Button>
                    <Button variant="outline" onClick={() => setAnswerDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {sortedAnswers.map((answer) => (
          <Card key={answer.id} className={answer.isAccepted ? 'border-green-500 bg-green-50/50' : ''}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Voting */}
                <Voting
                  votes={answer.votes}
                  userVote={answer.userVote}
                  onVote={(vote) => onVoteAnswer(answer.id, vote)}
                  isAccepted={answer.isAccepted}
                  onAccept={() => onAcceptAnswer(answer.id)}
                  canAccept={currentUser && question.author.name === currentUser.name && !answer.isAccepted}
                  size="md"
                />
                
                {/* Answer content */}
                <div className="flex-1">
                  {answer.isAccepted && (
                    <div className="flex items-center gap-2 mb-3">
                      <Check className="h-4 w-4 text-green-600" />
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Accepted Answer
                      </Badge>
                    </div>
                  )}
                  
                  <div 
                    className="prose prose-sm max-w-none mb-4"
                    dangerouslySetInnerHTML={{ __html: answer.content }}
                  />
                  
                  {/* Author info */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={answer.author.avatar} />
                        <AvatarFallback>
                          {answer.author.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{answer.author.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {answer.author.reputation} reputation
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatTimeAgo(answer.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {question.answers.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No answers yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to answer this question!
              </p>
              {currentUser && (
                <Button onClick={() => setAnswerDialogOpen(true)}>
                  Post Answer
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}; 
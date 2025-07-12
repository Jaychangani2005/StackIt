import React from 'react';
import { Check, Calendar, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Voting } from '@/components/ui/voting';

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

interface AnswerCardProps {
  answer: Answer;
  questionAuthorId: string;
  currentUser: any;
  onVote: (answerId: string, vote: 'up' | 'down') => void;
  onAccept: (answerId: string) => void;
  onEdit?: (answerId: string) => void;
  onDelete?: (answerId: string) => void;
  showActions?: boolean;
}

export const AnswerCard = ({
  answer,
  questionAuthorId,
  currentUser,
  onVote,
  onAccept,
  onEdit,
  onDelete,
  showActions = true
}: AnswerCardProps) => {
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

  const canAccept = currentUser && 
    currentUser.id === questionAuthorId && 
    !answer.isAccepted;

  const canEdit = currentUser && 
    currentUser.id === answer.author.id;

  const canDelete = currentUser && 
    (currentUser.id === answer.author.id || currentUser.role === 'admin');

  const isEdited = answer.updatedAt && 
    new Date(answer.updatedAt).getTime() !== new Date(answer.createdAt).getTime();

  return (
    <Card className={`transition-all duration-200 ${
      answer.isAccepted 
        ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20' 
        : 'hover:shadow-md'
    }`}>
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Voting */}
          <div className="flex flex-col items-center">
            <Voting
              votes={answer.votes}
              userVote={answer.userVote}
              onVote={(vote) => onVote(answer.id, vote)}
              isAccepted={answer.isAccepted}
              onAccept={() => onAccept(answer.id)}
              canAccept={canAccept}
              size="md"
            />
          </div>
          
          {/* Answer content */}
          <div className="flex-1 min-w-0">
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
            
            {/* Answer meta */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="" />
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
              
              <div className="flex items-center gap-4">
                <div className="text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatTimeAgo(answer.createdAt)}
                    {isEdited && (
                      <span className="text-xs text-muted-foreground">
                        (edited)
                      </span>
                    )}
                  </div>
                  {answer.commentCount !== undefined && (
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {answer.commentCount} comment{answer.commentCount !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                
                {/* Action buttons */}
                {showActions && (canEdit || canDelete) && (
                  <div className="flex gap-1">
                    {canEdit && onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(answer.id)}
                      >
                        Edit
                      </Button>
                    )}
                    {canDelete && onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this answer?')) {
                            onDelete(answer.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 
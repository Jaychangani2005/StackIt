import { ArrowUp, ArrowDown, MessageSquare, Clock, User, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  title: string;
  description: string;
  tags: string[];
  author: {
    name: string;
    reputation: number;
  };
  votes: number;
  answers: number;
  views: number;
  createdAt: string;
  hasAcceptedAnswer?: boolean;
  userVote?: 'up' | 'down' | null;
}

interface QuestionCardProps {
  question: Question;
  onVote: (questionId: string, voteType: 'up' | 'down') => void;
  onClick: (questionId: string) => void;
  currentUser?: any;
}

export function QuestionCard({ question, onVote, onClick, currentUser }: QuestionCardProps) {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 24 * 7) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const handleVote = (e: React.MouseEvent, voteType: 'up' | 'down') => {
    e.stopPropagation();
    if (currentUser) {
      onVote(question.id, voteType);
    }
  };

  return (
    <Card 
      className="hover:shadow-medium transition-all duration-200 cursor-pointer group"
      onClick={() => onClick(question.id)}
    >
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Vote section */}
          <div className="flex flex-col items-center gap-2 min-w-[60px]">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "vote-button",
                question.userVote === 'up' && "upvoted"
              )}
              onClick={(e) => handleVote(e, 'up')}
              disabled={!currentUser}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            
            <span className={cn(
              "text-lg font-semibold",
              question.votes > 0 ? "text-upvote" : question.votes < 0 ? "text-downvote" : "text-muted-foreground"
            )}>
              {question.votes}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "vote-button",
                question.userVote === 'down' && "downvoted"
              )}
              onClick={(e) => handleVote(e, 'down')}
              disabled={!currentUser}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Content section */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-2">
                {question.title}
              </h3>
              {question.hasAcceptedAnswer && (
                <Badge variant="secondary" className="bg-accepted/10 text-accepted border-accepted/20">
                  <Check className="h-3 w-3 mr-1" />
                  Solved
                </Badge>
              )}
            </div>

            <p className="text-muted-foreground mb-4 line-clamp-2">
              {question.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {question.tags.map((tag) => (
                <button
                  key={tag}
                  className="tag text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle tag click
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Stats and author */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{question.answers} answers</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>{question.views} views</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatTimeAgo(question.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{question.author.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {question.author.reputation}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
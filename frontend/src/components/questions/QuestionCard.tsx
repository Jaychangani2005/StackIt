import { Check, MessageSquare, Eye, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Voting } from "@/components/ui/voting";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface QuestionCardProps {
  question: {
    id: string;
    title: string;
    description: string;
    tags: string[];
    author: { name: string; reputation: number };
    votes: number;
    answers: number;
    views: number;
    createdAt: string;
    hasAcceptedAnswer?: boolean;
    userVote?: 'up' | 'down' | null;
  };
  onVote: (questionId: string, voteType: 'up' | 'down') => void;
  onClick: () => void;
  currentUser?: {
    name: string;
    email: string;
    reputation: number;
  } | null;
  onTagClick?: (tag: string) => void;
}

export function QuestionCard({ question, onVote, onClick, currentUser, onTagClick }: QuestionCardProps) {
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

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    onTagClick?.(tag);
  };

  return (
    <div 
      className="group p-6 rounded-lg bg-card border shadow-soft hover:shadow-medium transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex gap-4">
        {/* Voting */}
        <div className="flex flex-col items-center gap-1">
          <Voting
            votes={question.votes}
            userVote={question.userVote}
            onVote={(voteType) => onVote(question.id, voteType)}
            disabled={!currentUser}
            size="sm"
          />
        </div>

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
                className="tag text-sm hover:bg-opacity-80 transition-colors"
                onClick={(e) => handleTagClick(e, tag)}
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
                <Eye className="h-4 w-4" />
                <span>{question.views} views</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatTimeAgo(question.createdAt)}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={undefined} />
                <AvatarFallback className="text-xs">
                  {question.author.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="text-right">
                <div className="font-medium text-foreground">{question.author.name}</div>
                <div className="text-xs">{question.author.reputation} reputation</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
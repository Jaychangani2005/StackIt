import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Comment {
  id: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
  };
  createdAt: Date;
}

interface CommentsListProps {
  comments: Comment[];
}

export const CommentsList = ({ comments }: CommentsListProps) => {
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

  return (
    <div className="space-y-2 mt-2">
      {comments.map(comment => (
        <div key={comment.id} className="flex items-start gap-2 text-sm bg-muted/30 rounded p-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={comment.author.avatar} />
            <AvatarFallback>{comment.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <span dangerouslySetInnerHTML={{ __html: comment.content.replace(/@([a-zA-Z0-9_]+)/g, '<span class=\'text-blue-600 font-semibold\'>@$1</span>') }} />
            <span className="ml-2 text-xs text-muted-foreground">{formatTimeAgo(comment.createdAt)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}; 
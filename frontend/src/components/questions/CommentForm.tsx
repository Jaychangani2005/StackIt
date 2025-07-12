import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Send } from 'lucide-react';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  error?: string;
}

export const CommentForm = ({ onSubmit, onCancel, isSubmitting = false, error }: CommentFormProps) => {
  const [content, setContent] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!content.trim()) {
      setLocalError('Please write your comment before submitting.');
      return;
    }
    if (content.trim().length < 3) {
      setLocalError('Your comment must be at least 3 characters long.');
      return;
    }
    try {
      await onSubmit(content);
      setContent('');
    } catch (err) {}
  };

  const displayError = error || localError;

  // Simple @mention highlight for preview
  const preview = content.replace(/@([a-zA-Z0-9_]+)/g, '<span class="text-blue-600 font-semibold">@$1</span>');

  return (
    <Card className="border border-muted-foreground/20 mb-2">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-2">
          {displayError && (
            <Alert variant="destructive">
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}
          <textarea
            className="w-full border rounded p-2 text-sm focus:outline-none focus:ring"
            rows={2}
            placeholder="Add a comment... Use @username to mention someone."
            value={content}
            onChange={e => setContent(e.target.value)}
            disabled={isSubmitting}
            maxLength={300}
          />
          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting || !content.trim() || content.trim().length < 3}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Posting...</> : <><Send className="mr-2 h-4 w-4" />Post Comment</>}
            </Button>
          </div>
          {content && (
            <div className="mt-2 text-xs text-muted-foreground">
              <span>Preview: </span>
              <span dangerouslySetInnerHTML={{ __html: preview }} />
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}; 
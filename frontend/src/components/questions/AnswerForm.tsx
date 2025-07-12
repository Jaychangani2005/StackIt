import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Send } from 'lucide-react';

interface AnswerFormProps {
  questionId: string;
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  error?: string;
}

export const AnswerForm = ({
  questionId,
  onSubmit,
  onCancel,
  isSubmitting = false,
  error
}: AnswerFormProps) => {
  const [content, setContent] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async () => {
    // Clear previous errors
    setLocalError('');

    // Validate content
    if (!content.trim()) {
      setLocalError('Please write your answer before submitting.');
      return;
    }

    if (content.trim().length < 10) {
      setLocalError('Your answer must be at least 10 characters long.');
      return;
    }

    try {
      await onSubmit(content);
      setContent(''); // Clear form on success
    } catch (err) {
      // Error handling is done by parent component
    }
  };

  const handleCancel = () => {
    if (content.trim() && !confirm('Are you sure you want to cancel? Your answer will be lost.')) {
      return;
    }
    setContent('');
    onCancel?.();
  };

  const displayError = error || localError;

  return (
    <Card className="border-2 border-dashed border-muted-foreground/25">
      <CardHeader>
        <CardTitle className="text-lg">Post Your Answer</CardTitle>
        <p className="text-sm text-muted-foreground">
          Provide a clear and detailed answer to help the question author and other users.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayError && (
          <Alert variant="destructive">
            <AlertDescription>{displayError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Write your answer here... Use the toolbar to format your text, add code blocks, or include images."
            minHeight={200}
          />
          <div className="text-xs text-muted-foreground">
            Minimum 10 characters required. Use markdown or the toolbar to format your answer.
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          {onCancel && (
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !content.trim() || content.trim().length < 10}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Post Answer
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 
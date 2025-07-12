import { useState, useEffect } from "react";
import { X, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { MultiSelect } from "@/components/ui/multi-select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { stripHtmlAndCount, stripHtml } from "@/lib/utils";

interface AskQuestionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (questionData: any) => void;
}

export function AskQuestionForm({ isOpen, onClose, onSubmit }: AskQuestionFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [] as string[]
  });
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset form when opened/closed
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: '',
        description: '',
        tags: []
      });
      setErrors({});
      setIsSubmitting(false);
      setShowSuccess(false);
    }
  }, [isOpen]);

  // Validate form in real-time
  const validateField = (field: string, value: any) => {
    switch (field) {
      case 'title':
        if (!value.trim()) return 'Title is required';
        if (value.length > 150) return 'Title must be 150 characters or less';
        if (value.length < 10) return 'Title should be at least 10 characters';
        return '';
      case 'description':
        const plainText = stripHtml(value);
        if (!plainText.trim()) return 'Description is required';
        if (plainText.length < 20) return 'Description should be at least 20 characters';
        return '';
      case 'tags':
        if (value.length === 0) return 'At least one tag is required';
        if (value.length > 5) return 'Maximum 5 tags allowed';
        return '';
      default:
        return '';
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: any = {};
    newErrors.title = validateField('title', formData.title);
    newErrors.description = validateField('description', formData.description);
    newErrors.tags = validateField('tags', formData.tags);
    
    // Remove empty error messages
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const questionData = {
          id: Date.now().toString(),
          title: formData.title.trim(),
          description: formData.description.trim(),
          tags: formData.tags,
          author: { name: 'Current User', reputation: 100 },
          votes: 0,
          answers: 0,
          views: 0,
          createdAt: new Date().toISOString()
        };
        
        onSubmit(questionData);
        setShowSuccess(true);
        
        // Close form after success
        setTimeout(() => {
          onClose();
        }, 1500);
        
      } catch (error) {
        console.error('Error submitting question:', error);
        setErrors({ submit: 'Failed to submit question. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const tagOptions = [
    { value: 'javascript', label: 'JavaScript', count: 1234 },
    { value: 'react', label: 'React', count: 987 },
    { value: 'typescript', label: 'TypeScript', count: 756 },
    { value: 'python', label: 'Python', count: 654 },
    { value: 'nodejs', label: 'Node.js', count: 543 },
    { value: 'css', label: 'CSS', count: 432 },
    { value: 'html', label: 'HTML', count: 321 },
    { value: 'sql', label: 'SQL', count: 234 },
    { value: 'git', label: 'Git', count: 123 },
    { value: 'docker', label: 'Docker', count: 98 },
    { value: 'aws', label: 'AWS', count: 87 },
    { value: 'algorithms', label: 'Algorithms', count: 76 },
    { value: 'data-structures', label: 'Data Structures', count: 65 },
    { value: 'machine-learning', label: 'Machine Learning', count: 54 },
    { value: 'web-development', label: 'Web Development', count: 43 }
  ];

  // Calculate form completion percentage
  const completionPercentage = Math.round(
    ((formData.title ? 1 : 0) + 
     (stripHtml(formData.description) ? 1 : 0) + 
     (formData.tags.length > 0 ? 1 : 0)) / 3 * 100
  );

  // Get character counts
  const titleCharCount = formData.title.length;
  const descriptionCharCount = stripHtmlAndCount(formData.description);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto pt-8"
      onKeyDown={handleKeyDown}
    >
      <Card className="w-full max-w-4xl mx-4 mb-8 animate-slide-up">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle>Ask a Question</CardTitle>
          <CardDescription>
            Be specific and clear in your question to get the best answers
          </CardDescription>
          
          {/* Progress bar */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Form completion</span>
              <span>{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent>
          {showSuccess && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Question submitted successfully! Redirecting...
              </AlertDescription>
            </Alert>
          )}

          {errors.submit && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {errors.submit}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2">
                Title *
                {formData.title && !errors.title && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </Label>
              <Input
                id="title"
                placeholder="What's your programming question?"
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className={errors.title ? 'border-destructive' : ''}
                disabled={isSubmitting}
              />
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {titleCharCount}/150 characters
                </span>
                {titleCharCount < 10 && titleCharCount > 0 && (
                  <span className="text-amber-600">
                    At least {10 - titleCharCount} more characters needed
                  </span>
                )}
              </div>
              {errors.title && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                Description *
                {formData.description && !errors.description && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </Label>
              <RichTextEditor
                content={formData.description}
                onChange={(content) => handleFieldChange('description', content)}
                placeholder="Describe your problem in detail. Include what you've tried and what error messages you're getting..."
                className={errors.description ? 'border-destructive' : ''}
              />
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {descriptionCharCount} characters
                </span>
                {descriptionCharCount < 20 && descriptionCharCount > 0 && (
                  <span className="text-amber-600">
                    At least {20 - descriptionCharCount} more characters needed
                  </span>
                )}
              </div>
              {errors.description && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags" className="flex items-center gap-2">
                Tags *
                {formData.tags.length > 0 && !errors.tags && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </Label>
              <MultiSelect
                options={tagOptions}
                value={formData.tags}
                onChange={(tags) => handleFieldChange('tags', tags)}
                placeholder="Select or create tags..."
                maxItems={5}
                disabled={isSubmitting}
              />
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {formData.tags.length}/5 tags selected
                </span>
                {formData.tags.length === 0 && (
                  <span className="text-amber-600">
                    At least one tag is required
                  </span>
                )}
              </div>
              {errors.tags && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.tags}
                </p>
              )}
            </div>

            {/* Submit buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                className="gradient-primary"
                disabled={isSubmitting || completionPercentage < 100}
              >
                {isSubmitting ? 'Posting Question...' : 'Post Question'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
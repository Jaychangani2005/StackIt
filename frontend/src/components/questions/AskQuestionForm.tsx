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
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Reset form when opened/closed
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: '',
        description: '',
        tags: []
      });
      setErrors({});
      setIsLoading(false);
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
      setIsLoading(true);
      
      try {
        const response = await api.createQuestion({
          title: formData.title,
          description: formData.description,
          tags: formData.tags
        });

        toast({
          title: 'Question posted successfully!',
          description: 'Your question has been published and is now visible to the community.',
        });

        // Call the parent's onSubmit with the new question data
        onSubmit({
          id: response.questionId,
          title: formData.title,
          description: formData.description,
          tags: formData.tags,
          author: { name: 'Current User', reputation: 100 },
          votes: 0,
          answers: 0,
          views: 0,
          createdAt: new Date().toISOString()
        });
        
        onClose();
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          tags: []
        });
        setErrors({});
        setIsLoading(false);
      } catch (error: any) {
        toast({
          title: 'Error posting question',
          description: error.message || 'Failed to post question. Please try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
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
            className="absolute right-4 top-4 h-8 w-8 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-2xl">Ask a Question</CardTitle>
          <CardDescription>
            Share your knowledge and get help from the community
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Form Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Form Completion</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-medium">
                Title
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="What's your question? Be specific."
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className={errors.title ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              <div className="flex justify-between text-xs">
                <span className={errors.title ? 'text-destructive' : 'text-muted-foreground'}>
                  {errors.title || 'Be specific and imagine you\'re asking another person'}
                </span>
                <span className={titleCharCount > 150 ? 'text-destructive' : 'text-muted-foreground'}>
                  {titleCharCount}/150
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-medium">
                Description
              </Label>
              <RichTextEditor
                content={formData.description}
                onChange={(value) => handleFieldChange('description', value)}
                placeholder="Provide all the information someone would need to answer your question..."
                className={errors.description ? 'border-destructive' : ''}
              />
              <div className="flex justify-between text-xs">
                <span className={errors.description ? 'text-destructive' : 'text-muted-foreground'}>
                  {errors.description || 'Include all the information someone would need to answer your question'}
                </span>
                <span className={descriptionCharCount < 20 ? 'text-destructive' : 'text-muted-foreground'}>
                  {descriptionCharCount} characters
                </span>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-base font-medium">
                Tags
              </Label>
              <MultiSelect
                options={tagOptions}
                value={formData.tags}
                onChange={(value) => handleFieldChange('tags', value)}
                placeholder="Add up to 5 tags..."
                maxItems={5}
              />
              <div className="flex justify-between text-xs">
                <span className={errors.tags ? 'text-destructive' : 'text-muted-foreground'}>
                  {errors.tags || 'Add up to 5 tags to describe what your question is about'}
                </span>
                <span className="text-muted-foreground">
                  {formData.tags.length}/5
                </span>
              </div>
            </div>

            {/* Tips */}
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Writing a good question:</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Be specific and provide context</li>
                  <li>• Include code examples if relevant</li>
                  <li>• Explain what you've already tried</li>
                  <li>• Use clear, descriptive language</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Submit buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? 'Posting...' : 'Post Question'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
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
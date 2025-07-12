import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { MultiSelect } from "@/components/ui/multi-select";

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: any = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (formData.title.length > 150) newErrors.title = 'Title must be 150 characters or less';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.tags.length === 0) newErrors.tags = 'At least one tag is required';
    if (formData.tags.length > 5) newErrors.tags = 'Maximum 5 tags allowed';
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onSubmit({
        id: Date.now().toString(),
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

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto pt-8">
      <Card className="w-full max-w-4xl mx-4 mb-8 animate-slide-up">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle>Ask a Question</CardTitle>
          <CardDescription>
            Be specific and clear in your question to get the best answers
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="What's your programming question?"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={errors.title ? 'border-destructive' : ''}
              />
              <p className="text-xs text-muted-foreground">
                {formData.title.length}/150 characters
              </p>
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <RichTextEditor
                content={formData.description}
                onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                placeholder="Describe your problem in detail. Include what you've tried and what error messages you're getting..."
                className={errors.description ? 'border-destructive' : ''}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags * (1-5 tags)</Label>
              <MultiSelect
                options={tagOptions}
                value={formData.tags}
                onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
                placeholder="Select or create tags..."
                maxItems={5}
              />
              <p className="text-xs text-muted-foreground">
                Add relevant tags to help others find your question
              </p>
              {errors.tags && (
                <p className="text-sm text-destructive">{errors.tags}</p>
              )}
            </div>

            {/* Submit buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="gradient-primary">
                Post Question
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
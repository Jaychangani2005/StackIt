import { useState } from "react";
import { X, Bold, Italic, List, Link2, Image, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AskQuestionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (questionData: any) => void;
}

export function AskQuestionForm({ isOpen, onClose, onSubmit }: AskQuestionFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [] as string[],
    currentTag: ''
  });
  const [errors, setErrors] = useState<any>({});
  const [activeTab, setActiveTab] = useState('write');

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
        tags: [],
        currentTag: ''
      });
    }
  };

  const handleAddTag = () => {
    const tag = formData.currentTag.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
        currentTag: ''
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const insertFormatting = (format: string) => {
    // Simple formatting insertion (in a real app, you'd use a proper rich text editor)
    const textarea = document.getElementById('description') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.description.substring(start, end);
    
    let newText = '';
    switch (format) {
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        newText = `*${selectedText || 'italic text'}*`;
        break;
      case 'list':
        newText = `\n- ${selectedText || 'list item'}`;
        break;
      case 'link':
        newText = `[${selectedText || 'link text'}](url)`;
        break;
      default:
        return;
    }

    const newDescription = 
      formData.description.substring(0, start) + 
      newText + 
      formData.description.substring(end);
    
    setFormData(prev => ({ ...prev, description: newDescription }));
  };

  const renderPreview = () => {
    // Simple markdown-like preview (in a real app, you'd use a proper markdown parser)
    let preview = formData.description
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^\- (.+)$/gm, '<li>$1</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline">$1</a>');
    
    // Wrap list items
    preview = preview.replace(/(<li>.*<\/li>)/gs, '<ul class="list-disc pl-6">$1</ul>');
    
    return preview;
  };

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
              
              {/* Formatting toolbar */}
              <div className="flex gap-1 p-2 border rounded-t-md bg-muted/30">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting('bold')}
                  className="h-8 w-8 p-0"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting('italic')}
                  className="h-8 w-8 p-0"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting('link')}
                  className="h-8 w-8 p-0"
                >
                  <Link2 className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Image className="h-4 w-4" />
                </Button>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="write">Write</TabsTrigger>
                  <TabsTrigger value="preview">
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="write" className="mt-2">
                  <Textarea
                    id="description"
                    placeholder="Describe your problem in detail. Include what you've tried and what error messages you're getting..."
                    className={`min-h-48 rounded-t-none ${errors.description ? 'border-destructive' : ''}`}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </TabsContent>
                
                <TabsContent value="preview" className="mt-2">
                  <div 
                    className="min-h-48 p-3 border rounded-md bg-background prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: renderPreview() || '<p class="text-muted-foreground">Nothing to preview</p>' 
                    }}
                  />
                </TabsContent>
              </Tabs>
              
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags * (1-5 tags)</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <Badge 
                    key={tag}
                    variant="secondary"
                    className="gap-1 cursor-pointer hover:bg-destructive/10"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="Type a tag and press Enter (e.g., javascript, react, python)"
                  value={formData.currentTag}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentTag: e.target.value }))}
                  onKeyDown={handleKeyDown}
                  disabled={formData.tags.length >= 5}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddTag}
                  disabled={!formData.currentTag.trim() || formData.tags.length >= 5}
                >
                  Add
                </Button>
              </div>
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
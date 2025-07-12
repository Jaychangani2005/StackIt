import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Emoji from '@tiptap/extension-emoji'
import { Button } from './button'
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Smile,
  Upload,
  X,
  AlertCircle
} from 'lucide-react'
import { Input } from './input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Alert, AlertDescription } from './alert'
import { useState, useRef } from 'react'
import { isValidUrl, isValidImageFile, formatFileSize } from '@/lib/utils'

interface RichTextEditorProps {
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
  className?: string
}

// Common emojis for quick access
const commonEmojis = [
  '😊', '😂', '🤣', '❤️', '👍', '👎', '🎉', '🔥', '💯', '✨',
  '😍', '😭', '😱', '🤔', '👀', '💪', '🙏', '👏', '🤝', '💡',
  '🚀', '⚡', '💻', '🔧', '📚', '🎯', '✅', '❌', '⚠️', '💬'
];

const MenuBar = ({ editor }: { editor: any }) => {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
  const [fileError, setFileError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!editor) {
    return null
  }

  const setLink = () => {
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    if (!isValidUrl(linkUrl)) {
      setFileError('Please enter a valid URL');
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
    setLinkUrl('')
    setLinkDialogOpen(false)
    setFileError('')
  }

  const setImage = () => {
    if (imageUrl === '') {
      return
    }

    if (!isValidUrl(imageUrl)) {
      setFileError('Please enter a valid image URL');
      return;
    }

    editor.chain().focus().setImage({ src: imageUrl }).run()
    setImageUrl('')
    setImageDialogOpen(false)
    setFileError('')
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!isValidImageFile(file)) {
        setFileError('Please select a valid image file (JPEG, PNG, GIF, WebP) under 5MB');
        return;
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        editor.chain().focus().setImage({ src: result }).run()
        setFileError('')
      }
      reader.onerror = () => {
        setFileError('Failed to read the image file');
      }
      reader.readAsDataURL(file)
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const insertEmoji = (emoji: string) => {
    editor.chain().focus().insertContent(emoji).run()
    setEmojiPickerOpen(false)
  }

  const clearFileError = () => {
    setFileError('')
  }

  return (
    <div className="border-b border-border p-2 flex flex-wrap gap-1">
      <Button
        variant={editor.isActive('bold') ? 'default' : 'outline'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Button>
      
      <Button
        variant={editor.isActive('italic') ? 'default' : 'outline'}
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Button>
      
      <Button
        variant={editor.isActive('strike') ? 'default' : 'outline'}
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      <Button
        variant={editor.isActive('bulletList') ? 'default' : 'outline'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Button>
      
      <Button
        variant={editor.isActive('orderedList') ? 'default' : 'outline'}
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      <Button
        variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'outline'}
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'outline'}
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      
      <Button
        variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'outline'}
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      >
        <AlignRight className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      <Dialog open={linkDialogOpen} onOpenChange={(open) => {
        setLinkDialogOpen(open)
        if (!open) clearFileError()
      }}>
        <DialogTrigger asChild>
          <Button
            variant={editor.isActive('link') ? 'default' : 'outline'}
            size="sm"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {fileError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {fileError}
                </AlertDescription>
              </Alert>
            )}
            <Input
              placeholder="Enter URL..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setLink()}
            />
            <div className="flex gap-2">
              <Button onClick={setLink}>Add Link</Button>
              <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Upload */}
      <div className="flex gap-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          title="Upload Image (Max 5MB)"
        >
          <Upload className="h-4 w-4" />
        </Button>
        
        <Dialog open={imageDialogOpen} onOpenChange={(open) => {
          setImageDialogOpen(open)
          if (!open) clearFileError()
        }}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" title="Add Image URL">
              <ImageIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {fileError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {fileError}
                  </AlertDescription>
                </Alert>
              )}
              <Input
                placeholder="Enter image URL..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setImage()}
              />
              <div className="flex gap-2">
                <Button onClick={setImage}>Add Image</Button>
                <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Emoji Picker */}
      <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" title="Add Emoji">
            <Smile className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Quick Emojis</h4>
            <div className="grid grid-cols-10 gap-1">
              {commonEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => insertEmoji(emoji)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded text-lg transition-colors"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="pt-2 border-t">
              <Input
                placeholder="Type emoji name or paste emoji..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    insertEmoji(e.currentTarget.value)
                    e.currentTarget.value = ''
                  }
                }}
                className="text-sm"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export const RichTextEditor = ({ content = '', onChange, placeholder, className }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-md',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Emoji,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4',
      },
    },
  })

  return (
    <div className={`border border-border rounded-md relative ${className}`}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      {placeholder && !content && (
        <div className="absolute top-16 left-4 text-muted-foreground pointer-events-none text-sm">
          {placeholder}
        </div>
      )}
    </div>
  )
} 
import React, { useState, useRef, useEffect } from 'react'
import { X, ChevronDown, Plus } from 'lucide-react'
import { Button } from './button'
import { Badge } from './badge'
import { Input } from './input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover'
import { ScrollArea } from './scroll-area'
import { cn } from '@/lib/utils'

interface Option {
  value: string
  label: string
  count?: number
}

interface MultiSelectProps {
  options: Option[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  allowCreate?: boolean
  maxItems?: number
  className?: string
}

export const MultiSelect = ({
  options,
  value,
  onChange,
  placeholder = "Select items...",
  allowCreate = true,
  maxItems,
  className
}: MultiSelectProps) => {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedOptions = options.filter(option => value.includes(option.value))
  const availableOptions = options.filter(option => !value.includes(option.value))
  const filteredOptions = availableOptions.filter(option =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  )

  const handleSelect = (optionValue: string) => {
    if (maxItems && value.length >= maxItems) return
    
    const newValue = [...value, optionValue]
    onChange(newValue)
    setInputValue('')
    inputRef.current?.focus()
  }

  const handleRemove = (optionValue: string) => {
    const newValue = value.filter(v => v !== optionValue)
    onChange(newValue)
  }

  const handleCreate = () => {
    if (!allowCreate || !inputValue.trim()) return
    if (maxItems && value.length >= maxItems) return
    
    const newValue = [...value, inputValue.trim().toLowerCase()]
    onChange(newValue)
    setInputValue('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredOptions.length > 0) {
        handleSelect(filteredOptions[0].value)
      } else if (allowCreate && inputValue.trim()) {
        handleCreate()
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      handleRemove(value[value.length - 1])
    }
  }

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
    }
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-auto min-h-10 p-2",
            !value.length && "text-muted-foreground",
            className
          )}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="text-xs"
                >
                  {option.label}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1 hover:bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemove(option.value)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))
            ) : (
              <span className="text-sm">{placeholder}</span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="p-2 border-b">
          <Input
            ref={inputRef}
            placeholder="Search or create tags..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <ScrollArea className="max-h-60">
          {filteredOptions.length > 0 && (
            <div className="p-1">
              {filteredOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="ghost"
                  className="w-full justify-start h-auto p-2 text-sm"
                  onClick={() => handleSelect(option.value)}
                >
                  <span className="flex-1 text-left">{option.label}</span>
                  {option.count && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {option.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          )}
          {allowCreate && inputValue.trim() && !filteredOptions.some(opt => 
            opt.label.toLowerCase() === inputValue.toLowerCase()
          ) && (
            <div className="p-1 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start h-auto p-2 text-sm"
                onClick={handleCreate}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create "{inputValue.trim()}"
              </Button>
            </div>
          )}
          {filteredOptions.length === 0 && !inputValue && (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No options available
            </div>
          )}
        </ScrollArea>
        {maxItems && (
          <div className="p-2 border-t text-xs text-muted-foreground">
            {value.length}/{maxItems} items selected
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
} 
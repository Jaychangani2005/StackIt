import React from 'react'
import { ChevronUp, ChevronDown, Check } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface VotingProps {
  votes: number
  userVote: 'up' | 'down' | null
  onVote: (vote: 'up' | 'down') => void
  isAccepted?: boolean
  onAccept?: () => void
  canAccept?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const Voting = ({
  votes,
  userVote,
  onVote,
  isAccepted = false,
  onAccept,
  canAccept = false,
  size = 'md'
}: VotingProps) => {
  const sizeClasses = {
    sm: {
      button: 'h-6 w-6',
      icon: 'h-3 w-3',
      text: 'text-xs',
      gap: 'gap-1'
    },
    md: {
      button: 'h-8 w-8',
      icon: 'h-4 w-4',
      text: 'text-sm',
      gap: 'gap-2'
    },
    lg: {
      button: 'h-10 w-10',
      icon: 'h-5 w-5',
      text: 'text-base',
      gap: 'gap-3'
    }
  }

  const classes = sizeClasses[size]

  return (
    <div className="flex flex-col items-center">
      {/* Upvote Button */}
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          classes.button,
          "p-0 hover:bg-muted transition-colors",
          userVote === 'up' && "text-green-600 bg-green-50 hover:bg-green-100"
        )}
        onClick={() => onVote('up')}
      >
        <ChevronUp className={classes.icon} />
      </Button>

      {/* Vote Count */}
      <div className={cn(
        "font-medium text-center min-w-[2rem]",
        classes.text,
        classes.gap
      )}>
        {votes}
      </div>

      {/* Downvote Button */}
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          classes.button,
          "p-0 hover:bg-muted transition-colors",
          userVote === 'down' && "text-red-600 bg-red-50 hover:bg-red-100"
        )}
        onClick={() => onVote('down')}
      >
        <ChevronDown className={classes.icon} />
      </Button>

      {/* Accept Answer Button */}
      {canAccept && (
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            classes.button,
            "p-0 mt-2 transition-colors",
            isAccepted 
              ? "text-green-600 bg-green-50 hover:bg-green-100" 
              : "hover:bg-muted"
          )}
          onClick={onAccept}
          title={isAccepted ? "Accepted answer" : "Accept this answer"}
        >
          <Check className={classes.icon} />
        </Button>
      )}
    </div>
  )
} 
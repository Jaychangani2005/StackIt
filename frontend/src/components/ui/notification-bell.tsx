import React, { useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from './button'
import { Badge } from './badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'
import { ScrollArea } from './scroll-area'

interface Notification {
  id: string
  type: 'answer' | 'comment' | 'mention'
  message: string
  user: {
    name: string
    avatar?: string
  }
  timestamp: Date
  read: boolean
  questionId?: string
}

interface NotificationBellProps {
  notifications: Notification[]
  onMarkAsRead: (notificationId: string) => void
  onMarkAllAsRead: () => void
  onNotificationClick: (notification: Notification) => void
}

export const NotificationBell = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
}: NotificationBellProps) => {
  const [open, setOpen] = useState(false)
  const unreadCount = notifications.filter(n => !n.read).length

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString()
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'answer':
        return '💬'
      case 'comment':
        return '💭'
      case 'mention':
        return '@'
      default:
        return '🔔'
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'answer':
        return 'text-green-600'
      case 'comment':
        return 'text-blue-600'
      case 'mention':
        return 'text-orange-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onMarkAllAsRead()
              }}
              className="h-auto p-1 text-xs"
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-pointer ${!notification.read ? 'bg-muted/50' : ''}`}
                onClick={() => {
                  if (!notification.read) {
                    onMarkAsRead(notification.id)
                  }
                  onNotificationClick(notification)
                  setOpen(false)
                }}
              >
                <div className="flex items-start gap-3 w-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={notification.user.avatar} />
                    <AvatarFallback>
                      {notification.user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-medium ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </span>
                      <span className="text-sm font-medium truncate">
                        {notification.user.name}
                      </span>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(notification.timestamp)}
                    </span>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-sm text-muted-foreground">
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 
import { Search, User, Menu, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBell } from "@/components/ui/notification-bell";

interface HeaderProps {
  onToggleSidebar?: () => void;
  currentUser?: {
    name: string;
    email: string;
    reputation: number;
  } | null;
  onAuthAction: (action: 'login' | 'register' | 'logout') => void;
  notifications?: Array<{
    id: string;
    type: 'answer' | 'comment' | 'mention';
    message: string;
    user: {
      name: string;
      avatar?: string;
    };
    timestamp: Date;
    read: boolean;
    questionId?: string;
  }>;
  onMarkNotificationAsRead?: (notificationId: string) => void;
  onMarkAllNotificationsAsRead?: () => void;
  onNotificationClick?: (notification: any) => void;
}

export function Header({ 
  onToggleSidebar, 
  currentUser, 
  onAuthAction,
  notifications = [],
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onNotificationClick
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={onToggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
              DevQ&A
            </h1>
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search questions, tags, users..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Mobile search */}
          <Button variant="ghost" size="sm" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>

          {currentUser ? (
            <>
              {/* Notifications */}
              <NotificationBell
                notifications={notifications}
                onMarkAsRead={onMarkNotificationAsRead || (() => {})}
                onMarkAllAsRead={onMarkAllNotificationsAsRead || (() => {})}
                onNotificationClick={onNotificationClick || (() => {})}
              />

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium">{currentUser.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {currentUser.reputation} rep
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Your Questions</DropdownMenuItem>
                  <DropdownMenuItem>Your Answers</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onAuthAction('logout')}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => onAuthAction('login')}>
                Sign In
              </Button>
              <Button onClick={() => onAuthAction('register')}>
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
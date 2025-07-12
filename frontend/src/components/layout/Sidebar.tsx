import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  HelpCircle, 
  Tag, 
  Users, 
  Clock, 
  TrendingUp, 
  Star, 
  Award 
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onTagClick?: (tag: string) => void;
  popularTags?: Array<{ name: string; count: number }>;
}

const navigationItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'questions', label: 'Questions', icon: HelpCircle },
  { id: 'tags', label: 'Tags', icon: Tag },
  { id: 'users', label: 'Users', icon: Users },
];

const categoryItems = [
  { id: 'newest', label: 'Newest', icon: Clock },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'featured', label: 'Featured', icon: Star },
  { id: 'bounty', label: 'Bounty', icon: Award },
];

export function Sidebar({ isOpen, activeSection, onSectionChange, onTagClick, popularTags }: SidebarProps) {
  return (
    <aside className={cn(
      "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 transform border-r bg-card transition-transform md:relative md:top-0 md:h-screen md:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex h-full flex-col">
        <div className="flex-1 space-y-4 p-4">
          {/* Navigation */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Navigation
            </h3>
            <nav className="space-y-1">
              {navigationItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => onSectionChange(item.id)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Categories
            </h3>
            <nav className="space-y-1">
              {categoryItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={() => onSectionChange(item.id)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>

          {/* Popular Tags */}
          <div className="mt-8">
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Popular Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {(popularTags || []).slice(0, 8).map((tag) => (
                <button
                  key={tag.name}
                  className="tag text-xs hover:bg-opacity-80 transition-colors cursor-pointer"
                  onClick={() => onTagClick?.(tag.name)}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 rounded-lg bg-gradient-card p-4 shadow-soft">
            <h3 className="mb-3 text-sm font-semibold">Community Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Questions</span>
                <span className="font-medium">2,547</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Answers</span>
                <span className="font-medium">8,923</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Users</span>
                <span className="font-medium">1,234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tags</span>
                <span className="font-medium">156</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
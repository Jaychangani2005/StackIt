import { Home, HelpCircle, Users, Tag, TrendingUp, Star, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  activeSection: string;
  onSectionChange: (section: string) => void;
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

const popularTags = [
  'javascript', 'react', 'python', 'typescript', 'node.js', 
  'css', 'html', 'sql', 'git', 'algorithms'
];

export function Sidebar({ isOpen, activeSection, onSectionChange }: SidebarProps) {
  return (
    <aside className={cn(
      "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 transform border-r bg-card transition-transform md:relative md:top-0 md:h-screen md:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {/* Main Navigation */}
          <div className="space-y-2">
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Navigation
            </h3>
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "secondary" : "ghost"}
                className="w-full justify-start gap-3"
                onClick={() => onSectionChange(item.id)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>

          {/* Categories */}
          <div className="mt-8 space-y-2">
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Categories
            </h3>
            {categoryItems.map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "secondary" : "ghost"}
                className="w-full justify-start gap-3"
                onClick={() => onSectionChange(item.id)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>

          {/* Popular Tags */}
          <div className="mt-8">
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Popular Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  className="tag text-xs hover:bg-opacity-80 transition-colors"
                  onClick={() => onSectionChange('tags')}
                >
                  {tag}
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
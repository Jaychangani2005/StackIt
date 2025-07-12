import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { QuestionsList } from "@/components/questions/QuestionsList";
import { AskQuestionForm } from "@/components/questions/AskQuestionForm";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { notificationService, Notification } from "@/services/notificationService";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated, login, register, logout } = useAuth();
  const [authDialog, setAuthDialog] = useState<{ isOpen: boolean; mode: 'login' | 'register' }>({
    isOpen: false,
    mode: 'login'
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('questions');
  const [askQuestionOpen, setAskQuestionOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Popular tags with question counts
  const popularTags = [
    { name: 'javascript', count: 1234 },
    { name: 'react', count: 987 },
    { name: 'python', count: 756 },
    { name: 'typescript', count: 654 },
    { name: 'node.js', count: 543 },
    { name: 'css', count: 432 },
    { name: 'html', count: 321 },
    { name: 'sql', count: 234 },
    { name: 'git', count: 123 },
    { name: 'algorithms', count: 98 },
    { name: 'docker', count: 87 },
    { name: 'aws', count: 76 }
  ];

  // Load notifications on component mount
  useEffect(() => {
    setNotifications(notificationService.getNotifications());
  }, []);

  const handleAuthAction = (action: 'login' | 'register' | 'logout') => {
    if (action === 'logout') {
      logout();
      toast({
        title: "Signed out successfully",
        description: "Come back soon!",
      });
    } else {
      setAuthDialog({ isOpen: true, mode: action });
    }
  };

  const handleAuthSubmit = async (data: any, mode: 'login' | 'register') => {
    try {
      if (mode === 'login') {
        await login(data.email, data.password);
      } else {
        await register(data.name, data.email, data.password);
      }
      
      setAuthDialog({ isOpen: false, mode: 'login' });
      
      toast({
        title: mode === 'register' ? "Account created!" : "Welcome back!",
        description: mode === 'register' 
          ? "Your account has been created successfully." 
          : "You've been signed in successfully.",
      });
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    }
  };

  const handleQuestionClick = (questionId: string) => {
    // Navigate to the question detail page
    navigate(`/questions/${questionId}`);
  };

  const handleQuestionSubmit = (questionData: any) => {
    // In a real app, this would save to the backend
    console.log('New question:', questionData);
    toast({
      title: "Question posted!",
      description: "Your question has been posted successfully.",
    });
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
    setActiveSection('questions');
    toast({
      title: `Filtering by ${tag}`,
      description: `Showing questions tagged with ${tag}`,
    });
  };

  const handleClearTagFilter = () => {
    setSelectedTag(null);
    toast({
      title: "Filter cleared",
      description: "Showing all questions",
    });
  };

  const handleMarkNotificationAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
    setNotifications(notificationService.getNotifications());
  };

  const handleMarkAllNotificationsAsRead = () => {
    notificationService.markAllAsRead();
    setNotifications(notificationService.getNotifications());
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.read) {
      notificationService.markAsRead(notification.id);
      setNotifications(notificationService.getNotifications());
    }

    // Navigate to the relevant question
    if (notification.questionId) {
      navigate(`/questions/${notification.questionId}`);
    }
    
    toast({
      title: "Notification clicked",
      description: `Navigating to ${notification.type} notification`,
    });
  };

  // Function to add sample notifications (for testing)
  const addSampleNotifications = () => {
    if (user) {
      notificationService.createAnswerNotification(
        '1',
        'How to implement authentication in React with JWT tokens?',
        'Alex Johnson'
      );
      notificationService.createCommentNotification(
        '2',
        '5',
        'Python list comprehension vs map() performance comparison',
        'Maria Garcia'
      );
      notificationService.createMentionNotification(
        '3',
        'CSS Grid vs Flexbox: When to use which one?',
        'David Wilson'
      );
      setNotifications(notificationService.getNotifications());
      
      toast({
        title: "Sample notifications added",
        description: "Check the notification bell for new notifications",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        currentUser={user}
        onAuthAction={handleAuthAction}
        notifications={notifications}
        onMarkNotificationAsRead={handleMarkNotificationAsRead}
        onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
        onNotificationClick={handleNotificationClick}
      />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onTagClick={handleTagClick}
          popularTags={popularTags}
        />

        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 md:ml-0">
          <div className="max-w-5xl mx-auto">
            {activeSection === 'questions' && (
              <div>
                {/* Tag filter indicator */}
                {selectedTag && (
                  <div className="mb-6 p-4 rounded-lg bg-gradient-card shadow-soft">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">Filtering by:</span>
                        <span className="tag">{selectedTag}</span>
                      </div>
                      <button
                        onClick={handleClearTagFilter}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Clear filter
                      </button>
                    </div>
                  </div>
                )}
                
                <QuestionsList
                  currentUser={user}
                  onQuestionClick={handleQuestionClick}
                  onAskQuestion={() => setAskQuestionOpen(true)}
                  selectedTag={selectedTag}
                  onTagClick={handleTagClick}
                />
              </div>
            )}

            {activeSection === 'home' && (
              <div className="text-center py-12">
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                  Welcome to StackIt
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  A community-driven platform for developers to ask questions and share knowledge
                </p>
                
                {/* Test notification button (for development) */}
                {user && (
                  <div className="mb-8">
                    <button
                      onClick={addSampleNotifications}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Add Sample Notifications (Test)
                    </button>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                  <div className="p-6 rounded-lg bg-gradient-card shadow-soft">
                    <h3 className="text-lg font-semibold mb-2">Ask Questions</h3>
                    <p className="text-muted-foreground">Get help from the community with your coding problems</p>
                  </div>
                  <div className="p-6 rounded-lg bg-gradient-card shadow-soft">
                    <h3 className="text-lg font-semibold mb-2">Share Knowledge</h3>
                    <p className="text-muted-foreground">Help others by answering questions and sharing your expertise</p>
                  </div>
                  <div className="p-6 rounded-lg bg-gradient-card shadow-soft">
                    <h3 className="text-lg font-semibold mb-2">Build Reputation</h3>
                    <p className="text-muted-foreground">Earn points and badges by contributing to the community</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'tags' && (
              <div>
                <h1 className="text-3xl font-bold mb-6">Tags</h1>
                <p className="text-muted-foreground mb-8">
                  Browse questions by topic
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {popularTags.map((tag) => (
                    <div 
                      key={tag.name} 
                      className="p-4 rounded-lg bg-gradient-card shadow-soft hover:shadow-medium transition-shadow cursor-pointer"
                      onClick={() => handleTagClick(tag.name)}
                    >
                      <div className="tag mb-2">{tag.name}</div>
                      <p className="text-sm text-muted-foreground">
                        {tag.count} questions
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'users' && (
              <div>
                <h1 className="text-3xl font-bold mb-6">Top Users</h1>
                <p className="text-muted-foreground mb-8">
                  Community leaders and contributors
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { name: 'Sarah Smith', reputation: 15420, answers: 342, questions: 45 },
                    { name: 'Michael Chen', reputation: 12850, answers: 298, questions: 32 },
                    { name: 'Emily Johnson', reputation: 11230, answers: 267, questions: 28 },
                    { name: 'David Wilson', reputation: 9870, answers: 234, questions: 19 },
                    { name: 'Lisa Brown', reputation: 8540, answers: 198, questions: 15 },
                    { name: 'James Davis', reputation: 7230, answers: 167, questions: 12 }
                  ].map((user, index) => (
                    <div key={user.name} className="p-6 rounded-lg bg-gradient-card shadow-soft">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-semibold text-primary">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{user.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {user.reputation.toLocaleString()} reputation
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium">{user.answers}</p>
                          <p className="text-muted-foreground">Answers</p>
                        </div>
                        <div>
                          <p className="font-medium">{user.questions}</p>
                          <p className="text-muted-foreground">Questions</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Auth Dialog */}
      <AuthDialog
        isOpen={authDialog.isOpen}
        mode={authDialog.mode}
        onClose={() => setAuthDialog({ isOpen: false, mode: 'login' })}
        onSubmit={handleAuthSubmit}
      />

      {/* Ask Question Form */}
      <AskQuestionForm
        isOpen={askQuestionOpen}
        onClose={() => setAskQuestionOpen(false)}
        onSubmit={handleQuestionSubmit}
      />
    </div>
  );
};

export default Index;


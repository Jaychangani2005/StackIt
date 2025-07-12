import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { QuestionsList } from "@/components/questions/QuestionsList";
import { AskQuestionForm } from "@/components/questions/AskQuestionForm";
import { QuestionDetail } from "@/components/questions/QuestionDetail";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authDialog, setAuthDialog] = useState<{ isOpen: boolean; mode: 'login' | 'register' }>({
    isOpen: false,
    mode: 'login'
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('questions');
  const [askQuestionOpen, setAskQuestionOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'answer' as const,
      message: 'Sarah Smith answered your question about React hooks',
      user: { name: 'Sarah Smith', avatar: undefined },
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: false,
      questionId: '1'
    },
    {
      id: '2',
      type: 'comment' as const,
      message: 'Emily Chen commented on your answer about TypeScript',
      user: { name: 'Emily Chen', avatar: undefined },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      questionId: '2'
    },
    {
      id: '3',
      type: 'mention' as const,
      message: 'David Wilson mentioned you in a question about Node.js',
      user: { name: 'David Wilson', avatar: undefined },
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      questionId: '3'
    }
  ]);

  const handleAuthAction = (action: 'login' | 'register' | 'logout') => {
    if (action === 'logout') {
      setCurrentUser(null);
      toast({
        title: "Signed out successfully",
        description: "Come back soon!",
      });
    } else {
      setAuthDialog({ isOpen: true, mode: action });
    }
  };

  const handleAuthSubmit = (data: any, mode: 'login' | 'register') => {
    // Simulate authentication
    const newUser = {
      id: '1',
      name: data.name || 'John Doe',
      email: data.email,
      reputation: mode === 'register' ? 1 : 1245
    };
    
    setCurrentUser(newUser);
    setAuthDialog({ isOpen: false, mode: 'login' });
    
    toast({
      title: mode === 'register' ? "Account created!" : "Welcome back!",
      description: mode === 'register' 
        ? "Your account has been created successfully." 
        : "You've been signed in successfully.",
    });
  };

  const handleQuestionClick = (questionId: string) => {
    // Mock question data for demonstration
    const mockQuestion = {
      id: questionId,
      title: "How to implement React hooks with TypeScript?",
      content: "<p>I'm trying to create a custom hook that manages form state with TypeScript. Here's what I have so far:</p><pre><code>const useForm = (initialState: any) => {\n  const [state, setState] = useState(initialState);\n  // ... rest of implementation\n}</code></pre><p>But I'm getting type errors. Can someone help me fix this?</p>",
      tags: ['react', 'typescript', 'hooks'],
      author: {
        name: 'John Doe',
        reputation: 1245
      },
      votes: 15,
      userVote: null,
      answers: [
        {
          id: '1',
          content: '<p>Here\'s how you can properly type your custom hook:</p><pre><code>interface FormState {\n  [key: string]: any;\n}\n\nconst useForm = (initialState: FormState) => {\n  const [state, setState] = useState<FormState>(initialState);\n  // ... rest of implementation\n}</code></pre>',
          author: {
            name: 'Sarah Smith',
            reputation: 2890
          },
          votes: 8,
          userVote: null,
          isAccepted: true,
          createdAt: new Date(Date.now() - 30 * 60 * 1000)
        },
        {
          id: '2',
          content: '<p>You can also use generics for more flexibility:</p><pre><code>const useForm = <T extends Record<string, any>>(initialState: T) => {\n  const [state, setState] = useState<T>(initialState);\n  // ... rest of implementation\n}</code></pre>',
          author: {
            name: 'Emily Chen',
            reputation: 3456
          },
          votes: 5,
          userVote: null,
          isAccepted: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        }
      ],
      views: 156,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    };
    setSelectedQuestion(mockQuestion);
  };

  const handleQuestionSubmit = (questionData: any) => {
    // In a real app, this would save to the backend
    console.log('New question:', questionData);
    toast({
      title: "Question posted!",
      description: "Your question has been posted successfully.",
    });
  };

  const handleMarkNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const handleNotificationClick = (notification: any) => {
    // In a real app, this would navigate to the relevant question
    console.log('Navigate to notification:', notification);
    toast({
      title: "Notification clicked",
      description: `Navigating to ${notification.type} notification`,
    });
  };

  const handleVoteQuestion = (vote: 'up' | 'down') => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to vote on questions.",
      });
      return;
    }
    
    if (selectedQuestion) {
      setSelectedQuestion(prev => ({
        ...prev,
        userVote: prev.userVote === vote ? null : vote,
        votes: prev.votes + (prev.userVote === vote ? -1 : prev.userVote ? 0 : 1)
      }));
    }
  };

  const handleVoteAnswer = (answerId: string, vote: 'up' | 'down') => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to vote on answers.",
      });
      return;
    }
    
    if (selectedQuestion) {
      setSelectedQuestion(prev => ({
        ...prev,
        answers: prev.answers.map(answer => {
          if (answer.id === answerId) {
            const newVote = answer.userVote === vote ? null : vote;
            const voteChange = newVote ? (answer.userVote ? 0 : 1) : -1;
            return {
              ...answer,
              userVote: newVote,
              votes: answer.votes + voteChange
            };
          }
          return answer;
        })
      }));
    }
  };

  const handleAcceptAnswer = (answerId: string) => {
    if (selectedQuestion) {
      setSelectedQuestion(prev => ({
        ...prev,
        answers: prev.answers.map(answer => ({
          ...answer,
          isAccepted: answer.id === answerId
        }))
      }));
      
      toast({
        title: "Answer accepted!",
        description: "The answer has been marked as accepted.",
      });
    }
  };

  const handleSubmitAnswer = (content: string) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to post answers.",
      });
      return;
    }
    
    if (selectedQuestion) {
      const newAnswer = {
        id: Date.now().toString(),
        content,
        author: {
          name: currentUser.name,
          reputation: currentUser.reputation
        },
        votes: 0,
        userVote: null,
        isAccepted: false,
        createdAt: new Date()
      };
      
      setSelectedQuestion(prev => ({
        ...prev,
        answers: [...prev.answers, newAnswer]
      }));
      
      toast({
        title: "Answer posted!",
        description: "Your answer has been posted successfully.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        currentUser={currentUser}
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
            {selectedQuestion ? (
              <div>
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedQuestion(null)}
                  className="mb-4"
                >
                  ← Back to Questions
                </Button>
                <QuestionDetail
                  question={selectedQuestion}
                  currentUser={currentUser}
                  onVoteQuestion={handleVoteQuestion}
                  onVoteAnswer={handleVoteAnswer}
                  onAcceptAnswer={handleAcceptAnswer}
                  onSubmitAnswer={handleSubmitAnswer}
                />
              </div>
            ) : (
              <>
                {activeSection === 'questions' && (
                  <QuestionsList
                    currentUser={currentUser}
                    onQuestionClick={handleQuestionClick}
                    onAskQuestion={() => setAskQuestionOpen(true)}
                  />
                )}
            
            {activeSection === 'home' && (
              <div className="text-center py-12">
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                  Welcome to DevQ&A
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  A community-driven platform for developers to ask questions and share knowledge
                </p>
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
                  {['javascript', 'react', 'python', 'typescript', 'node.js', 'css', 'html', 'sql', 'git', 'algorithms', 'docker', 'aws'].map((tag) => (
                    <div key={tag} className="p-4 rounded-lg bg-gradient-card shadow-soft hover:shadow-medium transition-shadow cursor-pointer">
                      <div className="tag mb-2">{tag}</div>
                      <p className="text-sm text-muted-foreground">
                        {Math.floor(Math.random() * 500) + 50} questions
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'users' && (
              <div>
                <h1 className="text-3xl font-bold mb-6">Users</h1>
                <p className="text-muted-foreground mb-8">
                  Top contributors in our community
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'Sarah Smith', reputation: 2890, questions: 45, answers: 123 },
                    { name: 'Emily Chen', reputation: 3456, questions: 67, answers: 89 },
                    { name: 'David Wilson', reputation: 1789, questions: 23, answers: 156 },
                    { name: 'John Doe', reputation: 1245, questions: 34, answers: 78 },
                    { name: 'Mike Johnson', reputation: 567, questions: 12, answers: 45 },
                    { name: 'Lisa Brown', reputation: 4123, questions: 89, answers: 234 }
                  ].map((user) => (
                    <div key={user.name} className="p-4 rounded-lg bg-gradient-card shadow-soft hover:shadow-medium transition-shadow cursor-pointer">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.reputation} reputation</div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.questions} questions • {user.answers} answers
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
            )}
          </div>
        </main>
      </div>

      {/* Auth Dialog */}
      <AuthDialog
        isOpen={authDialog.isOpen}
        onClose={() => setAuthDialog({ isOpen: false, mode: 'login' })}
        mode={authDialog.mode}
        onSubmit={handleAuthSubmit}
      />

      {/* Ask Question Dialog */}
      <AskQuestionForm
        isOpen={askQuestionOpen}
        onClose={() => setAskQuestionOpen(false)}
        onSubmit={handleQuestionSubmit}
      />
    </div>
  );
};

export default Index;

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { QuestionsList } from "@/components/questions/QuestionsList";
import { AskQuestionForm } from "@/components/questions/AskQuestionForm";
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
    // In a real app, this would navigate to the question detail page
    console.log('Navigate to question:', questionId);
  };

  const handleQuestionSubmit = (questionData: any) => {
    // In a real app, this would save to the backend
    console.log('New question:', questionData);
    toast({
      title: "Question posted!",
      description: "Your question has been posted successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        currentUser={currentUser}
        onAuthAction={handleAuthAction}
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

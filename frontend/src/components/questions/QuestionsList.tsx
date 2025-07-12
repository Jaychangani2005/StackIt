import { useState } from "react";
import { Search, Filter, Plus, SortAsc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuestionCard } from "./QuestionCard";

// Extended mock data for pagination testing
const mockQuestions = [
  {
    id: '1',
    title: 'How to implement authentication in React with JWT tokens?',
    description: 'I\'m building a React application and need to implement user authentication using JWT tokens. What\'s the best approach for storing tokens and handling authentication state?',
    tags: ['react', 'javascript', 'jwt', 'authentication'],
    author: { name: 'John Doe', reputation: 1245 },
    votes: 15,
    answers: 3,
    views: 156,
    createdAt: '2024-01-15T10:30:00Z',
    hasAcceptedAnswer: true,
    userVote: null
  },
  {
    id: '2',
    title: 'Python list comprehension vs map() performance comparison',
    description: 'Which is more efficient for large datasets - list comprehensions or the map() function? Looking for benchmarks and best practices.',
    tags: ['python', 'performance', 'list-comprehension'],
    author: { name: 'Sarah Smith', reputation: 2890 },
    votes: 23,
    answers: 7,
    views: 324,
    createdAt: '2024-01-14T15:45:00Z',
    userVote: 'up' as 'up' | 'down' | null
  },
  {
    id: '3',
    title: 'CSS Grid vs Flexbox: When to use which one?',
    description: 'I\'m confused about when to use CSS Grid and when to use Flexbox. Can someone explain the differences and provide use cases for each?',
    tags: ['css', 'css-grid', 'flexbox', 'layout'],
    author: { name: 'Mike Johnson', reputation: 567 },
    votes: 8,
    answers: 2,
    views: 89,
    createdAt: '2024-01-14T09:20:00Z'
  },
  {
    id: '4',
    title: 'TypeScript strict mode configuration best practices',
    description: 'What are the recommended TypeScript strict mode settings for a production React application? Looking for a balance between type safety and development experience.',
    tags: ['typescript', 'react', 'configuration', 'strict-mode'],
    author: { name: 'Emily Chen', reputation: 3420 },
    votes: 31,
    answers: 5,
    views: 445,
    createdAt: '2024-01-13T14:15:00Z',
    hasAcceptedAnswer: true
  },
  {
    id: '5',
    title: 'Node.js memory leak debugging techniques',
    description: 'I\'m experiencing memory leaks in my Node.js application. What are the best tools and techniques for identifying and fixing memory leaks?',
    tags: ['node.js', 'javascript', 'debugging', 'memory-leak'],
    author: { name: 'David Wilson', reputation: 1890 },
    votes: 19,
    answers: 4,
    views: 267,
    createdAt: '2024-01-13T11:30:00Z'
  },
  {
    id: '6',
    title: 'Git workflow for feature branches and code review',
    description: 'What\'s the best Git workflow for a team using feature branches? How do you handle code reviews, merge conflicts, and deployment?',
    tags: ['git', 'workflow', 'code-review', 'feature-branches'],
    author: { name: 'Lisa Brown', reputation: 2150 },
    votes: 27,
    answers: 6,
    views: 389,
    createdAt: '2024-01-12T16:45:00Z',
    hasAcceptedAnswer: true
  },
  {
    id: '7',
    title: 'Docker multi-stage builds optimization',
    description: 'How can I optimize my Docker multi-stage builds to reduce image size and build time? Looking for best practices and common pitfalls.',
    tags: ['docker', 'optimization', 'multi-stage', 'containerization'],
    author: { name: 'James Davis', reputation: 1670 },
    votes: 14,
    answers: 3,
    views: 198,
    createdAt: '2024-01-12T09:20:00Z'
  },
  {
    id: '8',
    title: 'AWS Lambda cold start optimization strategies',
    description: 'What are the most effective strategies for reducing AWS Lambda cold start times? Looking for both code-level and infrastructure optimizations.',
    tags: ['aws', 'lambda', 'optimization', 'serverless'],
    author: { name: 'Maria Garcia', reputation: 2980 },
    votes: 22,
    answers: 4,
    views: 312,
    createdAt: '2024-01-11T13:10:00Z'
  },
  {
    id: '9',
    title: 'Algorithm complexity analysis for sorting algorithms',
    description: 'Can someone explain the time and space complexity of different sorting algorithms? When should I use quicksort vs mergesort vs heapsort?',
    tags: ['algorithms', 'sorting', 'complexity', 'data-structures'],
    author: { name: 'Alex Thompson', reputation: 1340 },
    votes: 18,
    answers: 5,
    views: 245,
    createdAt: '2024-01-11T10:30:00Z',
    hasAcceptedAnswer: true
  },
  {
    id: '10',
    title: 'SQL query optimization for large datasets',
    description: 'I have a database with millions of records and my queries are slow. What are the best practices for optimizing SQL queries and database performance?',
    tags: ['sql', 'optimization', 'database', 'performance'],
    author: { name: 'Rachel Lee', reputation: 2760 },
    votes: 25,
    answers: 7,
    views: 423,
    createdAt: '2024-01-10T15:20:00Z'
  }
];

interface QuestionsListProps {
  currentUser?: {
    name: string;
    email: string;
    reputation: number;
  } | null;
  onQuestionClick: (questionId: string) => void;
  onAskQuestion: () => void;
  selectedTag?: string | null;
  onTagClick?: (tag: string) => void;
}

export function QuestionsList({ currentUser, onQuestionClick, onAskQuestion, selectedTag, onTagClick }: QuestionsListProps) {
  const [questions, setQuestions] = useState(mockQuestions);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const handleVote = (questionId: string, voteType: 'up' | 'down') => {
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        const currentVote = q.userVote;
        let newVote: 'up' | 'down' | null = voteType;
        let voteChange = 0;

        if (currentVote === voteType) {
          // Remove vote
          newVote = null;
          voteChange = voteType === 'up' ? -1 : 1;
        } else if (currentVote === null) {
          // Add new vote
          voteChange = voteType === 'up' ? 1 : -1;
        } else {
          // Change vote
          voteChange = voteType === 'up' ? 2 : -2;
        }

        return {
          ...q,
          userVote: newVote,
          votes: q.votes + voteChange
        };
      }
      return q;
    }));
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         q.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         q.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Apply tag filter if selectedTag is provided
    const matchesTag = selectedTag ? q.tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase()) : true;
    
    if (filterBy === 'unanswered') return matchesSearch && matchesTag && q.answers === 0;
    if (filterBy === 'solved') return matchesSearch && matchesTag && q.hasAcceptedAnswer;
    return matchesSearch && matchesTag;
  });

  // Sort questions
  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'most-voted':
        return b.votes - a.votes;
      case 'most-answered':
        return b.answers - a.answers;
      case 'most-viewed':
        return b.views - a.views;
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedQuestions.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentQuestions = sortedQuestions.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {selectedTag ? `Questions tagged "${selectedTag}"` : 'Questions'}
          </h1>
          <p className="text-muted-foreground">
            {selectedTag 
              ? `${filteredQuestions.length} questions found for "${selectedTag}"`
              : `${filteredQuestions.length} questions found`
            }
          </p>
        </div>
        {currentUser && (
          <Button onClick={onAskQuestion} className="gradient-primary">
            <Plus className="h-4 w-4 mr-2" />
            Ask Question
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unanswered">Unanswered</SelectItem>
              <SelectItem value="solved">Solved</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="most-voted">Most Voted</SelectItem>
              <SelectItem value="most-answered">Most Answered</SelectItem>
              <SelectItem value="most-viewed">Most Viewed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {currentQuestions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              {selectedTag 
                ? `No questions found for "${selectedTag}"`
                : 'No questions found'
              }
            </div>
            {currentUser && (
              <Button onClick={onAskQuestion} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Ask the first question
              </Button>
            )}
          </div>
        ) : (
          currentQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onVote={handleVote}
              onClick={() => onQuestionClick(question.id)}
              currentUser={currentUser}
              onTagClick={onTagClick}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(pageNum)}
                className="w-8 h-8 p-0"
              >
                {pageNum}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
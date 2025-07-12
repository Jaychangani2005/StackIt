import { useState } from "react";
import { Search, Filter, Plus, SortAsc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuestionCard } from "./QuestionCard";

// Mock data
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
    title: 'How to optimize database queries in PostgreSQL?',
    description: 'My application is running slow database queries. What are the best practices for optimizing PostgreSQL queries and improving performance?',
    tags: ['postgresql', 'database', 'performance', 'sql'],
    author: { name: 'Emily Chen', reputation: 3456 },
    votes: 31,
    answers: 12,
    views: 567,
    createdAt: '2024-01-13T14:15:00Z',
    hasAcceptedAnswer: true
  },
  {
    id: '5',
    title: 'Understanding async/await vs Promises in JavaScript',
    description: 'What\'s the difference between using async/await and traditional Promise chains? Which one should I prefer and why?',
    tags: ['javascript', 'async-await', 'promises', 'es6'],
    author: { name: 'David Wilson', reputation: 1789 },
    votes: 19,
    answers: 5,
    views: 234,
    createdAt: '2024-01-13T11:30:00Z'
  }
];

interface QuestionsListProps {
  currentUser?: any;
  onQuestionClick: (questionId: string) => void;
  onAskQuestion: () => void;
}

export function QuestionsList({ currentUser, onQuestionClick, onAskQuestion }: QuestionsListProps) {
  const [questions, setQuestions] = useState(mockQuestions);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');

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
    
    if (filterBy === 'unanswered') return matchesSearch && q.answers === 0;
    if (filterBy === 'solved') return matchesSearch && q.hasAcceptedAnswer;
    return matchesSearch;
  });

  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    switch (sortBy) {
      case 'votes':
        return b.votes - a.votes;
      case 'answers':
        return b.answers - a.answers;
      case 'views':
        return b.views - a.views;
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      default: // newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Questions</h1>
          <p className="text-muted-foreground">
            {filteredQuestions.length} questions found
          </p>
        </div>
        <Button onClick={onAskQuestion} className="gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          Ask Question
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="votes">Most Votes</SelectItem>
              <SelectItem value="answers">Most Answers</SelectItem>
              <SelectItem value="views">Most Views</SelectItem>
            </SelectContent>
          </Select>

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
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {sortedQuestions.length > 0 ? (
          sortedQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onVote={handleVote}
              onClick={onQuestionClick}
              currentUser={currentUser}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No questions found matching your criteria.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setFilterBy('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { Search, Filter, Plus, SortAsc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuestionCard } from "./QuestionCard";
import { api, Question } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface QuestionsListProps {
  currentUser?: any;
  onQuestionClick: (questionId: string) => void;
  onAskQuestion: () => void;
}

export function QuestionsList({ currentUser, onQuestionClick, onAskQuestion }: QuestionsListProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const { toast } = useToast();

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchQuestions();
  }, [debouncedSearch, sortBy, filterBy, pagination.page]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await api.getQuestions({
        page: pagination.page,
        limit: pagination.limit,
        sort: sortBy,
        filter: filterBy,
        search: debouncedSearch
      });
      
      setQuestions(response.questions);
      setPagination(response.pagination);
    } catch (error: any) {
      toast({
        title: 'Error loading questions',
        description: error.message || 'Failed to load questions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (questionId: string, voteType: 'up' | 'down') => {
    if (!currentUser) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to vote on questions',
        variant: 'destructive',
      });
      return;
    }

    try {
      await api.voteQuestion(questionId, voteType);
      
      // Update the question in the list
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
    } catch (error: any) {
      toast({
        title: 'Error voting',
        description: error.message || 'Failed to record vote',
        variant: 'destructive',
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Questions</h1>
          <p className="text-muted-foreground">
            {loading ? 'Loading...' : `${pagination.total} questions found`}
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
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : questions.length > 0 ? (
          <>
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onVote={handleVote}
                onClick={onQuestionClick}
                currentUser={currentUser}
              />
            ))}
            
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No questions found matching your criteria.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setFilterBy('all');
                setPagination(prev => ({ ...prev, page: 1 }));
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
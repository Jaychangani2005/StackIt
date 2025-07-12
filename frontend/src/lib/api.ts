const API_BASE_URL = 'http://localhost:3000/api';

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  reputation?: number;
  createdAt?: string;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  tags: string[];
  author: {
    id: number;
    name: string;
    reputation: number;
  };
  votes: number;
  answers: number;
  views: number;
  createdAt: string;
  hasAcceptedAnswer: boolean;
  userVote?: 'up' | 'down' | null;
}

export interface Answer {
  id: string;
  content: string;
  author: {
    id: number;
    name: string;
    reputation: number;
  };
  votes: number;
  isAccepted: boolean;
  createdAt: string;
  userVote?: 'up' | 'down' | null;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface QuestionsResponse {
  questions: Question[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// API Service Class
class ApiService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('authToken');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async register(userData: { name: string; email: string; password: string }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    this.setToken(response.token);
    return response;
  }

  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    this.setToken(response.token);
    return response;
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Questions
  async getQuestions(params?: {
    page?: number;
    limit?: number;
    sort?: string;
    filter?: string;
    search?: string;
  }): Promise<QuestionsResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/questions${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<QuestionsResponse>(endpoint);
  }

  async getQuestionById(id: string): Promise<Question> {
    return this.request<Question>(`/questions/${id}`);
  }

  async createQuestion(questionData: {
    title: string;
    description: string;
    tags: string[];
  }): Promise<{ message: string; questionId: string }> {
    return this.request<{ message: string; questionId: string }>('/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  }

  async updateQuestion(
    id: string,
    questionData: {
      title: string;
      description: string;
      tags: string[];
    }
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(questionData),
    });
  }

  async deleteQuestion(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/questions/${id}`, {
      method: 'DELETE',
    });
  }

  async voteQuestion(id: string, voteType: 'up' | 'down'): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/questions/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ voteType }),
    });
  }

  async acceptAnswer(questionId: string, answerId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/questions/${questionId}/accept-answer/${answerId}`, {
      method: 'POST',
    });
  }

  // Answers
  async getQuestionAnswers(questionId: string): Promise<Answer[]> {
    return this.request<Answer[]>(`/questions/${questionId}/answers`);
  }

  async createAnswer(answerData: {
    questionId: string;
    content: string;
  }): Promise<{ message: string; answerId: string }> {
    return this.request<{ message: string; answerId: string }>('/answers', {
      method: 'POST',
      body: JSON.stringify(answerData),
    });
  }

  async updateAnswer(
    id: string,
    answerData: { content: string }
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/answers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(answerData),
    });
  }

  async deleteAnswer(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/answers/${id}`, {
      method: 'DELETE',
    });
  }

  async voteAnswer(id: string, voteType: 'up' | 'down'): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/answers/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ voteType }),
    });
  }

  // Users
  async getCurrentUser(): Promise<User> {
    return this.request<User>('/users/profile/me');
  }

  async getUserById(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  async updateProfile(profileData: { name: string }): Promise<{ message: string }> {
    return this.request<{ message: string }>('/users/profile/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getUserQuestions(params?: {
    page?: number;
    limit?: number;
  }): Promise<Question[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/users/profile/me/questions${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<Question[]>(endpoint);
  }

  async getUserAnswers(params?: {
    page?: number;
    limit?: number;
  }): Promise<Answer[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/users/profile/me/answers${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<Answer[]>(endpoint);
  }
}

// Create and export a singleton instance
export const api = new ApiService(); 
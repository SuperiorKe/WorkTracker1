export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface WorkLog {
  id: string;
  userId: string;
  title: string;
  description: string;
  date: string;
  duration: number; // in minutes
  imageUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
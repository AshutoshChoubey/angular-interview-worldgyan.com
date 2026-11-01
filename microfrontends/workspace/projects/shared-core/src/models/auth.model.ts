export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  roles: string[];
  permissions: string[];
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}


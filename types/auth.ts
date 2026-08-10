export interface UserProfile {
  id: string;
  email: string;
  role: 'USER' | 'MERCHANT' | 'ADMIN';
  isKycVerified: boolean;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  token: string | null;
}

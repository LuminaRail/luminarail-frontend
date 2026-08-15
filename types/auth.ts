export interface UserProfile {
  id: string;
  email: string;
  phone?: string | null;
  role: 'USER' | 'MERCHANT' | 'ADMIN' | 'SUPER_ADMIN';
  status?: string;
  isKycVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  phone?: string;
  role?: 'USER' | 'MERCHANT' | 'ADMIN';
}

export interface AuthResponseData {
  user: UserProfile;
  token: string;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  token: string | null;
}

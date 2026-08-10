'use client';

import { useState } from 'react';
import { AuthState } from '@/types/auth';

export function useAuth() {
  const [authState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    token: null,
  });

  return {
    ...authState,
  };
}

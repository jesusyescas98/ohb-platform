'use client';

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook to access authentication context
 * Usage: const { user, isLoggedIn, email, role, signIn, logout } = useAuth();
 *
 * Returns:
 * - isLoggedIn: boolean - Whether user is logged in
 * - email: string | null - User email address
 * - role: 'admin' | 'asesor' | 'cliente' | null - User role
 * - fullName: string | null - User full name
 * - phone: string | null - User phone
 * - sessionToken: string | null - Current session token
 * - loginWithPassword: (email, password, rememberMe?) => { success, error? }
 * - register: (email, password, role, fullName, phone) => { success, error? }
 * - login: (email, role, fullName?, phone?) => void
 * - logout: () => void
 * - isAdmin: boolean - Computed: user.role === 'admin'
 * - isAdvisor: boolean - Computed: user.role === 'asesor'
 * - canManageContent: boolean - Computed: isAdmin || isAdvisor
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export default useAuth;

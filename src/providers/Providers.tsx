'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '../context/AuthContext';
import CookieConsent from '../components/CookieConsent';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Root provider wrapper combining all context providers
 * Usage: Wrap your app root (layout.tsx) with this component
 *
 * Providers included:
 * - AuthProvider: Authentication context with session management
 * - CookieConsent: GDPR cookie banner
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      {children}
      <CookieConsent />
    </AuthProvider>
  );
}

export default Providers;

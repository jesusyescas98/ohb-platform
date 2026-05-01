"use client";

import { useEffect, useState, useRef, ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

interface RouteGuardProps {
  children: ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export default function RouteGuard({ children, allowedRoles = ['admin', 'asesor'], redirectTo = '/' }: RouteGuardProps) {
  const { isLoggedIn, role, isSessionValid, updateActivity } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const hasChecked = useRef(false);

  useEffect(() => {
    // Wait for auth state to be restored from localStorage
    // The AuthContext useEffect runs on mount and restores from localStorage
    const timer = setTimeout(() => {
      if (hasChecked.current) return;
      hasChecked.current = true;

      if (!isLoggedIn || !isSessionValid()) {
        window.location.href = redirectTo;
        return;
      }

      if (allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
        window.location.href = redirectTo;
        return;
      }

      updateActivity();
      setIsAuthorized(true);
      setIsChecking(false);
    }, 1000); // Give AuthContext enough time to restore from localStorage (increased to 1s)

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, role]);

  // Track activity on user interactions
  useEffect(() => {
    if (!isAuthorized) return;

    let debounceTimer: ReturnType<typeof setTimeout>;
    const handleActivity = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => updateActivity(), 5000); // Debounce to avoid excessive updates
    };
    
    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);

    return () => {
      clearTimeout(debounceTimer);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [isAuthorized, updateActivity]);

  if (isChecking) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        gap: '1.5rem',
        color: 'var(--text-primary)'
      }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: '3px solid transparent',
          borderTopColor: 'var(--accent-silver)',
          borderRightColor: 'var(--accent-silver)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Verificando credenciales de seguridad...</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return <>{children}</>;
}


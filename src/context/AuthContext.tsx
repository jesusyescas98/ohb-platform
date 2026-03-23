"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { UsersDB, ActivityLogDB, initializeDatabase } from '../lib/database';

// ========== SECURITY UTILITIES ==========

const encode = (data: string): string => {
  try { return btoa(encodeURIComponent(data)); } catch { return ''; }
};

const decode = (data: string): string => {
  try { return decodeURIComponent(atob(data)); } catch { return ''; }
};

const generateSessionToken = (): string => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(48);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let token = '';
  for (let i = 0; i < 96; i++) { token += chars.charAt(Math.floor(Math.random() * chars.length)); }
  return token;
};

const getBrowserFingerprint = (): string => {
  if (typeof window === 'undefined') return 'server';
  const components = [
    navigator.userAgent, navigator.language,
    screen.colorDepth?.toString() || '', `${screen.width}x${screen.height}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone || '',
  ];
  const str = components.join('|');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
};

const sanitize = (input: string): string => {
  let cleaned = input.replace(/\0/g, '');
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  const div = typeof document !== 'undefined' ? document.createElement('div') : null;
  if (div) { div.textContent = cleaned; return div.innerHTML; }
  return cleaned.replace(/[<>"'&`]/g, (char) => {
    const entities: Record<string, string> = {'<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '&': '&amp;', '`': '&#x60;'};
    return entities[char] || char;
  });
};

export const validatePasswordStrength = (password: string): { score: number; label: string; color: string; requirements: { met: boolean; text: string }[] } => {
  const requirements = [
    { met: password.length >= 8, text: 'Mínimo 8 caracteres' },
    { met: /[A-Z]/.test(password), text: 'Al menos una mayúscula' },
    { met: /[a-z]/.test(password), text: 'Al menos una minúscula' },
    { met: /[0-9]/.test(password), text: 'Al menos un número' },
    { met: /[!@#$%^&*(),.?"':{}|<>]/.test(password), text: 'Al menos un carácter especial' },
  ];
  const score = requirements.filter(r => r.met).length;
  const labels: Record<number, { label: string; color: string }> = {
    0: { label: 'Muy débil', color: '#ef4444' }, 1: { label: 'Débil', color: '#f87171' },
    2: { label: 'Aceptable', color: '#f59e0b' }, 3: { label: 'Buena', color: '#eab308' },
    4: { label: 'Fuerte', color: '#22c55e' }, 5: { label: 'Muy fuerte', color: '#10b981' },
  };
  return { score, ...labels[score], requirements };
};

export const validateEmail = (email: string): boolean => {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
};

// ========== AUTH INTERFACES ==========

interface AuthState {
  isLoggedIn: boolean;
  email: string | null;
  role: string | null;
  fullName: string | null;
  phone: string | null;
  sessionToken: string | null;
  loginTimestamp: number | null;
  lastActivity: number | null;
  loginAttempts: number;
  browserFingerprint: string | null;
}

interface AuthContextType extends AuthState {
  /** Register a new user. Returns { success, error? } */
  register: (email: string, password: string, role: string, fullName: string, phone: string) => { success: boolean; error?: string };
  /** Login with email+password. Returns { success, error? } */
  loginWithPassword: (email: string, password: string, rememberMe?: boolean) => { success: boolean; error?: string };
  /** Legacy login (for programmatic use) */
  login: (email: string, role: string, fullName?: string, phone?: string) => void;
  logout: (showConfirmation?: boolean) => void;
  updateActivity: () => void;
  isSessionValid: () => boolean;
  getActivityLogs: () => { timestamp: number; action: string; details: string }[];
  checkLoginAttempts: () => boolean;
  incrementLoginAttempts: () => void;
  resetLoginAttempts: () => void;
  csrfToken: string;
  isAdmin: boolean;
  isAdvisor: boolean;
  canManageContent: boolean;
}

const SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours (more practical for remember me)
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;
const STORAGE_KEY = 'ohb_secure_session';
const ATTEMPTS_KEY = 'ohb_login_attempts';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    isLoggedIn: false, email: null, role: null, fullName: null,
    phone: null, sessionToken: null, loginTimestamp: null, lastActivity: null,
    loginAttempts: 0, browserFingerprint: null,
  });

  const authRef = useRef(auth);
  authRef.current = auth;
  const [csrfToken] = useState<string>(() => generateSessionToken().substring(0, 32));

  // Initialize database on mount
  useEffect(() => {
    initializeDatabase();
  }, []);

  const logActivity = useCallback((action: string, details: string) => {
    ActivityLogDB.add({
      userEmail: authRef.current.email || 'anonymous',
      userName: authRef.current.fullName || 'Anónimo',
      action,
      details,
      module: 'auth'
    });
  }, []);

  // Session Restoration — checks DB for role
  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(STORAGE_KEY);
      if (storedAuth) {
        const decoded = decode(storedAuth);
        if (decoded) {
          const parsed = JSON.parse(decoded);
          const now = Date.now();
          if (!parsed.loginTimestamp || (now - parsed.loginTimestamp) >= SESSION_TIMEOUT) {
            localStorage.removeItem(STORAGE_KEY);
            return;
          }
          const currentFingerprint = getBrowserFingerprint();
          if (parsed.browserFingerprint && parsed.browserFingerprint !== currentFingerprint) {
            localStorage.removeItem(STORAGE_KEY);
            return;
          }
          // Verify role from DB — ALWAYS use DB as source of truth
          const userProfile = UsersDB.getByEmail(parsed.email);
          if (userProfile) {
            parsed.role = userProfile.role;
            parsed.fullName = userProfile.fullName || parsed.fullName;
            parsed.phone = userProfile.phone || parsed.phone;
          }
          setAuth({ ...parsed, lastActivity: now });
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Auto-timeout
  useEffect(() => {
    if (!auth.isLoggedIn) return;
    const interval = setInterval(() => {
      const now = Date.now();
      if (auth.lastActivity && (now - auth.lastActivity) > SESSION_TIMEOUT) {
        setAuth({
          isLoggedIn: false, email: null, role: null, fullName: null,
          phone: null, sessionToken: null, loginTimestamp: null, lastActivity: null,
          loginAttempts: 0, browserFingerprint: null,
        });
        localStorage.removeItem(STORAGE_KEY);
        logActivity('AUTO_LOGOUT', 'Sesión cerrada por inactividad');
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [auth.isLoggedIn, auth.lastActivity, logActivity]);

  // Login Attempts
  const checkLoginAttempts = useCallback((): boolean => {
    try {
      const raw = localStorage.getItem(ATTEMPTS_KEY);
      if (!raw) return true;
      const data = JSON.parse(decode(raw));
      if (data.lockoutUntil && Date.now() < data.lockoutUntil) return false;
      if (data.attempts >= MAX_LOGIN_ATTEMPTS) {
        localStorage.setItem(ATTEMPTS_KEY, encode(JSON.stringify({ attempts: data.attempts, lockoutUntil: Date.now() + LOCKOUT_DURATION })));
        return false;
      }
      return true;
    } catch { return true; }
  }, []);

  const incrementLoginAttempts = useCallback(() => {
    try {
      const raw = localStorage.getItem(ATTEMPTS_KEY);
      const data = raw ? JSON.parse(decode(raw)) : { attempts: 0 };
      data.attempts = (data.attempts || 0) + 1;
      localStorage.setItem(ATTEMPTS_KEY, encode(JSON.stringify(data)));
    } catch { /* Silent */ }
  }, []);

  const resetLoginAttempts = useCallback(() => {
    localStorage.removeItem(ATTEMPTS_KEY);
  }, []);

  // Internal method to set auth state after successful authentication
  const setLoggedIn = useCallback((email: string, role: string, fullName: string | null, phone: string | null) => {
    const token = generateSessionToken();
    const now = Date.now();
    const newState: AuthState = {
      isLoggedIn: true,
      email,
      role,
      fullName,
      phone,
      sessionToken: token,
      loginTimestamp: now,
      lastActivity: now,
      loginAttempts: 0,
      browserFingerprint: getBrowserFingerprint(),
    };
    setAuth(newState);
    localStorage.setItem(STORAGE_KEY, encode(JSON.stringify(newState)));
    resetLoginAttempts();
  }, [resetLoginAttempts]);

  // ========== REGISTER — validates uniqueness, stores in DB ==========
  const register = useCallback((email: string, password: string, role: string, fullName: string, phone: string): { success: boolean; error?: string } => {
    const sanitizedEmail = sanitize(email.toLowerCase().trim());
    const sanitizedName = sanitize(fullName.trim());
    const sanitizedPhone = sanitize(phone.trim());
    
    const result = UsersDB.register(sanitizedEmail, password, role as 'admin' | 'asesor' | 'cliente', sanitizedName, sanitizedPhone);
    if (!result.success) {
      return result;
    }

    // Auto login after registration
    setLoggedIn(sanitizedEmail, role, sanitizedName, sanitizedPhone);
    
    ActivityLogDB.add({
      userEmail: sanitizedEmail,
      userName: sanitizedName,
      action: 'REGISTER_SUCCESS',
      details: `Registro exitoso: ${sanitizedEmail} (${role})`,
      module: 'auth'
    });

    return { success: true };
  }, [setLoggedIn]);

  // ========== LOGIN WITH PASSWORD — validates email+password from DB ==========
  const loginWithPassword = useCallback((email: string, password: string, rememberMe: boolean = false): { success: boolean; error?: string } => {
    const sanitizedEmail = sanitize(email.toLowerCase().trim());
    
    const result = UsersDB.authenticate(sanitizedEmail, password);
    if (!result.success || !result.user) {
      incrementLoginAttempts();
      return { success: false, error: result.error };
    }

    const user = result.user;
    setLoggedIn(sanitizedEmail, user.role, user.fullName, user.phone);
    
    // Handle remember me
    if (rememberMe) {
      UsersDB.setRememberMe(sanitizedEmail, true);
    }
    
    ActivityLogDB.add({
      userEmail: sanitizedEmail,
      userName: user.fullName,
      action: 'LOGIN_SUCCESS',
      details: `Login exitoso: ${sanitizedEmail} (${user.role})`,
      module: 'auth'
    });

    return { success: true };
  }, [setLoggedIn, incrementLoginAttempts]);

  // ========== LEGACY LOGIN (for backward compat) ==========
  const login = useCallback((email: string, role: string, fullName?: string, phone?: string) => {
    const sanitizedEmail = sanitize(email.toLowerCase().trim());
    const sanitizedName = fullName ? sanitize(fullName.trim()) : null;
    const sanitizedPhone = phone ? sanitize(phone.trim()) : null;
    
    // Check if user exists in DB; if so, use their role
    let finalRole = role;
    const existingUser = UsersDB.getByEmail(sanitizedEmail);
    if (existingUser) {
      finalRole = existingUser.role;
      UsersDB.upsert({ ...existingUser, lastLogin: Date.now() });
    } else {
      UsersDB.upsert({
        email: sanitizedEmail,
        passwordHash: '',
        role: finalRole as 'admin' | 'asesor' | 'cliente',
        fullName: sanitizedName || '',
        phone: sanitizedPhone || '',
        createdAt: Date.now(),
        lastLogin: Date.now(),
      });
    }
    
    setLoggedIn(sanitizedEmail, finalRole, existingUser?.fullName || sanitizedName, existingUser?.phone || sanitizedPhone);
    logActivity('LOGIN_SUCCESS', `Login exitoso: ${sanitizedEmail} (${finalRole})`);
  }, [setLoggedIn, logActivity]);

  const logout = useCallback((showConfirmation: boolean = false) => {
    const performLogout = () => {
      logActivity('LOGOUT', `Cierre de sesión: ${authRef.current.email}`);
      setAuth({
        isLoggedIn: false, email: null, role: null, fullName: null,
        phone: null, sessionToken: null, loginTimestamp: null, lastActivity: null,
        loginAttempts: 0, browserFingerprint: null,
      });
      localStorage.removeItem(STORAGE_KEY);
      if (typeof sessionStorage !== 'undefined') sessionStorage.clear();
      window.location.href = '/';
    };
    performLogout();
  }, [logActivity]);

  const updateActivity = useCallback(() => {
    if (authRef.current.isLoggedIn) {
      const now = Date.now();
      setAuth(prev => {
        const updatedState = { ...prev, lastActivity: now };
        localStorage.setItem(STORAGE_KEY, encode(JSON.stringify(updatedState)));
        return updatedState;
      });
    }
  }, []);

  const isSessionValid = useCallback((): boolean => {
    const current = authRef.current;
    if (!current.isLoggedIn || !current.sessionToken || !current.loginTimestamp) return false;
    return (Date.now() - current.loginTimestamp) < SESSION_TIMEOUT;
  }, []);

  const getActivityLogs = useCallback(() => {
    return ActivityLogDB.getRecent(20).map(l => ({
      timestamp: l.timestamp,
      action: l.action,
      details: l.details
    }));
  }, []);

  // Computed role checks
  const isAdmin = auth.role === 'admin';
  const isAdvisor = auth.role === 'asesor';
  const canManageContent = isAdmin || isAdvisor;

  return (
    <AuthContext.Provider value={{
      ...auth, register, loginWithPassword, login, logout, updateActivity, isSessionValid, getActivityLogs,
      checkLoginAttempts, incrementLoginAttempts, resetLoginAttempts, csrfToken,
      isAdmin, isAdvisor, canManageContent,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

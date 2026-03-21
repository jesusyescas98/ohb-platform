"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';

// ========== SECURITY UTILITIES ==========

// Obfuscation for localStorage (prevents casual reading of session data)
const encode = (data: string): string => {
  try {
    return btoa(encodeURIComponent(data));
  } catch {
    return '';
  }
};

const decode = (data: string): string => {
  try {
    return decodeURIComponent(atob(data));
  } catch {
    return '';
  }
};

// Cryptographically secure token generation
const generateSessionToken = (): string => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(48);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  // Fallback for environments without crypto
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let token = '';
  for (let i = 0; i < 96; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

// Generate a simple browser fingerprint for session binding
const getBrowserFingerprint = (): string => {
  if (typeof window === 'undefined') return 'server';
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth?.toString() || '',
    `${screen.width}x${screen.height}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone || '',
  ];
  // Simple hash
  const str = components.join('|');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
};

// Robust sanitization to prevent XSS - covers multiple attack vectors
const sanitize = (input: string): string => {
  // Remove null bytes
  let cleaned = input.replace(/\0/g, '');
  // Strip potential script injections
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // Encode HTML entities
  const div = typeof document !== 'undefined' ? document.createElement('div') : null;
  if (div) {
    div.textContent = cleaned;
    return div.innerHTML;
  }
  return cleaned.replace(/[<>"'&`]/g, (char) => {
    const entities: Record<string, string> = {
      '<': '&lt;', '>': '&gt;', '"': '&quot;',
      "'": '&#x27;', '&': '&amp;', '`': '&#x60;'
    };
    return entities[char] || char;
  });
};

// Password strength validator
export const validatePasswordStrength = (password: string): { score: number; label: string; color: string; requirements: { met: boolean; text: string }[] } => {
  const requirements = [
    { met: password.length >= 8, text: 'Mínimo 8 caracteres' },
    { met: /[A-Z]/.test(password), text: 'Al menos una mayúscula' },
    { met: /[a-z]/.test(password), text: 'Al menos una minúscula' },
    { met: /[0-9]/.test(password), text: 'Al menos un número' },
    { met: /[!@#$%^&*(),.?":{}|<>]/.test(password), text: 'Al menos un carácter especial' },
  ];
  const score = requirements.filter(r => r.met).length;
  const labels: Record<number, { label: string; color: string }> = {
    0: { label: 'Muy débil', color: '#ef4444' },
    1: { label: 'Débil', color: '#f87171' },
    2: { label: 'Aceptable', color: '#f59e0b' },
    3: { label: 'Buena', color: '#eab308' },
    4: { label: 'Fuerte', color: '#22c55e' },
    5: { label: 'Muy fuerte', color: '#10b981' },
  };
  return { score, ...labels[score], requirements };
};

// Email validator
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

interface ActivityLog {
  timestamp: number;
  action: string;
  details: string;
}

interface AuthContextType extends AuthState {
  login: (email: string, role: string, fullName?: string, phone?: string) => void;
  logout: (showConfirmation?: boolean) => void;
  updateActivity: () => void;
  isSessionValid: () => boolean;
  getActivityLogs: () => ActivityLog[];
  checkLoginAttempts: () => boolean;
  incrementLoginAttempts: () => void;
  resetLoginAttempts: () => void;
  csrfToken: string;
}

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const STORAGE_KEY = 'ohb_secure_session';
const LOGS_KEY = 'ohb_activity_logs';
const ATTEMPTS_KEY = 'ohb_login_attempts';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    isLoggedIn: false,
    email: null,
    role: null,
    fullName: null,
    phone: null,
    sessionToken: null,
    loginTimestamp: null,
    lastActivity: null,
    loginAttempts: 0,
    browserFingerprint: null,
  });

  // Use a ref to track auth without causing re-renders in callbacks
  const authRef = useRef(auth);
  authRef.current = auth;

  const [csrfToken] = useState<string>(() => generateSessionToken().substring(0, 32));

  // ========== ACTIVITY LOGGING ==========
  const logActivity = useCallback((action: string, details: string) => {
    try {
      const logsRaw = localStorage.getItem(LOGS_KEY);
      const logs: ActivityLog[] = logsRaw ? JSON.parse(decode(logsRaw)) : [];
      logs.unshift({ timestamp: Date.now(), action, details });
      // Keep only last 100 logs
      const trimmedLogs = logs.slice(0, 100);
      localStorage.setItem(LOGS_KEY, encode(JSON.stringify(trimmedLogs)));
    } catch {
      // Silent fail for logging
    }
  }, []);

  // ========== SESSION RESTORATION ==========
  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(STORAGE_KEY);
      if (storedAuth) {
        const decoded = decode(storedAuth);
        if (decoded) {
          const parsed = JSON.parse(decoded);
          const now = Date.now();
          // Check if session is expired
          if (!parsed.loginTimestamp || (now - parsed.loginTimestamp) >= SESSION_TIMEOUT) {
            localStorage.removeItem(STORAGE_KEY);
            logActivity('SESSION_EXPIRED', 'Sesión expirada automáticamente');
            return;
          }
          // Verify browser fingerprint to detect session hijacking
          const currentFingerprint = getBrowserFingerprint();
          if (parsed.browserFingerprint && parsed.browserFingerprint !== currentFingerprint) {
            localStorage.removeItem(STORAGE_KEY);
            logActivity('SESSION_HIJACK_DETECTED', 'Fingerprint del navegador no coincide — sesión invalidada');
            return;
          }
          setAuth({ ...parsed, lastActivity: now });
          logActivity('SESSION_RESTORED', `Sesión restaurada para ${parsed.email}`);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [logActivity]);

  // ========== AUTO-TIMEOUT CHECK ==========
  useEffect(() => {
    if (!auth.isLoggedIn) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (auth.lastActivity && (now - auth.lastActivity) > SESSION_TIMEOUT) {
        setAuth({
          isLoggedIn: false, email: null, role: null, fullName: null,
          phone: null, sessionToken: null, loginTimestamp: null, lastActivity: null, loginAttempts: 0,
          browserFingerprint: null,
        });
        localStorage.removeItem(STORAGE_KEY);
        logActivity('AUTO_LOGOUT', 'Sesión cerrada por inactividad');
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [auth.isLoggedIn, auth.lastActivity, logActivity]);

  // ========== LOGIN ATTEMPTS ==========
  const checkLoginAttempts = useCallback((): boolean => {
    try {
      const raw = localStorage.getItem(ATTEMPTS_KEY);
      if (!raw) return true;
      const data = JSON.parse(decode(raw));
      if (data.lockoutUntil && Date.now() < data.lockoutUntil) {
        return false; // Still locked out
      }
      if (data.attempts >= MAX_LOGIN_ATTEMPTS) {
        // Set lockout
        const lockoutData = { attempts: data.attempts, lockoutUntil: Date.now() + LOCKOUT_DURATION };
        localStorage.setItem(ATTEMPTS_KEY, encode(JSON.stringify(lockoutData)));
        return false;
      }
      return true;
    } catch {
      return true;
    }
  }, []);

  const incrementLoginAttempts = useCallback(() => {
    try {
      const raw = localStorage.getItem(ATTEMPTS_KEY);
      const data = raw ? JSON.parse(decode(raw)) : { attempts: 0 };
      data.attempts = (data.attempts || 0) + 1;
      localStorage.setItem(ATTEMPTS_KEY, encode(JSON.stringify(data)));
      logActivity('LOGIN_ATTEMPT_FAILED', `Intento fallido #${data.attempts}`);
    } catch {
      // Silent fail
    }
  }, [logActivity]);

  const resetLoginAttempts = useCallback(() => {
    localStorage.removeItem(ATTEMPTS_KEY);
  }, []);

  // ========== CORE AUTH FUNCTIONS ==========
  const login = useCallback((email: string, role: string, fullName?: string, phone?: string) => {
    const sanitizedEmail = sanitize(email.toLowerCase().trim());
    const sanitizedRole = sanitize(role);
    const sanitizedName = fullName ? sanitize(fullName.trim()) : null;
    const sanitizedPhone = phone ? sanitize(phone.trim()) : null;
    const token = generateSessionToken();
    const now = Date.now();

    const newState: AuthState = {
      isLoggedIn: true,
      email: sanitizedEmail,
      role: sanitizedRole,
      fullName: sanitizedName,
      phone: sanitizedPhone,
      sessionToken: token,
      loginTimestamp: now,
      lastActivity: now,
      loginAttempts: 0,
      browserFingerprint: getBrowserFingerprint(),
    };

    setAuth(newState);
    localStorage.setItem(STORAGE_KEY, encode(JSON.stringify(newState)));
    resetLoginAttempts();
    logActivity('LOGIN_SUCCESS', `Login exitoso: ${sanitizedEmail} (${sanitizedRole})`);
  }, [resetLoginAttempts, logActivity]);

  const logout = useCallback((showConfirmation: boolean = false) => {
    const performLogout = () => {
      logActivity('LOGOUT', `Cierre de sesión: ${authRef.current.email}`);
      setAuth({
        isLoggedIn: false, email: null, role: null, fullName: null,
        phone: null, sessionToken: null, loginTimestamp: null, lastActivity: null, loginAttempts: 0,
        browserFingerprint: null,
      });
      // Clear all session-related data
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LOGS_KEY);
      localStorage.removeItem(ATTEMPTS_KEY);
      // Clear sessionStorage too
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
      window.location.href = '/';
    };

    if (showConfirmation) {
      performLogout();
    } else {
      performLogout();
    }
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

  const getActivityLogs = useCallback((): ActivityLog[] => {
    try {
      const raw = localStorage.getItem(LOGS_KEY);
      if (!raw) return [];
      return JSON.parse(decode(raw));
    } catch {
      return [];
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      ...auth,
      login,
      logout,
      updateActivity,
      isSessionValid,
      getActivityLogs,
      checkLoginAttempts,
      incrementLoginAttempts,
      resetLoginAttempts,
      csrfToken,
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

/**
 * Global constants for OHB Platform
 * Centralized configuration for all hardcoded values
 */

// ========== COMPANY INFO ==========
export const COMPANY = {
  name: 'OHB Asesorías y Consultorías',
  shortName: 'OHB',
  domain: 'ohbasesoriasyconsultorias.com',
  website: 'https://www.ohbasesoriasyconsultorias.com',
  email: 'jyeskas1111@gmail.com',
  phone: '+526561327685',
  phoneDisplay: '656-132-7685',
  whatsapp: '+526561327685',
  address: {
    street: 'Tomás Fernández #7818, local 19',
    colony: 'Col. Buscari',
    city: 'Ciudad Juárez',
    state: 'Chihuahua',
    country: 'México',
    zipCode: '32460',
    full: 'Tomás Fernández #7818, local 19, Col. Buscari, 32460 Juárez, Chihuahua',
  },
  socialMedia: {
    facebook: 'https://facebook.com/ohbasesoriasyconsultorias',
    instagram: 'https://instagram.com/ohbasesoriasyconsultorias',
    whatsapp: 'https://wa.me/526561327685',
  },
};

// ========== DESIGN TOKENS ==========
export const COLORS = {
  primary: '#D4A843', // Gold
  primaryLight: '#E8C96A',
  primaryDark: '#B08A2E',
  background: '#0A0A0F',
  surface: '#12121C',
  card: '#18182A',
  text: '#FFFFFF',
  textSecondary: '#B0B0B8',
  border: '#2A2A3E',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

export const SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '2.5rem',
  '3xl': '3rem',
};

export const FONT_SIZES = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
};

export const BREAKPOINTS = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// ========== API CONFIGURATION ==========
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000,
};

// ========== SUPABASE CONFIGURATION ==========
export const SUPABASE_CONFIG = {
  tables: {
    users: 'users',
    properties: 'properties',
    leads: 'leads',
    orders: 'orders',
    courses: 'courses',
    enrollments: 'enrollments',
    certificates: 'certificates',
    transactions: 'transactions',
  },
  storage: {
    properties: 'properties',
    courses: 'courses',
    certificates: 'certificates',
    profiles: 'profiles',
  },
};

// ========== AUTH CONFIGURATION ==========
export const AUTH_CONFIG = {
  sessionCookieName: 'ohb_session',
  roleCookieName: 'ohb_role',
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  refreshTokenTimeout: 7 * 24 * 60 * 60 * 1000, // 7 days
  tokenRefreshThreshold: 5 * 60 * 1000, // 5 minutes before expiry
};

// ========== PASSWORD REQUIREMENTS ==========
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

// ========== ROLES & PERMISSIONS ==========
export const ROLES = {
  ADMIN: 'admin',
  ASESOR: 'asesor',
  CLIENTE: 'cliente',
} as const;

export const ROLE_LABELS = {
  admin: 'Administrador',
  asesor: 'Asesor',
  cliente: 'Cliente',
} as const;

export const PERMISSIONS = {
  admin: ['all'],
  asesor: ['read:properties', 'write:leads', 'read:clients', 'read:properties'],
  cliente: ['read:properties', 'read:own:courses', 'read:own:profile'],
} as const;

// ========== PROPERTY CONFIGURATION ==========
export const PROPERTY_CONFIG = {
  types: ['casa', 'departamento', 'terreno', 'comercial', 'inversion'] as const,
  statuses: ['activa', 'vendida', 'reservada'] as const,
  maxImages: 20,
  maxImageSize: 10 * 1024 * 1024, // 10MB
  minPrice: 100000, // MXN
  maxPrice: 100000000, // MXN
  defaultCurrency: 'MXN',
};

// ========== COURSE CONFIGURATION ==========
export const COURSE_CONFIG = {
  levels: ['basico', 'intermedio', 'avanzado'] as const,
  careerPaths: ['INFONAVIT', 'Inversiones', 'Inmobiliarias'] as const,
  maxVideoDuration: 4 * 60 * 60, // 4 hours
  maxAttachmentSize: 100 * 1024 * 1024, // 100MB
};

// ========== PAYMENT CONFIGURATION ==========
export const PAYMENT_CONFIG = {
  currency: 'MXN',
  stripeLocale: 'es',
  taxRate: 0.16, // 16% IVA
  minOrderAmount: 10000, // MXN
  maxOrderAmount: 1000000, // MXN
};

// ========== PAGINATION ==========
export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
  minPageSize: 5,
};

// ========== FEATURE FLAGS ==========
export const FEATURES = {
  academy: process.env.NEXT_PUBLIC_ENABLE_ACADEMY === 'true',
  payments: process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true',
  chatbot: process.env.NEXT_PUBLIC_ENABLE_CHATBOT === 'true',
  maps: process.env.NEXT_PUBLIC_ENABLE_MAPS === 'true',
  realtime: true, // Supabase realtime
  offlineMode: false, // Cache for offline access
};

// ========== ERROR MESSAGES ==========
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'No autorizado para acceder a este recurso',
  FORBIDDEN: 'No tienes permiso para realizar esta acción',
  NOT_FOUND: 'Recurso no encontrado',
  VALIDATION_ERROR: 'Los datos proporcionados no son válidos',
  NETWORK_ERROR: 'Error de conexión. Por favor, intenta de nuevo',
  SERVER_ERROR: 'Error en el servidor. Por favor, intenta más tarde',
  INVALID_EMAIL: 'El correo electrónico no es válido',
  INVALID_PASSWORD: 'La contraseña no cumple con los requisitos',
  WEAK_PASSWORD: 'La contraseña es muy débil',
  EMAIL_EXISTS: 'Este correo electrónico ya está registrado',
  INVALID_CREDENTIALS: 'Correo o contraseña incorrectos',
  SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo',
};

// ========== SUCCESS MESSAGES ==========
export const SUCCESS_MESSAGES = {
  LOGIN: 'Has iniciado sesión exitosamente',
  LOGOUT: 'Has cerrado sesión',
  REGISTER: 'Tu cuenta ha sido creada exitosamente',
  PASSWORD_RESET: 'Tu contraseña ha sido restablecida',
  PROFILE_UPDATED: 'Tu perfil ha sido actualizado',
  PROPERTY_CREATED: 'La propiedad ha sido creada',
  PROPERTY_UPDATED: 'La propiedad ha sido actualizada',
  PROPERTY_DELETED: 'La propiedad ha sido eliminada',
  LEAD_CREATED: 'El lead ha sido creado',
  PAYMENT_SUCCESS: 'Pago procesado exitosamente',
};

// ========== VALIDATION PATTERNS ==========
export const VALIDATION_PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^[0-9+\-\s()]{10,}$/,
  zipCode: /^[0-9]{5}$/,
  currency: /^\d+(\.\d{2})?$/,
  url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
};

// ========== TIMEOUTS & INTERVALS ==========
export const TIMEOUTS = {
  apiCall: 30000,
  realtimeSync: 5000,
  tokenRefresh: 60000,
  sessionCheck: 60000,
  debounce: 300,
  notification: 5000,
};

// ========== ROUTES ==========
export const ROUTES = {
  home: '/',
  about: '/about',
  academy: '/academy',
  properties: '/propiedades',
  services: {
    realEstate: '/services/real-estate',
    investments: '/services/investments',
  },
  dashboard: {
    home: '/dashboard',
    properties: '/dashboard/properties',
    leads: '/dashboard/leads',
    academy: '/dashboard/academy',
    asesores: '/dashboard/asesores',
    users: '/dashboard/usuarios',
    reports: '/dashboard/reports',
  },
  auth: {
    login: '/login',
    register: '/register',
    forgot: '/forgot-password',
    reset: '/reset-password',
  },
  legal: {
    privacy: '/privacy',
    terms: '/terms',
  },
} as const;

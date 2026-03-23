/* ============================================================================
   OHB Platform — Centralized localStorage Database
   ============================================================================
   This module provides a persistent, typed data store using localStorage.
   All data survives page reloads and browser sessions.
   ============================================================================ */

// ========== TYPE DEFINITIONS ==========

export interface UserProfile {
  email: string;
  passwordHash: string; // simple hash for localStorage auth
  role: 'admin' | 'asesor' | 'cliente';
  fullName: string;
  phone: string;
  createdAt: number;
  lastLogin: number;
  rememberMe?: boolean;
}

// Simple hash for localStorage (NOT production crypto — use bcrypt on a real server)
export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Make it a longer, harder-to-guess string
  const base = Math.abs(hash).toString(36);
  let salt = '';
  for (let i = 0; i < str.length; i++) {
    salt += str.charCodeAt(i).toString(16);
  }
  return base + '_' + salt.substring(0, 24);
}

export interface FileRecord {
  id: string;
  name: string;
  type: string; // MIME type
  size: number;
  folder: string; // folder path like '/reportes' or '/contratos'
  dataUrl: string; // base64 data URL
  uploadedBy: string;
  uploadedByName: string;
  createdAt: number;
}

export interface FolderRecord {
  id: string;
  name: string;
  parentPath: string;
  createdBy: string;
  createdAt: number;
}

export interface PropertyImage {
  id: string;
  dataUrl: string; // base64 data URL
  name: string;
}

export interface PropertyRecord {
  id: string;
  title: string;
  category: string;
  location: string;
  price: number;
  status: 'Disponible' | 'En Negociación' | 'Vendido' | 'Oculto' | 'En renta/Para venta' | 'Disponible para renta y venta';
  views: number;
  images: PropertyImage[];
  squareMeters: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  amenities: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

export interface LeadRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  rfc: string;
  interestType: 'compra' | 'venta' | 'renta' | 'inversion';
  interest: string;
  budgetMin: number;
  budgetMax: number;
  creditType: 'infonavit' | 'bancario' | 'contado' | 'cofinanciamiento' | 'otro';
  zoneOfInterest: string;
  bedroomsNeeded: number;
  squareMetersNeeded: number;
  civilStatus: string;
  dependents: number;
  monthlyIncome: number;
  prequalified: boolean;
  prequalifiedAmount: number;
  nextAction: string;
  nextActionDate: string;
  priority: 'alta' | 'media' | 'baja';
  notes: string;
  requiredDocuments: string[];
  advisor: string;
  firstContactDate: string;
  lastInteraction: string;
  progressPercent: number;
  source: string;
  score: number;
  status: 'nuevos' | 'contactados' | 'negociacion' | 'cerrados';
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ArticleRecord {
  id: string;
  title: string;
  category: string;
  readTime: string;
  description: string;
  content: string;
  imageUrl: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface InfographicRecord {
  id: string;
  title: string;
  description: string;
  imageDataUrl: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface CourseRecord {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'basico' | 'intermedio' | 'avanzado';
  topics: string[];
  imageUrl: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface AppointmentRecord {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  endTime: string; // HH:MM
  client: string;
  clientPhone: string;
  property: string;
  type: 'visita' | 'reunion' | 'firma' | 'seguimiento' | 'otro';
  advisor: string;
  notes: string;
  color: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface AboutContent {
  mission: string;
  vision: string;
  values: { title: string; description: string }[];
  team: { id: number; name: string; role: string; strength: string }[];
  updatedBy: string;
  updatedAt: number;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: number;
  userEmail: string;
  userName: string;
  action: string;
  details: string;
  module: string;
}

export interface QuickNote {
  id: string;
  text: string;
  color: string;
  createdBy: string;
  createdAt: number;
}

export interface WeeklyReport {
  id: string;
  weekStart: string;
  weekEnd: string;
  newLeads: number;
  contactedLeads: number;
  visitsCompleted: number;
  propertiesShown: number;
  closedDeals: number;
  activitiesByAdvisor: { advisor: string; activities: number }[];
  generatedAt: number;
  generatedBy: string;
}

// ========== DB KEYS ==========
const DB_KEYS = {
  USERS: 'ohb_db_users',
  PROPERTIES: 'ohb_db_properties',
  LEADS: 'ohb_db_leads',
  ARTICLES: 'ohb_db_articles',
  INFOGRAPHICS: 'ohb_db_infographics',
  COURSES: 'ohb_db_courses',
  APPOINTMENTS: 'ohb_db_appointments',
  ABOUT: 'ohb_db_about',
  ACTIVITY_LOG: 'ohb_db_activity_log',
  QUICK_NOTES: 'ohb_db_quick_notes',
  WEEKLY_REPORTS: 'ohb_db_weekly_reports',
  PROPERTY_VIEWS: 'ohb_db_property_views',
  USER_PREFERENCES: 'ohb_db_user_prefs',
  FILES: 'ohb_db_files',
  FOLDERS: 'ohb_db_folders',
};

// ========== GENERIC CRUD ==========
function getCollection<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setCollection<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('localStorage write failed:', e);
  }
}

function getSingle<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setSingle<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('localStorage write failed:', e);
  }
}

// ========== USERS ==========
export const UsersDB = {
  getAll: (): UserProfile[] => getCollection<UserProfile>(DB_KEYS.USERS),
  
  getByEmail: (email: string): UserProfile | undefined => {
    return getCollection<UserProfile>(DB_KEYS.USERS).find(u => u.email === email.toLowerCase());
  },

  /** Register a new user with password */
  register: (email: string, password: string, role: 'admin' | 'asesor' | 'cliente', fullName: string, phone: string): { success: boolean; error?: string } => {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = UsersDB.getByEmail(normalizedEmail);
    if (existing) {
      return { success: false, error: 'Este correo ya está registrado. Inicia sesión.' };
    }
    const user: UserProfile = {
      email: normalizedEmail,
      passwordHash: simpleHash(password),
      role,
      fullName,
      phone,
      createdAt: Date.now(),
      lastLogin: Date.now(),
    };
    const users = getCollection<UserProfile>(DB_KEYS.USERS);
    users.push(user);
    setCollection(DB_KEYS.USERS, users);
    return { success: true };
  },

  /** Authenticate by email + password. Returns user or error. */
  authenticate: (email: string, password: string): { success: boolean; user?: UserProfile; error?: string } => {
    const normalizedEmail = email.toLowerCase().trim();
    const user = UsersDB.getByEmail(normalizedEmail);
    if (!user) {
      return { success: false, error: 'No existe una cuenta con este correo. Regístrate primero.' };
    }
    // If user has no passwordHash yet (legacy), accept any password and set it
    if (!user.passwordHash) {
      user.passwordHash = simpleHash(password);
      UsersDB.upsert(user);
      return { success: true, user };
    }
    if (user.passwordHash !== simpleHash(password)) {
      return { success: false, error: 'Contraseña incorrecta.' };
    }
    // Update last login
    UsersDB.upsert({ ...user, lastLogin: Date.now() });
    return { success: true, user };
  },

  upsert: (user: UserProfile): void => {
    const users = getCollection<UserProfile>(DB_KEYS.USERS);
    const idx = users.findIndex(u => u.email === user.email.toLowerCase());
    const normalized = { ...user, email: user.email.toLowerCase() };
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...normalized };
    } else {
      users.push(normalized);
    }
    setCollection(DB_KEYS.USERS, users);
  },

  delete: (email: string): void => {
    const users = getCollection<UserProfile>(DB_KEYS.USERS).filter(u => u.email !== email.toLowerCase());
    setCollection(DB_KEYS.USERS, users);
  },

  /** Set rememberMe preference */
  setRememberMe: (email: string, remember: boolean): void => {
    const user = UsersDB.getByEmail(email);
    if (user) {
      UsersDB.upsert({ ...user, rememberMe: remember });
    }
    if (remember) {
      localStorage.setItem('ohb_remembered_email', email);
    } else {
      localStorage.removeItem('ohb_remembered_email');
    }
  },

  getRememberedEmail: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('ohb_remembered_email');
  },

  initDefaults: (): void => {
    const users = getCollection<UserProfile>(DB_KEYS.USERS);
    const admin = users.find(u => u.email === 'jyeskas1111@gmail.com');
    if (!admin) {
      // Create admin user (password will be set on first login)
      const adminUser: UserProfile = {
        email: 'jyeskas1111@gmail.com',
        passwordHash: '', // set on first login
        role: 'admin',
        fullName: 'Administrador OHB',
        phone: '656-000-0000',
        createdAt: Date.now(),
        lastLogin: Date.now(),
      };
      const updatedUsers = getCollection<UserProfile>(DB_KEYS.USERS);
      updatedUsers.push(adminUser);
      setCollection(DB_KEYS.USERS, updatedUsers);
    } else if (admin.role !== 'admin') {
      // ALWAYS ensure jyeskas1111@gmail.com is admin
      admin.role = 'admin';
      UsersDB.upsert(admin);
    }
  }
};

// ========== PROPERTIES ==========
export const PropertiesDB = {
  getAll: (): PropertyRecord[] => getCollection<PropertyRecord>(DB_KEYS.PROPERTIES),
  
  getById: (id: string): PropertyRecord | undefined => {
    return getCollection<PropertyRecord>(DB_KEYS.PROPERTIES).find(p => p.id === id);
  },

  upsert: (property: PropertyRecord): void => {
    const items = getCollection<PropertyRecord>(DB_KEYS.PROPERTIES);
    const idx = items.findIndex(p => p.id === property.id);
    if (idx >= 0) {
      items[idx] = { ...property, updatedAt: Date.now() };
    } else {
      items.push({ ...property, createdAt: Date.now(), updatedAt: Date.now() });
    }
    setCollection(DB_KEYS.PROPERTIES, items);
  },

  delete: (id: string): void => {
    setCollection(DB_KEYS.PROPERTIES, getCollection<PropertyRecord>(DB_KEYS.PROPERTIES).filter(p => p.id !== id));
  },

  incrementViews: (id: string): void => {
    const items = getCollection<PropertyRecord>(DB_KEYS.PROPERTIES);
    const idx = items.findIndex(p => p.id === id);
    if (idx >= 0) {
      items[idx].views = (items[idx].views || 0) + 1;
      setCollection(DB_KEYS.PROPERTIES, items);
    }
    // Also track in a separate key for real view counting
    const views = getSingle<Record<string, number>>(DB_KEYS.PROPERTY_VIEWS) || {};
    views[id] = (views[id] || 0) + 1;
    setSingle(DB_KEYS.PROPERTY_VIEWS, views);
  },

  getViews: (id: string): number => {
    const views = getSingle<Record<string, number>>(DB_KEYS.PROPERTY_VIEWS) || {};
    return views[id] || 0;
  },

  initDefaults: (): void => {
    const items = getCollection<PropertyRecord>(DB_KEYS.PROPERTIES);
    if (items.length === 0) {
      const defaults: PropertyRecord[] = [
        { id: 'PR-101', title: 'Villa Oceana - Lux', category: 'Casa', location: 'Costa del Sol', price: 2500000, status: 'Disponible', views: 420, images: [], squareMeters: 350, bedrooms: 4, bathrooms: 3, parking: 2, amenities: 'Alberca, Jardín, Terraza', description: 'Hermosa villa de lujo con vista al mar', createdAt: Date.now(), updatedAt: Date.now(), createdBy: 'sistema' },
        { id: 'PR-102', title: 'Penthouse Horizon', category: 'Departamento', location: 'Centro Financiero', price: 1200000, status: 'En Negociación', views: 850, images: [], squareMeters: 180, bedrooms: 3, bathrooms: 2, parking: 2, amenities: 'Gym, Roof Garden, Lobby', description: 'Penthouse con vista panorámica al centro financiero', createdAt: Date.now(), updatedAt: Date.now(), createdBy: 'sistema' },
        { id: 'PR-103', title: 'Mansion Serene', category: 'Casa', location: 'Valle Verde', price: 4800000, status: 'Vendido', views: 1200, images: [], squareMeters: 600, bedrooms: 6, bathrooms: 5, parking: 4, amenities: 'Salón de eventos, Alberca, Cancha', description: 'Mansión de ensueño en zona exclusiva', createdAt: Date.now(), updatedAt: Date.now(), createdBy: 'sistema' },
        { id: 'PR-104', title: 'Local Comercial Centro', category: 'Comercial', location: 'Av. Principal', price: 850000, status: 'En renta/Para venta', views: 315, images: [], squareMeters: 120, bedrooms: 0, bathrooms: 1, parking: 3, amenities: 'Estacionamiento propio, Bodega', description: 'Local comercial en avenida principal', createdAt: Date.now(), updatedAt: Date.now(), createdBy: 'sistema' },
        { id: 'PR-105', title: 'Terreno Industrial Norte', category: 'Comercial', location: 'Parque Industrial', price: 5000000, status: 'Oculto', views: 45, images: [], squareMeters: 2500, bedrooms: 0, bathrooms: 0, parking: 10, amenities: 'Acceso carretero, Servicios', description: 'Terreno industrial estratégicamente ubicado', createdAt: Date.now(), updatedAt: Date.now(), createdBy: 'sistema' },
        { id: 'PR-106', title: 'Casa Residencial Las Palmas', category: 'Casa', location: 'Zona Sur', price: 3400000, status: 'Disponible para renta y venta', views: 512, images: [], squareMeters: 280, bedrooms: 3, bathrooms: 2, parking: 2, amenities: 'Jardín, Cocina integral, Cuarto de servicio', description: 'Casa residencial en zona sur', createdAt: Date.now(), updatedAt: Date.now(), createdBy: 'sistema' },
      ];
      setCollection(DB_KEYS.PROPERTIES, defaults);
    }
  }
};

// ========== LEADS ==========
export const LeadsDB = {
  getAll: (): LeadRecord[] => getCollection<LeadRecord>(DB_KEYS.LEADS),
  
  getById: (id: string): LeadRecord | undefined => {
    return getCollection<LeadRecord>(DB_KEYS.LEADS).find(l => l.id === id);
  },

  upsert: (lead: LeadRecord): void => {
    const items = getCollection<LeadRecord>(DB_KEYS.LEADS);
    const idx = items.findIndex(l => l.id === lead.id);
    if (idx >= 0) {
      items[idx] = { ...lead, updatedAt: Date.now() };
    } else {
      items.push({ ...lead, createdAt: Date.now(), updatedAt: Date.now() });
    }
    setCollection(DB_KEYS.LEADS, items);
  },

  delete: (id: string): void => {
    setCollection(DB_KEYS.LEADS, getCollection<LeadRecord>(DB_KEYS.LEADS).filter(l => l.id !== id));
  },

  initDefaults: (): void => {
    const items = getCollection<LeadRecord>(DB_KEYS.LEADS);
    if (items.length === 0) {
      const defaults: LeadRecord[] = [
        { id: 'L001', name: 'Alfonso Reyes', phone: '656-111-2222', email: 'alfonso@mail.com', rfc: '', interestType: 'compra', interest: 'Inversión Comercial', budgetMin: 800000, budgetMax: 1500000, creditType: 'bancario', zoneOfInterest: 'Centro', bedroomsNeeded: 0, squareMetersNeeded: 200, civilStatus: 'Soltero', dependents: 0, monthlyIncome: 45000, prequalified: false, prequalifiedAmount: 0, nextAction: 'Llamar para agendar visita', nextActionDate: '2026-03-24', priority: 'alta', notes: 'Interesado en locales comerciales en zona centro', requiredDocuments: ['IFE', 'Comprobante de domicilio'], advisor: 'Carlos M.', firstContactDate: '2026-03-22', lastInteraction: '2026-03-22', progressPercent: 15, source: 'Bot IA', score: 90, status: 'nuevos', tags: ['inversor', 'comercial'], createdAt: Date.now(), updatedAt: Date.now() },
        { id: 'L002', name: 'Julio Salazar', phone: '656-333-4444', email: 'julio@mail.com', rfc: '', interestType: 'compra', interest: 'Casa Habitación (Crédito)', budgetMin: 500000, budgetMax: 900000, creditType: 'infonavit', zoneOfInterest: 'Sur', bedroomsNeeded: 3, squareMetersNeeded: 120, civilStatus: 'Casado', dependents: 2, monthlyIncome: 25000, prequalified: true, prequalifiedAmount: 750000, nextAction: 'Enviar opciones de casas', nextActionDate: '2026-03-25', priority: 'media', notes: 'Busca casa para familia, crédito Infonavit aprobado', requiredDocuments: ['IFE', 'Estados de cuenta'], advisor: 'Ana P.', firstContactDate: '2026-03-21', lastInteraction: '2026-03-22', progressPercent: 30, source: 'Plataforma', score: 75, status: 'nuevos', tags: ['familia', 'infonavit'], createdAt: Date.now(), updatedAt: Date.now() },
        { id: 'L003', name: 'Mariana Pineda', phone: '656-555-6666', email: 'mariana@mail.com', rfc: '', interestType: 'inversion', interest: 'Terreno Industrial', budgetMin: 3000000, budgetMax: 6000000, creditType: 'contado', zoneOfInterest: 'Norte', bedroomsNeeded: 0, squareMetersNeeded: 2000, civilStatus: 'Casada', dependents: 0, monthlyIncome: 80000, prequalified: false, prequalifiedAmount: 0, nextAction: 'Mostrar terreno industrial', nextActionDate: '2026-03-26', priority: 'alta', notes: 'Grupo inversor interesado en parque industrial', requiredDocuments: ['RFC', 'Acta constitutiva'], advisor: 'Luis G.', firstContactDate: '2026-03-20', lastInteraction: '2026-03-21', progressPercent: 45, source: 'TikTok', score: 85, status: 'contactados', tags: ['inversor', 'industrial'], createdAt: Date.now(), updatedAt: Date.now() },
        { id: 'L004', name: 'Ernesto Vallejo', phone: '656-777-8888', email: 'ernesto@mail.com', rfc: '', interestType: 'compra', interest: 'Departamento Premium', budgetMin: 1000000, budgetMax: 2000000, creditType: 'bancario', zoneOfInterest: 'Centro Financiero', bedroomsNeeded: 2, squareMetersNeeded: 150, civilStatus: 'Soltero', dependents: 0, monthlyIncome: 60000, prequalified: true, prequalifiedAmount: 1800000, nextAction: 'Segunda visita al Penthouse Horizon', nextActionDate: '2026-03-23', priority: 'alta', notes: 'Muy interesado en Penthouse Horizon, solicitar segunda visita', requiredDocuments: ['IFE'], advisor: 'Carlos M.', firstContactDate: '2026-03-19', lastInteraction: '2026-03-21', progressPercent: 60, source: 'Instagram', score: 95, status: 'contactados', tags: ['premium', 'departamento'], createdAt: Date.now(), updatedAt: Date.now() },
        { id: 'L005', name: 'Laura Montemayor', phone: '656-999-0000', email: 'laura@mail.com', rfc: 'MONL900101ABC', interestType: 'compra', interest: 'Mansion Serene', budgetMin: 4000000, budgetMax: 5500000, creditType: 'contado', zoneOfInterest: 'Valle Verde', bedroomsNeeded: 5, squareMetersNeeded: 500, civilStatus: 'Casada', dependents: 3, monthlyIncome: 120000, prequalified: false, prequalifiedAmount: 0, nextAction: 'Negociar precio final', nextActionDate: '2026-03-24', priority: 'alta', notes: 'En negociación final, revisar contrato', requiredDocuments: ['IFE', 'Comprobante de ingresos', 'RFC'], advisor: 'Ana P.', firstContactDate: '2026-03-15', lastInteraction: '2026-03-22', progressPercent: 85, source: 'Referido', score: 99, status: 'negociacion', tags: ['premium', 'mansion'], createdAt: Date.now(), updatedAt: Date.now() },
        { id: 'L006', name: 'Roberto Díaz', phone: '656-111-3333', email: 'roberto@mail.com', rfc: 'DIAR850601XYZ', interestType: 'compra', interest: 'Bodega Norte', budgetMin: 700000, budgetMax: 1000000, creditType: 'bancario', zoneOfInterest: 'Norte', bedroomsNeeded: 0, squareMetersNeeded: 300, civilStatus: 'Casado', dependents: 1, monthlyIncome: 35000, prequalified: true, prequalifiedAmount: 900000, nextAction: 'Cerrado — Firma notarial', nextActionDate: '2026-03-20', priority: 'alta', notes: 'Venta cerrada exitosamente', requiredDocuments: ['IFE', 'RFC', 'Avalúo'], advisor: 'Luis G.', firstContactDate: '2026-03-01', lastInteraction: '2026-03-20', progressPercent: 100, source: 'Facebook', score: 100, status: 'cerrados', tags: ['cerrado', 'bodega'], createdAt: Date.now(), updatedAt: Date.now() },
      ];
      setCollection(DB_KEYS.LEADS, defaults);
    }
  }
};

// ========== ARTICLES ==========
export const ArticlesDB = {
  getAll: (): ArticleRecord[] => getCollection<ArticleRecord>(DB_KEYS.ARTICLES),
  upsert: (item: ArticleRecord): void => {
    const items = getCollection<ArticleRecord>(DB_KEYS.ARTICLES);
    const idx = items.findIndex(a => a.id === item.id);
    if (idx >= 0) { items[idx] = { ...item, updatedAt: Date.now() }; } 
    else { items.push({ ...item, createdAt: Date.now(), updatedAt: Date.now() }); }
    setCollection(DB_KEYS.ARTICLES, items);
  },
  delete: (id: string): void => {
    setCollection(DB_KEYS.ARTICLES, getCollection<ArticleRecord>(DB_KEYS.ARTICLES).filter(a => a.id !== id));
  },
  initDefaults: (): void => {
    if (getCollection<ArticleRecord>(DB_KEYS.ARTICLES).length === 0) {
      const defaults: ArticleRecord[] = [
        { id: 'ART-001', title: 'Estrategias de Inversión Inmobiliaria 2026', category: 'Educación Inmobiliaria', readTime: '5 min', description: 'Descubre cómo diversificar tu portafolio y aprovechar las tasas actuales para maximizar tu retorno de inversión (ROI).', content: '', imageUrl: '', createdBy: 'sistema', createdAt: Date.now(), updatedAt: Date.now() },
        { id: 'ART-002', title: 'Guía Definitiva: Créditos Infonavit', category: 'Infonavit', readTime: '8 min', description: 'Conoce los nuevos esquemas de cofinanciamiento, cómo usar tu subcuenta de vivienda y precalificar con inteligencia artificial.', content: '', imageUrl: '', createdBy: 'sistema', createdAt: Date.now(), updatedAt: Date.now() },
        { id: 'ART-003', title: 'Libertad Financiera a través de Bienes Raíces', category: 'Educación Financiera', readTime: '6 min', description: 'Aprende los conceptos básicos de apalancamiento, flujo de caja positivo y cómo evaluar el Cap Rate de una propiedad.', content: '', imageUrl: '', createdBy: 'sistema', createdAt: Date.now(), updatedAt: Date.now() },
      ];
      setCollection(DB_KEYS.ARTICLES, defaults);
    }
  }
};

// ========== INFOGRAPHICS ==========
export const InfographicsDB = {
  getAll: (): InfographicRecord[] => getCollection<InfographicRecord>(DB_KEYS.INFOGRAPHICS),
  upsert: (item: InfographicRecord): void => {
    const items = getCollection<InfographicRecord>(DB_KEYS.INFOGRAPHICS);
    const idx = items.findIndex(i => i.id === item.id);
    if (idx >= 0) { items[idx] = { ...item, updatedAt: Date.now() }; }
    else { items.push({ ...item, createdAt: Date.now(), updatedAt: Date.now() }); }
    setCollection(DB_KEYS.INFOGRAPHICS, items);
  },
  delete: (id: string): void => {
    setCollection(DB_KEYS.INFOGRAPHICS, getCollection<InfographicRecord>(DB_KEYS.INFOGRAPHICS).filter(i => i.id !== id));
  },
  initDefaults: (): void => {
    if (getCollection<InfographicRecord>(DB_KEYS.INFOGRAPHICS).length === 0) {
      setCollection(DB_KEYS.INFOGRAPHICS, [
        { id: 'INF-001', title: 'Guía de Avalúos 2026', description: 'Aprende a valorar tu propiedad antes de vender.', imageDataUrl: '', createdBy: 'sistema', createdAt: Date.now(), updatedAt: Date.now() },
        { id: 'INF-002', title: 'Pasos de Compra-Venta', description: 'El recorrido legal y notarial completo.', imageDataUrl: '', createdBy: 'sistema', createdAt: Date.now(), updatedAt: Date.now() },
      ]);
    }
  }
};

// ========== COURSES ==========
export const CoursesDB = {
  getAll: (): CourseRecord[] => getCollection<CourseRecord>(DB_KEYS.COURSES),
  upsert: (item: CourseRecord): void => {
    const items = getCollection<CourseRecord>(DB_KEYS.COURSES);
    const idx = items.findIndex(c => c.id === item.id);
    if (idx >= 0) { items[idx] = { ...item, updatedAt: Date.now() }; }
    else { items.push({ ...item, createdAt: Date.now(), updatedAt: Date.now() }); }
    setCollection(DB_KEYS.COURSES, items);
  },
  delete: (id: string): void => {
    setCollection(DB_KEYS.COURSES, getCollection<CourseRecord>(DB_KEYS.COURSES).filter(c => c.id !== id));
  },
  initDefaults: (): void => {
    if (getCollection<CourseRecord>(DB_KEYS.COURSES).length === 0) {
      setCollection(DB_KEYS.COURSES, [
        { id: 'CRS-001', title: 'Fundamentos de Inversión Inmobiliaria', description: 'Aprende las bases de la inversión inmobiliaria desde cero.', instructor: 'Roberto Villarreal', duration: '4 horas', level: 'basico', topics: ['ROI', 'Cap Rate', 'Apalancamiento'], imageUrl: '', createdBy: 'sistema', createdAt: Date.now(), updatedAt: Date.now() },
        { id: 'CRS-002', title: 'Créditos Infonavit Avanzado', description: 'Domina los esquemas de cofinanciamiento y subcuenta de vivienda.', instructor: 'Ana Lucía Garza', duration: '6 horas', level: 'avanzado', topics: ['Cofinavit', 'Subcuenta', 'Precalificación'], imageUrl: '', createdBy: 'sistema', createdAt: Date.now(), updatedAt: Date.now() },
        { id: 'CRS-003', title: 'Técnicas de Cierre Inmobiliario', description: 'Estrategias probadas para cerrar tratos con eficacia.', instructor: 'Maximiliano Torres', duration: '3 horas', level: 'intermedio', topics: ['Negociación', 'Objeciones', 'Cierre'], imageUrl: '', createdBy: 'sistema', createdAt: Date.now(), updatedAt: Date.now() },
      ]);
    }
  }
};

// ========== APPOINTMENTS ==========
export const AppointmentsDB = {
  getAll: (): AppointmentRecord[] => getCollection<AppointmentRecord>(DB_KEYS.APPOINTMENTS),
  upsert: (item: AppointmentRecord): void => {
    const items = getCollection<AppointmentRecord>(DB_KEYS.APPOINTMENTS);
    const idx = items.findIndex(a => a.id === item.id);
    if (idx >= 0) { items[idx] = { ...item, updatedAt: Date.now() }; }
    else { items.push({ ...item, createdAt: Date.now(), updatedAt: Date.now() }); }
    setCollection(DB_KEYS.APPOINTMENTS, items);
  },
  delete: (id: string): void => {
    setCollection(DB_KEYS.APPOINTMENTS, getCollection<AppointmentRecord>(DB_KEYS.APPOINTMENTS).filter(a => a.id !== id));
  },
  getByDate: (date: string): AppointmentRecord[] => {
    return getCollection<AppointmentRecord>(DB_KEYS.APPOINTMENTS).filter(a => a.date === date);
  },
  getByAdvisor: (advisor: string): AppointmentRecord[] => {
    return getCollection<AppointmentRecord>(DB_KEYS.APPOINTMENTS).filter(a => a.advisor === advisor);
  },
  initDefaults: (): void => {
    if (getCollection<AppointmentRecord>(DB_KEYS.APPOINTMENTS).length === 0) {
      const today = new Date().toISOString().split('T')[0];
      setCollection(DB_KEYS.APPOINTMENTS, [
        { id: 'APT-001', title: 'Visita Villa Oceana', date: today, time: '10:00', endTime: '11:00', client: 'Ernesto Vallejo', clientPhone: '656-777-8888', property: 'Villa Oceana - Lux', type: 'visita', advisor: 'Carlos M.', notes: 'Primera visita, llevar folleto', color: '#4ade80', completed: false, createdAt: Date.now(), updatedAt: Date.now() },
        { id: 'APT-002', title: 'Reunión con Laura', date: today, time: '14:00', endTime: '15:00', client: 'Laura Montemayor', clientPhone: '656-999-0000', property: 'Mansion Serene', type: 'reunion', advisor: 'Ana P.', notes: 'Discutir oferta final', color: '#38bdf8', completed: false, createdAt: Date.now(), updatedAt: Date.now() },
      ]);
    }
  }
};

// ========== ABOUT CONTENT ==========
export const AboutDB = {
  get: (): AboutContent => {
    const data = getSingle<AboutContent>(DB_KEYS.ABOUT);
    if (data) return data;
    return {
      mission: 'Empoderar a inversionistas y familias a través de educación financiera, tecnología de IA y acceso a propiedades de alta rentabilidad, simplificando procesos complejos como créditos e hipotecas.',
      vision: 'Consolidarnos como la firma inmobiliaria y financiera más avanzada e inteligente del país, redefiniendo la experiencia de inversión con modelos predictivos y el portafolio premium más exclusivo.',
      values: [
        { title: 'Transparencia', description: 'Claridad total en cada transacción y comisión.' },
        { title: 'Innovación', description: 'Uso de IA y tecnología para resultados precisos.' },
        { title: 'Excelencia', description: 'Servicio premium para clientes exigentes.' },
        { title: 'Integridad', description: 'Protegemos tu patrimonio como si fuera nuestro.' },
      ],
      team: [
        { id: 1, name: "Roberto Villarreal", role: "CEO & Asesor Principal", strength: "Experto en Cap Rate y negociaciones B2B. +15 años de experiencia." },
        { id: 2, name: "Ana Lucía Garza", role: "Directora de Créditos Infonavit", strength: "Especialista en Cofinavit y estructuración de deuda." },
        { id: 3, name: "Maximiliano Torres", role: "Asesor Premium Comercial", strength: "Conocimiento profundo del desarrollo comercial en Cd. Juárez." },
        { id: 4, name: "Valeria Montes", role: "Asesora de Inversiones", strength: "Análisis de riesgo y rendimientos para portafolios diversificados." },
        { id: 5, name: "Jorge Ramírez", role: "Especialista en Compra-Venta", strength: "Cierres rápidos y estrategias de valuación de mercado." },
        { id: 6, name: "Sofía Medina", role: "Coordinadora de Arrendamientos", strength: "Gestión de inquilinos y optimización de rentas a largo plazo." },
      ],
      updatedBy: 'sistema',
      updatedAt: Date.now(),
    };
  },
  save: (content: AboutContent): void => {
    setSingle(DB_KEYS.ABOUT, { ...content, updatedAt: Date.now() });
  }
};

// ========== ACTIVITY LOG ==========
export const ActivityLogDB = {
  getAll: (): ActivityLogEntry[] => getCollection<ActivityLogEntry>(DB_KEYS.ACTIVITY_LOG),
  
  add: (entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>): void => {
    const items = getCollection<ActivityLogEntry>(DB_KEYS.ACTIVITY_LOG);
    items.unshift({
      ...entry,
      id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
    });
    // Keep only last 500 entries
    setCollection(DB_KEYS.ACTIVITY_LOG, items.slice(0, 500));
  },

  getRecent: (count: number = 20): ActivityLogEntry[] => {
    return getCollection<ActivityLogEntry>(DB_KEYS.ACTIVITY_LOG).slice(0, count);
  },

  getByUser: (email: string): ActivityLogEntry[] => {
    return getCollection<ActivityLogEntry>(DB_KEYS.ACTIVITY_LOG).filter(l => l.userEmail === email);
  },

  getByModule: (module: string): ActivityLogEntry[] => {
    return getCollection<ActivityLogEntry>(DB_KEYS.ACTIVITY_LOG).filter(l => l.module === module);
  }
};

// ========== QUICK NOTES ==========
export const QuickNotesDB = {
  getAll: (): QuickNote[] => getCollection<QuickNote>(DB_KEYS.QUICK_NOTES),
  
  add: (note: Omit<QuickNote, 'id' | 'createdAt'>): void => {
    const items = getCollection<QuickNote>(DB_KEYS.QUICK_NOTES);
    items.push({
      ...note,
      id: `NOTE-${Date.now()}`,
      createdAt: Date.now(),
    });
    setCollection(DB_KEYS.QUICK_NOTES, items);
  },
  
  delete: (id: string): void => {
    setCollection(DB_KEYS.QUICK_NOTES, getCollection<QuickNote>(DB_KEYS.QUICK_NOTES).filter(n => n.id !== id));
  },

  update: (id: string, text: string): void => {
    const items = getCollection<QuickNote>(DB_KEYS.QUICK_NOTES);
    const idx = items.findIndex(n => n.id === id);
    if (idx >= 0) { items[idx].text = text; }
    setCollection(DB_KEYS.QUICK_NOTES, items);
  }
};

// ========== WEEKLY REPORTS ==========
export const WeeklyReportsDB = {
  getAll: (): WeeklyReport[] => getCollection<WeeklyReport>(DB_KEYS.WEEKLY_REPORTS),
  
  generate: (generatedBy: string): WeeklyReport => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const leads = LeadsDB.getAll();
    const appointments = AppointmentsDB.getAll();
    const weekStartTime = startOfWeek.getTime();
    
    const newLeads = leads.filter(l => l.createdAt >= weekStartTime).length;
    const contactedLeads = leads.filter(l => l.status === 'contactados' && l.updatedAt >= weekStartTime).length;
    const closedDeals = leads.filter(l => l.status === 'cerrados' && l.updatedAt >= weekStartTime).length;
    const weekAppointments = appointments.filter(a => a.date >= startOfWeek.toISOString().split('T')[0] && a.date <= endOfWeek.toISOString().split('T')[0]);
    const visitsCompleted = weekAppointments.filter(a => a.type === 'visita' && a.completed).length;

    // Activities by advisor
    const advisors = [...new Set(leads.map(l => l.advisor))];
    const activitiesByAdvisor = advisors.map(advisor => ({
      advisor,
      activities: leads.filter(l => l.advisor === advisor && l.updatedAt >= weekStartTime).length +
                  weekAppointments.filter(a => a.advisor === advisor).length
    }));

    const report: WeeklyReport = {
      id: `WR-${Date.now()}`,
      weekStart: startOfWeek.toISOString().split('T')[0],
      weekEnd: endOfWeek.toISOString().split('T')[0],
      newLeads,
      contactedLeads,
      visitsCompleted,
      propertiesShown: weekAppointments.filter(a => a.type === 'visita').length,
      closedDeals,
      activitiesByAdvisor,
      generatedAt: Date.now(),
      generatedBy,
    };

    // Save
    const reports = getCollection<WeeklyReport>(DB_KEYS.WEEKLY_REPORTS);
    reports.unshift(report);
    setCollection(DB_KEYS.WEEKLY_REPORTS, reports.slice(0, 52)); // Keep one year
    return report;
  }
};

// ========== USER PREFERENCES ==========
export const UserPrefsDB = {
  get: (email: string): Record<string, unknown> => {
    const all = getSingle<Record<string, Record<string, unknown>>>(DB_KEYS.USER_PREFERENCES) || {};
    return all[email] || {};
  },
  set: (email: string, prefs: Record<string, unknown>): void => {
    const all = getSingle<Record<string, Record<string, unknown>>>(DB_KEYS.USER_PREFERENCES) || {};
    all[email] = { ...all[email], ...prefs };
    setSingle(DB_KEYS.USER_PREFERENCES, all);
  }
};

// ========== FILES & FOLDERS ==========
export const FilesDB = {
  getAll: (): FileRecord[] => getCollection<FileRecord>(DB_KEYS.FILES),
  getByFolder: (folder: string): FileRecord[] => {
    return getCollection<FileRecord>(DB_KEYS.FILES).filter(f => f.folder === folder);
  },
  add: (file: FileRecord): void => {
    const items = getCollection<FileRecord>(DB_KEYS.FILES);
    items.push(file);
    setCollection(DB_KEYS.FILES, items);
  },
  delete: (id: string): void => {
    setCollection(DB_KEYS.FILES, getCollection<FileRecord>(DB_KEYS.FILES).filter(f => f.id !== id));
  },
  deleteByFolder: (folder: string): void => {
    setCollection(DB_KEYS.FILES, getCollection<FileRecord>(DB_KEYS.FILES).filter(f => !f.folder.startsWith(folder)));
  }
};

export const FoldersDB = {
  getAll: (): FolderRecord[] => getCollection<FolderRecord>(DB_KEYS.FOLDERS),
  getByParent: (parentPath: string): FolderRecord[] => {
    return getCollection<FolderRecord>(DB_KEYS.FOLDERS).filter(f => f.parentPath === parentPath);
  },
  add: (folder: FolderRecord): void => {
    const items = getCollection<FolderRecord>(DB_KEYS.FOLDERS);
    // Prevent duplicate folders at same level
    if (items.find(f => f.name === folder.name && f.parentPath === folder.parentPath)) return;
    items.push(folder);
    setCollection(DB_KEYS.FOLDERS, items);
  },
  delete: (id: string): void => {
    const folders = getCollection<FolderRecord>(DB_KEYS.FOLDERS);
    const folder = folders.find(f => f.id === id);
    if (!folder) return;
    const fullPath = folder.parentPath === '/' ? `/${folder.name}` : `${folder.parentPath}/${folder.name}`;
    // Delete folder and all sub-folders/files
    setCollection(DB_KEYS.FOLDERS, folders.filter(f => f.id !== id && !f.parentPath.startsWith(fullPath)));
    FilesDB.deleteByFolder(fullPath);
  },
  initDefaults: (): void => {
    if (getCollection<FolderRecord>(DB_KEYS.FOLDERS).length === 0) {
      const defaults: FolderRecord[] = [
        { id: 'FLD-001', name: 'Contratos', parentPath: '/', createdBy: 'sistema', createdAt: Date.now() },
        { id: 'FLD-002', name: 'Reportes', parentPath: '/', createdBy: 'sistema', createdAt: Date.now() },
        { id: 'FLD-003', name: 'Capacitación', parentPath: '/', createdBy: 'sistema', createdAt: Date.now() },
        { id: 'FLD-004', name: 'Documentos Legales', parentPath: '/', createdBy: 'sistema', createdAt: Date.now() },
      ];
      setCollection(DB_KEYS.FOLDERS, defaults);
    }
  }
};

// ========== INITIALIZE ALL DEFAULTS ==========
export function initializeDatabase(): void {
  if (typeof window === 'undefined') return;
  UsersDB.initDefaults();
  PropertiesDB.initDefaults();
  LeadsDB.initDefaults();
  ArticlesDB.initDefaults();
  InfographicsDB.initDefaults();
  CoursesDB.initDefaults();
  AppointmentsDB.initDefaults();
  FoldersDB.initDefaults();
}

// ========== CSV EXPORT UTILITY ==========
export function exportToCSV<T extends Record<string, unknown>>(data: T[], filename: string): void {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(h => {
      const val = row[h];
      if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return String(val ?? '');
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

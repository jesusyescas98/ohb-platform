// ========== PROPERTY TYPES ==========

export interface Property {
  id: string;
  title: string;
  type: 'casa' | 'departamento' | 'terreno' | 'comercial' | 'inversion';
  price: number;
  currency: 'MXN';
  location: string;
  colonia: string;
  address: string;
  sqMeters: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  description: string;
  shortDescription: string;
  images: string[];
  amenities: string[];
  status: 'activa' | 'vendida' | 'reservada';
  featured: boolean;
  yearBuilt?: number;
  floors?: number;
  lat?: number;
  lng?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  propertyId?: string;
  propertyTitle?: string;
  source: 'formulario' | 'whatsapp' | 'calculadora' | 'chatbot' | 'newsletter';
  status: 'nuevo' | 'contactado' | 'calificado' | 'cerrado' | 'perdido';
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar?: string;
}

export type PropertyType = Property['type'];
export type PropertyStatus = Property['status'];
export type LeadStatus = Lead['status'];

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  casa: 'Casa',
  departamento: 'Departamento',
  terreno: 'Terreno',
  comercial: 'Comercial',
  inversion: 'Inversión',
};

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  activa: 'Activa',
  vendida: 'Vendida',
  reservada: 'Reservada',
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  calificado: 'Calificado',
  cerrado: 'Cerrado',
  perdido: 'Perdido',
};

export const COLONIAS_JUAREZ = [
  'Campestre',
  'Campos Elíseos',
  'Las Misiones',
  'Nogales',
  'Partido Romero',
  'Sierra Vista',
  'Bosques del Valle',
  'Rincones de San Marcos',
  'Lomas de Poleo',
  'Valle del Sol',
  'Quintas del Valle',
  'Jardines del Valle',
  'Centro',
  'Pronaf',
  'Gómez Morín',
];

// ========== ACADEMY TYPES ==========

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'admin' | 'asesor' | 'cliente';
  enrollments: string[]; // courseIds suscritos
  createdAt: number;
}

export interface CareerPath {
  id: string;
  name: 'INFONAVIT' | 'Inversiones' | 'Inmobiliarias';
  description: string;
  courses: string[]; // courseIds en orden
  icon: string; // emoji
  color: string; // hex para badges
}

export interface CourseEnrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: number;
  completedAt?: number;
  status: 'active' | 'completed' | 'abandoned';
  progress: number; // 0-100
}

export interface CourseProgress {
  id: string;
  enrollmentId: string;
  lessonIndex: number;
  completedLessons: string[]; // lesson IDs
  timeSpent: number; // segundos
  lastAccessedAt: number;
}

export interface Order {
  id: string;
  userId: string;
  courseIds: string[];
  totalPrice: number;
  currency: 'MXN';
  status: 'pending' | 'paid' | 'refunded';
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  invoiceNumber: string; // folio único
  createdAt: number;
  paidAt?: number;
  invoicePdfUrl?: string;
}

export interface Certificate {
  id: string;
  enrollmentId: string;
  courseId: string;
  userId: string;
  careerPath: string;
  issuedAt: number;
  certificateUrl: string; // PDF URL
  certificateCode: string; // código único de verificación
}

export interface CourseLesson {
  id: string;
  title: string;
  duration: number; // minutos
  videoUrl?: string;
  contentMarkdown?: string;
  attachments?: string[]; // URLs de descargables
}

export interface CourseRecord {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  instructor: string;
  duration: number; // minutos totales
  level?: 'basico' | 'intermedio' | 'avanzado';
  careerPath?: 'INFONAVIT' | 'Inversiones' | 'Inmobiliarias';
  price?: number; // MXN
  topics: string[];
  imageUrl: string;
  attachments?: string[] | Array<{name: string; url: string}>;
  lessons?: CourseLesson[];
  prerequisites?: string[]; // courseIds requeridos
  learningOutcomes?: string[];
  metadata?: Record<string, any>;
  createdBy?: string;
  createdAt: number;
  updatedAt: number;
}

export const CAREER_PATHS: Record<string, CareerPath> = {
  infonavit: {
    id: 'infonavit',
    name: 'INFONAVIT',
    description: 'Domina el financiamiento inmobiliario INFONAVIT',
    courses: [],
    icon: '🏠',
    color: '#1B3A6B',
  },
  inversiones: {
    id: 'inversiones',
    name: 'Inversiones',
    description: 'Estrategias de inversión inmobiliaria y financiera',
    courses: [],
    icon: '📈',
    color: '#2D5AA0',
  },
  inmobiliarias: {
    id: 'inmobiliarias',
    name: 'Inmobiliarias',
    description: 'Profesionaliza tu carrera inmobiliaria',
    courses: [],
    icon: '🏢',
    color: '#0F2847',
  },
};

export type CourseLevel = 'basico' | 'intermedio' | 'avanzado';
export type CareerName = 'INFONAVIT' | 'Inversiones' | 'Inmobiliarias';
export type OrderStatus = Order['status'];
export type EnrollmentStatus = CourseEnrollment['status'];

// WhatsApp number for OHB
export const OHB_WHATSAPP = '526561327685';
export const OHB_WHATSAPP_DISPLAY = '656-132-7685';
export const OHB_DOMAIN = 'https://www.ohbasesoriasyconsultorias.com';
export const OHB_SITE_NAME = 'OHB Asesorías y Consultorías';

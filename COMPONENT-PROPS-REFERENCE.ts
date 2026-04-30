/**
 * OHB React Components - Props Interface Reference
 * Used by Agent E for type-safe component integration
 */

// ============================================================================
// COMPONENT PROP INTERFACES
// ============================================================================

// 1. HEADER
// No props - uses useAuth() context internally
// Type: FC (Functional Component)
// Location: src/components/Header.tsx
export interface HeaderProps {
  // No props required
}

// 2. FOOTER
// No props - renders newsletter form and links
// Type: FC
// Location: src/components/Footer.tsx
export interface FooterProps {
  // No props required
}

// 3. PROPERTY CARD
// Displays a single property in grid/list
// Type: FC
// Location: src/components/properties/PropertyCard.tsx
export interface PropertyCardProps {
  property: Property;
}

// 4. MORTGAGE CALCULATOR
// Interactive calculator for monthly mortgage payments
// Type: FC
// Location: src/components/MortgageCalculator.tsx
export interface MortgageCalculatorProps {
  // No props required
}

// 5. INVESTMENT CALCULATOR
// ROI simulator for investment products
// Type: FC
// Location: src/components/InvestmentCalculator.tsx
export interface InvestmentCalculatorProps {
  // No props required
}

// 6. CHATBOT AI (AVA)
// Conversational AI assistant
// Type: FC
// Location: src/components/ChatbotAI.tsx
export interface ChatbotAIProps {
  // No props required
}

// 7. COOKIE CONSENT
// GDPR cookie banner with preferences
// Type: FC
// Location: src/components/CookieConsent.tsx
export interface CookieConsentProps {
  // No props required
}

// 8. LOGIN MODAL
// Login/Register/Recovery modal dialog
// Type: FC
// Location: src/components/LoginModal.tsx
export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 9. COURSE PLAYER
// Video/content player for academy courses
// Type: FC
// Location: src/components/CoursePlayer.tsx
export interface CoursePlayerProps {
  course: Course;
  onProgress?: (percent: number) => void;
}

// ============================================================================
// SUPPORTING COMPONENTS
// ============================================================================

// LEAD CAPTURE MODAL (used by calculators)
export interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  description: string;
  source: 'calculadora' | 'formulario' | 'chatbot';
}

// PROPERTY MODAL (quick view)
export interface PropertyModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

// PROPERTY MAP
export interface PropertyMapProps {
  properties: Property[];
  selectedId?: string;
  onSelectProperty?: (id: string) => void;
  zoom?: number;
  center?: { lat: number; lng: number };
}

// PROPERTY SWIPE CARD (mobile)
export interface PropertySwipeCardProps {
  properties: Property[];
  onPropertyLike?: (id: string) => void;
  onPropertyDislike?: (id: string) => void;
}

// ROUTE GUARD (auth protection)
export interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'asesor' | 'cliente';
  fallback?: React.ReactNode;
}

// ============================================================================
// TYPE IMPORTS FROM LIB/TYPES.TS
// ============================================================================

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

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: 'admin' | 'asesor' | 'cliente';
  avatar?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  duration: number; // minutes
  level: 'principiante' | 'intermedio' | 'avanzado';
  price: number;
  sections: CourseSection[];
  createdAt: number;
  updatedAt: number;
}

export interface CourseSection {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number; // minutes
  order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar?: string;
}

// ============================================================================
// HOOK INTERFACES
// ============================================================================

// useAuth() hook return type
export interface UseAuthReturn {
  isLoggedIn: boolean;
  user: User | null;
  role: 'admin' | 'asesor' | 'cliente' | null;
  fullName: string;
  email: string;
  loginWithPassword: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  checkLoginAttempts: () => boolean;
  incrementLoginAttempts: () => void;
  isLoading: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

// ============================================================================
// PASSWORD STRENGTH VALIDATION
// ============================================================================

export interface PasswordStrength {
  score: number; // 0-5
  label: string; // "Muy débil" to "Muy fuerte"
  color: string; // Hex color code
  requirements: PasswordRequirement[];
}

export interface PasswordRequirement {
  met: boolean;
  text: string;
}

// ============================================================================
// COOKIE PREFERENCES
// ============================================================================

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  consentDate: string;
}

// ============================================================================
// CHATBOT MESSAGE INTERFACE
// ============================================================================

export interface ChatbotMessage {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
  quickReplies?: string[];
  feedback?: 'helpful' | 'unhelpful';
}

// ============================================================================
// COMPONENT STATE INTERFACES
// ============================================================================

// Login Modal state
export interface LoginModalState {
  mode: 'login' | 'register' | 'recovery';
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
  step: 'form' | 'success' | 'error' | 'locked';
  errorMessage: string;
  showPassword: boolean;
  acceptTerms: boolean;
  rememberMe: boolean;
  isLoading: boolean;
}

// Calculator state
export interface MortgageState {
  amount: number; // 50,000 - 2,000,000
  interest: number; // 1 - 15
  years: number; // 5 - 30
  showAmortization: boolean;
  leadCaptured: boolean;
  monthlyPayment: number;
}

export interface InvestmentState {
  amount: number; // 100,000 - 10,000,000
  months: number; // 3 - 60
  monthlyYield: number; // 0.1 - 3.0
  totalYield: number;
  totalReturn: number;
  leadCaptured: boolean;
  showResults: boolean;
}

// ============================================================================
// FORM DATA INTERFACES
// ============================================================================

// Lead form submission
export interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  message?: string;
  source: 'newsletter' | 'formulario' | 'whatsapp' | 'chatbot' | 'calculadora';
}

// Contact form submission
export interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

// ============================================================================
// CSS MODULE TYPES (for type-safe className usage)
// ============================================================================

// Header CSS Module classes
export interface HeaderStyles {
  header: string;
  logoContainer: string;
  brandLogo: string;
  logoText: string;
  mobileToggle: string;
  nav: string;
  navLink: string;
  dropdownContainer: string;
  userMenu: string;
  sessionInfo: string;
}

// PropertyCard CSS Module classes
export interface PropertyCardStyles {
  card: string;
  imageWrapper: string;
  image: string;
  badge: string;
  badgeCasa: string;
  badgeDepartamento: string;
  badgeTerreno: string;
  badgeComercial: string;
  badgeInversion: string;
  featuredRibbon: string;
  statusOverlay: string;
  statusLabel: string;
  content: string;
  price: string;
  title: string;
  location: string;
  locationIcon: string;
  specs: string;
  spec: string;
  specIcon: string;
  specValue: string;
  footer: string;
  viewBtn: string;
  whatsappBtn: string;
}

// ============================================================================
// UTILITY FUNCTION SIGNATURES
// ============================================================================

// Property data utilities
export interface PropertyDataUtils {
  formatPrice(price: number): string;
  getPropertyTypeIcon(type: string): string;
  getPropertyTypeLabel(type: string): string;
  getWhatsAppLink(property: Property, customText?: string): string;
  getColoniaLabel(colonia: string): string;
}

// Lead bridge utilities
export interface LeadBridgeUtils {
  savePublicLead(data: Partial<Lead>): void;
  saveLead(data: Lead): void;
  getLead(id: string): Lead | null;
  updateLead(id: string, data: Partial<Lead>): void;
}

// ============================================================================
// COMPONENT COMPOSITION PATTERNS
// ============================================================================

// Common wrapper pattern
export interface PageLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  showChatbot?: boolean;
  showCookieConsent?: boolean;
  isDashboard?: boolean;
}

// Grid container pattern
export interface GridContainerProps {
  children: React.ReactNode;
  columns?: number;
  gap?: string;
  maxWidth?: string;
  className?: string;
}

// ============================================================================
// NEXT.JS INTEGRATION
// ============================================================================

// Page params for dynamic routes
export interface PropertyPageParams {
  params: {
    id: string;
  };
}

// Search params
export interface SearchParams {
  [key: string]: string | string[] | undefined;
}

// ============================================================================
// EXPORT SUMMARY
// ============================================================================

/**
 * USAGE EXAMPLE IN AGENT E PAGES:
 *
 * import Header from '@/components/Header';
 * import Footer from '@/components/Footer';
 * import PropertyCard from '@/components/properties/PropertyCard';
 * import { Property } from '@/lib/types';
 * import type { PropertyCardProps } from '@/COMPONENT-PROPS-REFERENCE';
 *
 * export default function PropertiesPage() {
 *   const properties: Property[] = [...];
 *
 *   return (
 *     <>
 *       <Header />
 *       <main>
 *         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
 *           {properties.map(prop => (
 *             <PropertyCard key={prop.id} property={prop} />
 *           ))}
 *         </div>
 *       </main>
 *       <Footer />
 *     </>
 *   );
 * }
 */

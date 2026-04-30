/**
 * Utility functions for OHB Platform
 * Reusable helpers for formatting, validation, and common operations
 */

// ========== FORMATTING UTILITIES ==========

/**
 * Format currency values to Mexican Peso format
 */
export function formatCurrency(
  amount: number,
  includeSymbol: boolean = true
): string {
  const formatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const formatted = formatter.format(amount);
  return includeSymbol ? formatted : formatted.replace('$', '').trim();
}

/**
 * Format phone number to Mexican format
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})$/);

  if (!match) return phone;

  let formatted = '';
  if (match[1]) formatted += match[1];
  if (match[2]) formatted += `-${match[2]}`;
  if (match[3]) formatted += `-${match[3]}`;
  if (match[4]) formatted += `-${match[4]}`;

  return formatted;
}

/**
 * Format date to Spanish format
 */
export function formatDate(
  date: Date | number | string,
  locale: string = 'es-MX'
): string {
  const dateObj = typeof date === 'number' ? new Date(date) : new Date(date);
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date and time to Spanish format
 */
export function formatDateTime(
  date: Date | number | string,
  locale: string = 'es-MX'
): string {
  const dateObj = typeof date === 'number' ? new Date(date) : new Date(date);
  return dateObj.toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format address from components
 */
export function formatAddress(
  street: string,
  colony: string,
  city: string,
  state: string
): string {
  return `${street}, ${colony}, ${city}, ${state}`;
}

// ========== VALIDATION UTILITIES ==========

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const pattern =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return pattern.test(email);
}

/**
 * Validate Mexican phone number
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  // Mexican phone numbers: 10 digits for landline, 10 digits (starting with 1) or 13 digits for mobile
  return cleaned.length === 10 || cleaned.length === 13;
}

/**
 * Validate Mexican postal code
 */
export function isValidZipCode(zipCode: string): boolean {
  const pattern = /^[0-9]{5}$/;
  return pattern.test(zipCode);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if password meets security requirements
 */
export function isStrongPassword(password: string): {
  isStrong: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else feedback.push('Mínimo 8 caracteres');

  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Al menos una mayúscula');

  if (/[a-z]/.test(password)) score++;
  else feedback.push('Al menos una minúscula');

  if (/[0-9]/.test(password)) score++;
  else feedback.push('Al menos un número');

  if (/[!@#$%^&*(),.?"':{}|<>]/.test(password)) score++;
  else feedback.push('Al menos un carácter especial');

  return {
    isStrong: score >= 4,
    score,
    feedback: feedback.length === 0 ? ['Contraseña fuerte'] : feedback,
  };
}

// ========== STORAGE UTILITIES ==========

/**
 * Get item from localStorage with fallback
 */
export function getLocalStorage<T>(key: string, defaultValue?: T): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : (defaultValue ?? null);
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue ?? null;
  }
}

/**
 * Set item in localStorage
 */
export function setLocalStorage<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Remove item from localStorage
 */
export function removeLocalStorage(key: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
    return false;
  }
}

// ========== ARRAY UTILITIES ==========

/**
 * Group array items by a key
 */
export function groupBy<T>(
  array: T[],
  key: keyof T
): Record<string | number, T[]> {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key]);
      if (!result[groupKey]) result[groupKey] = [];
      result[groupKey].push(item);
      return result;
    },
    {} as Record<string | number, T[]>
  );
}

/**
 * Unique items in array
 */
export function unique<T>(
  array: T[],
  by?: (item: T) => string | number
): T[] {
  if (!by) {
    return [...new Set(array)];
  }
  const seen = new Set<string | number>();
  return array.filter((item) => {
    const key = by(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Sort array of objects
 */
export function sortBy<T>(
  array: T[],
  key: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

// ========== STRING UTILITIES ==========

/**
 * Truncate string to max length with ellipsis
 */
export function truncate(
  text: string,
  maxLength: number,
  ellipsis: string = '...'
): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Convert to slug
 */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate random string
 */
export function generateId(length: number = 12): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ========== OBJECT UTILITIES ==========

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Merge objects (shallow)
 */
export function merge<T extends object>(base: T, ...overrides: Partial<T>[]): T {
  return Object.assign({}, base, ...overrides);
}

// ========== CLASS NAME UTILITIES ==========

/**
 * Conditionally join classNames
 */
export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ========== NUMERIC UTILITIES ==========

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Calculate tax
 */
export function calculateTax(amount: number, taxRate: number = 0.16): number {
  return Math.round(amount * taxRate);
}

/**
 * Calculate total with tax
 */
export function calculateWithTax(
  amount: number,
  taxRate: number = 0.16
): number {
  return amount + calculateTax(amount, taxRate);
}

// ========== ASYNC UTILITIES ==========

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return function debounced(...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function throttled(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Sleep/delay async function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

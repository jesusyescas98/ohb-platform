/**
 * Property Adapter — Bridge between PropertiesDB (dashboard) and Property (public portal)
 */

import { PropertiesDB, CoursesDB, type PropertyRecord } from './database';
import { DEMO_PROPERTIES } from './propertyData';
import type { Property, CourseRecord, CareerPath } from './types';
import { CAREER_PATHS } from './types';

const CATEGORY_MAP: Record<string, Property['type']> = {
  'casa': 'casa',
  'departamento': 'departamento',
  'terreno': 'terreno',
  'comercial': 'comercial',
  'inversion': 'inversion',
  'inversión': 'inversion',
  'local': 'comercial',
  'nave': 'comercial',
  'oficina': 'comercial',
};

const STATUS_MAP: Record<string, Property['status']> = {
  'Disponible': 'activa',
  'Disponible para renta y venta': 'activa',
  'En renta/Para venta': 'activa',
  'En Negociación': 'reservada',
  'Vendido': 'vendida',
  'Oculto': 'vendida',
};

export function convertPropertyRecordToProperty(record: PropertyRecord): Property {
  const categoryKey = record.category?.toLowerCase().trim() || '';
  const type = CATEGORY_MAP[categoryKey] || 'casa';
  const status = STATUS_MAP[record.status] || 'activa';

  // Extract colonia from location if possible
  const locationParts = record.location?.split(',').map(s => s.trim()) || [];
  const colonia = locationParts[0] || record.location || 'Ciudad Juárez';

  // Convert images
  const images = record.images?.length
    ? record.images.map(img => img.dataUrl)
    : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'];

  // Parse amenities
  const amenities = record.amenities
    ? record.amenities.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const shortDescription = record.description
    ? record.description.substring(0, 120) + (record.description.length > 120 ? '...' : '')
    : '';

  return {
    id: record.id,
    title: record.title || 'Propiedad sin título',
    type,
    price: record.price || 0,
    currency: 'MXN',
    location: record.location || 'Ciudad Juárez, Chihuahua',
    colonia,
    address: record.location || '',
    sqMeters: record.squareMeters || 0,
    bedrooms: record.bedrooms || 0,
    bathrooms: record.bathrooms || 0,
    parking: record.parking || 0,
    description: record.description || '',
    shortDescription,
    images,
    amenities,
    status,
    featured: false,
    createdAt: record.createdAt || Date.now(),
    updatedAt: record.updatedAt || Date.now(),
  };
}

/**
 * Gets all public properties: merges DB properties with demo properties.
 * DB properties take precedence over demo properties with the same ID.
 */
export function getAllPublicProperties(): Property[] {
  // Get DB properties
  let dbProperties: Property[] = [];
  try {
    const records = PropertiesDB.getAll();
    dbProperties = records
      .map(convertPropertyRecordToProperty)
      .filter(p => p.status === 'activa');
  } catch {
    // DB not available (SSR or error)
  }

  // Merge: DB properties override demos by ID
  const dbIds = new Set(dbProperties.map(p => p.id));
  const demoFallback = DEMO_PROPERTIES.filter(p => !dbIds.has(p.id) && p.status === 'activa');

  return [...dbProperties, ...demoFallback];
}

/**
 * Find a single property by ID from both sources
 */
export function getPublicPropertyById(id: string): Property | undefined {
  // Check DB first
  try {
    const record = PropertiesDB.getById(id);
    if (record) {
      return convertPropertyRecordToProperty(record);
    }
  } catch {
    // DB not available
  }

  // Fallback to demo
  return DEMO_PROPERTIES.find(p => p.id === id);
}

// ========== ACADEMY FUNCTIONS ==========

/**
 * Get all courses from the database
 */
export function getAllCourses(): CourseRecord[] {
  try {
    return CoursesDB.getAll();
  } catch {
    return [];
  }
}

/**
 * Get courses by career path
 */
export function getCoursesByCareer(careerName: string): CourseRecord[] {
  try {
    return CoursesDB.getAll().filter(c => c.careerPath === careerName);
  } catch {
    return [];
  }
}

/**
 * Get courses by level
 */
export function getCoursesByLevel(level: 'basico' | 'intermedio' | 'avanzado'): CourseRecord[] {
  try {
    return CoursesDB.getAll().filter(c => c.level === level);
  } catch {
    return [];
  }
}

/**
 * Get a single course by ID
 */
export function getCourseById(id: string): CourseRecord | undefined {
  try {
    return CoursesDB.getAll().find(c => c.id === id);
  } catch {
    return undefined;
  }
}

/**
 * Get all career paths
 */
export function getCareerPaths(): CareerPath[] {
  return Object.values(CAREER_PATHS);
}

/**
 * Get a single career path by ID
 */
export function getCareerPathById(id: string): CareerPath | undefined {
  return CAREER_PATHS[id as keyof typeof CAREER_PATHS];
}

/**
 * Get courses for a specific career path
 */
export function getCoursesForCareerPath(careerName: string): CourseRecord[] {
  try {
    const courses = CoursesDB.getAll().filter(c => c.careerPath === careerName);
    // Sort by level: basico, intermedio, avanzado
    const levelOrder: Record<string, number> = { basico: 0, intermedio: 1, avanzado: 2 };
    return courses.sort((a, b) => (levelOrder[a.level || 'basico'] || 0) - (levelOrder[b.level || 'basico'] || 0));
  } catch {
    return [];
  }
}

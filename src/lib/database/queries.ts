/**
 * Database Query Helpers
 * Type-safe SQL helper functions for common CRUD operations
 * Used by API routes and server-side components
 *
 * All functions take a Supabase client parameter for isolation and testability.
 * For RLS enforcement, use the anon client. For admin operations, use service role client.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import {
  Property,
  Lead,
  User,
  CourseRecord,
  CourseEnrollment,
  Order,
  Transaction,
  Certificate,
} from '../types';

// ========== TYPE ALIASES ==========
type QueryResult<T> = Promise<{ data: T | null; error: any }>;
type QueryListResult<T> = Promise<{ data: T[] | null; error: any }>;

// ========== PROPERTIES QUERIES ==========

/**
 * Get property by ID
 * Public access for active properties
 */
export async function getPropertyById(
  client: SupabaseClient,
  propertyId: string
): QueryResult<Property> {
  try {
    const { data, error } = await client
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    return { data: data as Property | null, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Get all active properties with pagination
 * Public access
 */
export async function getActiveProperties(
  client: SupabaseClient,
  page: number = 1,
  limit: number = 20,
  filters?: {
    type?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
  }
): QueryListResult<Property> {
  try {
    let query = client
      .from('properties')
      .select('*', { count: 'exact' })
      .eq('status', 'activa')
      .not('published_at', 'is', null)
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }
    if (filters?.minPrice) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters?.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }

    const offset = (page - 1) * limit;
    const { data, error } = await query.range(offset, offset + limit - 1);

    return { data: data as Property[] | null, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Get featured properties
 */
export async function getFeaturedProperties(
  client: SupabaseClient,
  limit: number = 6
): QueryListResult<Property> {
  try {
    const { data, error } = await client
      .from('properties')
      .select('*')
      .eq('featured', true)
      .eq('status', 'activa')
      .not('published_at', 'is', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data: data as Property[] | null, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Create new property (admin/asesor)
 */
export async function createProperty(
  client: SupabaseClient,
  property: Omit<Property, 'createdAt' | 'updatedAt'>
): QueryResult<Property> {
  try {
    const { data, error } = await client
      .from('properties')
      .insert([
        {
          ...property,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    return { data: data as Property | null, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Update property (admin/asesor)
 */
export async function updateProperty(
  client: SupabaseClient,
  propertyId: string,
  updates: Partial<Property>
): QueryResult<Property> {
  try {
    const { data, error } = await client
      .from('properties')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', propertyId)
      .select()
      .single();

    return { data: data as Property | null, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Update property status
 */
export async function updatePropertyStatus(
  client: SupabaseClient,
  propertyId: string,
  status: 'activa' | 'vendida' | 'reservada'
): Promise<boolean> {
  try {
    const { error } = await client
      .from('properties')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', propertyId);

    return !error;
  } catch (err) {
    return false;
  }
}

/**
 * Delete property (admin)
 */
export async function deleteProperty(
  client: SupabaseClient,
  propertyId: string
): Promise<boolean> {
  try {
    const { error } = await client
      .from('properties')
      .delete()
      .eq('id', propertyId);

    return !error;
  } catch (err) {
    return false;
  }
}

// ========== LEADS QUERIES ==========

/**
 * Get leads by user (their own leads)
 */
export async function getLeadsByUser(
  client: SupabaseClient,
  userId: string
): QueryListResult<Lead> {
  try {
    const { data, error } = await client
      .from('leads')
      .select('*')
      .eq('assigned_to', userId)
      .order('created_at', { ascending: false });

    return { data: data as Lead[] | null, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Get lead by ID
 */
export async function getLeadById(
  client: SupabaseClient,
  leadId: string
): QueryResult<Lead> {
  try {
    const { data, error } = await client
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    return { data: data as Lead | null, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Create new lead
 */
export async function createLead(
  client: SupabaseClient,
  lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>
): QueryResult<Lead> {
  try {
    const { data, error } = await client
      .from('leads')
      .insert([
        {
          ...lead,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    return { data: data as Lead | null, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Update lead
 */
export async function updateLead(
  client: SupabaseClient,
  leadId: string,
  updates: Partial<Lead>
): QueryResult<Lead> {
  try {
    const { data, error } = await client
      .from('leads')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId)
      .select()
      .single();

    return { data: data as Lead | null, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Update lead status
 */
export async function updateLeadStatus(
  client: SupabaseClient,
  leadId: string,
  status: 'nuevo' | 'contactado' | 'calificado' | 'cerrado' | 'perdido'
): Promise<boolean> {
  try {
    const { error } = await client
      .from('leads')
      .update({
        status,
        updated_at: new Date().toISOString(),
        last_contact_at: new Date().toISOString(),
      })
      .eq('id', leadId);

    return !error;
  } catch (err) {
    return false;
  }
}

/**
 * Delete lead
 */
export async function deleteLead(
  client: SupabaseClient,
  leadId: string
): Promise<boolean> {
  try {
    const { error } = await client
      .from('leads')
      .delete()
      .eq('id', leadId);

    return !error;
  } catch (err) {
    return false;
  }
}

// ========== COURSES QUERIES ==========

/**
 * Get published courses
 */
export async function getPublishedCourses(
  client: SupabaseClient
): QueryListResult<CourseRecord> {
  try {
    const { data, error } = await client
      .from('courses')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    return { data: data as CourseRecord[] | null, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Get course by ID
 */
export async function getCourseById(
  client: SupabaseClient,
  courseId: string
): QueryResult<CourseRecord> {
  try {
    const { data, error } = await client
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    return { data: data as CourseRecord | null, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Get courses by career path
 */
export async function getCoursesByCareerPath(
  client: SupabaseClient,
  careerPath: 'INFONAVIT' | 'Inversiones' | 'Inmobiliarias'
): QueryListResult<CourseRecord> {
  try {
    const { data, error } = await client
      .from('courses')
      .select('*')
      .eq('career_path', careerPath)
      .eq('published', true)
      .order('created_at', { ascending: false });

    return { data: data as CourseRecord[] | null, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

// ========== COURSE ENROLLMENTS QUERIES ==========

/**
 * Get user enrollments
 */
export async function getUserEnrollments(
  client: SupabaseClient,
  userId: string
): QueryListResult<CourseEnrollment> {
  try {
    const { data, error } = await client
      .from('course_enrollments')
      .select('*')
      .eq('user_id', userId)
      .order('enrolled_at', { ascending: false });

    return { data: data as CourseEnrollment[] | null, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Check if user is enrolled in course
 */
export async function isUserEnrolled(
  client: SupabaseClient,
  userId: string,
  courseId: string
): Promise<boolean> {
  try {
    const { data, error } = await client
      .from('course_enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    return !error && !!data;
  } catch (err) {
    return false;
  }
}

/**
 * Create course enrollment
 */
export async function createEnrollment(
  client: SupabaseClient,
  userId: string,
  courseId: string
): QueryResult<CourseEnrollment> {
  try {
    const { data, error } = await client
      .from('course_enrollments')
      .insert([
        {
          user_id: userId,
          course_id: courseId,
          status: 'active',
          progress_percent: 0,
          enrolled_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    return { data: data as CourseEnrollment | null, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

// ========== ORDERS QUERIES ==========

/**
 * Get user orders
 */
export async function getUserOrders(
  client: SupabaseClient,
  userId: string
): QueryListResult<Order> {
  try {
    const { data, error } = await client
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data: data as Order[] | null, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(
  client: SupabaseClient,
  orderId: string
): QueryResult<Order> {
  try {
    const { data, error } = await client
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    return { data: data as Order | null, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Create order
 */
export async function createOrder(
  client: SupabaseClient,
  order: Omit<Order, 'id' | 'createdAt' | 'paidAt'>
): QueryResult<Order> {
  try {
    const { data, error } = await client
      .from('orders')
      .insert([
        {
          ...order,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    return { data: data as Order | null, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  client: SupabaseClient,
  orderId: string,
  status: 'pending' | 'paid' | 'refunded'
): Promise<boolean> {
  try {
    const updates: any = { status };
    if (status === 'paid') {
      updates.paid_at = new Date().toISOString();
    }

    const { error } = await client
      .from('orders')
      .update(updates)
      .eq('id', orderId);

    return !error;
  } catch (err) {
    return false;
  }
}

// ========== USERS QUERIES ==========

/**
 * Get user by email
 */
export async function getUserByEmail(
  client: SupabaseClient,
  email: string
): QueryResult<User> {
  try {
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    return { data: data as User | null, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Get user by ID
 */
export async function getUserById(
  client: SupabaseClient,
  userId: string
): QueryResult<User> {
  try {
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    return { data: data as User | null, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Get all asesores
 */
export async function getAsesores(
  client: SupabaseClient
): QueryListResult<User> {
  try {
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('role', 'asesor')
      .eq('is_active', true)
      .order('name', { ascending: true });

    return { data: data as User[] | null, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Create user
 */
export async function createUser(
  client: SupabaseClient,
  user: Omit<User, 'id' | 'createdAt'>
): QueryResult<User> {
  try {
    const { data, error } = await client
      .from('users')
      .insert([
        {
          ...user,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    return { data: data as User | null, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Update user
 */
export async function updateUser(
  client: SupabaseClient,
  userId: string,
  updates: Partial<User>
): QueryResult<User> {
  try {
    const { data, error } = await client
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    return { data: data as User | null, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

// ========== TRANSACTIONS QUERIES ==========

/**
 * Get user transactions
 */
export async function getUserTransactions(
  client: SupabaseClient,
  userId: string
): QueryListResult<Transaction> {
  try {
    const { data, error } = await client
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data: data as Transaction[] | null, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Create transaction
 */
export async function createTransaction(
  client: SupabaseClient,
  transaction: Omit<Transaction, 'id' | 'createdAt'>
): QueryResult<Transaction> {
  try {
    const { data, error } = await client
      .from('transactions')
      .insert([
        {
          ...transaction,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    return { data: data as Transaction | null, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

// ========== CERTIFICATES QUERIES ==========

/**
 * Get user certificates
 */
export async function getUserCertificates(
  client: SupabaseClient,
  userId: string
): QueryListResult<Certificate> {
  try {
    const { data, error } = await client
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .order('issued_at', { ascending: false });

    return { data: data as Certificate[] | null, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Get certificate by code
 */
export async function getCertificateByCode(
  client: SupabaseClient,
  certificateCode: string
): QueryResult<Certificate> {
  try {
    const { data, error } = await client
      .from('certificates')
      .select('*')
      .eq('certificate_code', certificateCode)
      .single();

    return { data: data as Certificate | null, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Create certificate
 */
export async function createCertificate(
  client: SupabaseClient,
  certificate: Omit<Certificate, 'id' | 'issuedAt'>
): QueryResult<Certificate> {
  try {
    const { data, error } = await client
      .from('certificates')
      .insert([
        {
          ...certificate,
          issued_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    return { data: data as Certificate | null, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

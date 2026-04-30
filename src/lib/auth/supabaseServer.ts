/**
 * Server-Only Supabase Client
 * Uses SERVICE_ROLE_KEY to bypass RLS for admin operations
 *
 * IMPORTANT: This file should ONLY be imported in:
 * - API routes (src/app/api/*)
 * - Server components with 'use server'
 * - Server-side utilities and helpers
 *
 * NEVER expose this to the browser or use in client components!
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ========== ENVIRONMENT VALIDATION ==========
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(
      `Missing required environment variable: ${envVar}. Server client initialization will fail.`
    );
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing Supabase configuration: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
  );
}

// ========== SINGLETON SERVER CLIENT ==========
/**
 * Singleton pattern to avoid creating multiple client instances
 * Uses service role key which bypasses RLS
 */
let serverClient: SupabaseClient | null = null;

/**
 * Get or create the server-side Supabase client
 * Uses SERVICE_ROLE_KEY - bypasses all RLS policies
 *
 * CAUTION: Only use this for:
 * - Admin operations that need to bypass RLS
 * - Server-to-server operations
 * - Batch operations that require elevated privileges
 *
 * For user-facing operations, use the regular client with RLS!
 *
 * @returns Supabase client with admin privileges
 */
export function getServerClient(): SupabaseClient {
  if (!serverClient) {
    serverClient = createClient(supabaseUrl as string, supabaseServiceKey as string, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }

  return serverClient;
}

// ========== TYPE-SAFE OPERATIONS ==========
/**
 * Typed query helper for server operations
 * Returns consistent { data, error } response
 */
export async function serverQuery<T>(
  operation: Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any }> {
  try {
    const result = await operation;
    if (result.error) {
      console.error('Server query error:', result.error);
    }
    return result;
  } catch (err) {
    console.error('Server query exception:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ========== ADMIN OPERATIONS ==========

/**
 * Insert a row as admin (bypasses RLS)
 * @param table - Table name
 * @param data - Row to insert
 * @returns { data, error }
 */
export async function adminInsert<T>(
  table: string,
  data: T
): Promise<{ data: T | null; error: any }> {
  const client = getServerClient();
  return serverQuery(
    client.from(table).insert([data]).select().single() as any
  );
}

/**
 * Update a row as admin (bypasses RLS)
 * @param table - Table name
 * @param id - Row ID
 * @param updates - Partial update data
 * @returns { data, error }
 */
export async function adminUpdate<T>(
  table: string,
  id: string,
  updates: Partial<T>
): Promise<{ data: T | null; error: any }> {
  const client = getServerClient();
  return serverQuery(
    client
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single() as any
  );
}

/**
 * Delete a row as admin (bypasses RLS)
 * @param table - Table name
 * @param id - Row ID
 * @returns Success boolean
 */
export async function adminDelete(
  table: string,
  id: string
): Promise<boolean> {
  const client = getServerClient();
  const { error } = await serverQuery(
    client.from(table).delete().eq('id', id) as any
  );
  return !error;
}

/**
 * Query rows as admin (bypasses RLS)
 * @param table - Table name
 * @param filters - Optional filters
 * @returns { data, error }
 */
export async function adminSelect<T>(
  table: string,
  filters?: Array<{ column: string; value: any }>
): Promise<{ data: T[] | null; error: any }> {
  const client = getServerClient();

  let query = client.from(table).select('*');

  if (filters) {
    filters.forEach(({ column, value }) => {
      query = query.eq(column, value);
    });
  }

  return serverQuery(query as any);
}

// ========== BATCH OPERATIONS ==========

/**
 * Batch insert multiple rows as admin
 * @param table - Table name
 * @param rows - Array of rows to insert
 * @returns { data, error, count }
 */
export async function adminBatchInsert<T>(
  table: string,
  rows: T[]
): Promise<{ data: T[] | null; error: any; count: number }> {
  const client = getServerClient();

  try {
    const { data, error } = await client
      .from(table)
      .insert(rows as any[])
      .select();

    return {
      data: data as T[] | null,
      error,
      count: data?.length || 0,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : String(err),
      count: 0,
    };
  }
}

/**
 * Batch update multiple rows as admin
 * @param table - Table name
 * @param updates - Array of { id, data } to update
 * @returns { count, errors }
 */
export async function adminBatchUpdate<T>(
  table: string,
  updates: Array<{ id: string; data: Partial<T> }>
): Promise<{ count: number; errors: any[] }> {
  const client = getServerClient();
  const errors: any[] = [];
  let count = 0;

  for (const { id, data } of updates) {
    const { error } = await client
      .from(table)
      .update(data as any)
      .eq('id', id);

    if (error) {
      errors.push({ id, error });
    } else {
      count++;
    }
  }

  return { count, errors };
}

// ========== STORAGE OPERATIONS ==========

/**
 * Upload file to storage as admin
 * @param bucket - Storage bucket
 * @param path - File path
 * @param file - File object or Buffer
 * @returns { success, url, error }
 */
export async function adminUploadFile(
  bucket: string,
  path: string,
  file: File | Buffer
): Promise<{ success: boolean; url?: string; error?: any }> {
  const client = getServerClient();

  try {
    const { data, error } = await client.storage
      .from(bucket)
      .upload(path, file as any, { upsert: true });

    if (error) {
      console.error('Storage upload error:', error);
      return { success: false, error };
    }

    const { data: publicUrl } = client.storage
      .from(bucket)
      .getPublicUrl(path);

    return { success: true, url: publicUrl.publicUrl };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error('Storage exception:', error);
    return { success: false, error };
  }
}

/**
 * Delete file from storage as admin
 * @param bucket - Storage bucket
 * @param path - File path
 * @returns { success, error }
 */
export async function adminDeleteFile(
  bucket: string,
  path: string
): Promise<{ success: boolean; error?: any }> {
  const client = getServerClient();

  try {
    const { error } = await client.storage.from(bucket).remove([path]);

    if (error) {
      console.error('Storage delete error:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error('Storage exception:', error);
    return { success: false, error };
  }
}

// ========== SAFETY UTILITIES ==========

/**
 * Verify that this is running in a server context
 * Helps prevent accidental client-side usage
 */
export function assertServerContext(): void {
  if (typeof window !== 'undefined') {
    throw new Error(
      'Server client accessed from browser context! This is a security risk. Only use in server components or API routes.'
    );
  }
}

/**
 * Create a context-aware server client
 * Automatically verifies server context
 */
export function getVerifiedServerClient(): SupabaseClient {
  assertServerContext();
  return getServerClient();
}

// ========== EXPORTS ==========
export default getServerClient;

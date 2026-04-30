import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ========== ENVIRONMENT VALIDATION ==========
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

// Validate at module load time in browser
if (typeof window !== 'undefined') {
  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      console.error(`Missing required environment variable: ${envVar}`);
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase configuration: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

// ========== BROWSER CLIENT (anon key) ==========
/**
 * Browser/client-side Supabase client
 * Uses anon key - respects RLS policies
 * Safe for use in React components
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// ========== SERVER CLIENT (service role key) ==========
/**
 * Server-side Supabase client
 * Uses service role key - bypasses RLS
 * Only for API routes and server components
 */
let serverClient: SupabaseClient | null = null;

export function getServerClient(): SupabaseClient {
  if (!supabaseServiceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY not available in this environment'
    );
  }

  if (!serverClient) {
    serverClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return serverClient;
}

// ========== TYPED QUERY HELPER ==========
/**
 * Helper for type-safe Supabase queries with error handling
 * Usage: const { data, error } = await queryTyped<PropertyRow>('properties', ['*']);
 */
export async function queryTyped<T>(
  table: string,
  select: string = '*',
  filters?: Array<{
    column: string;
    operator: string;
    value: any;
  }>
) {
  try {
    let query = supabase.from(table).select(select);

    if (filters) {
      filters.forEach(({ column, operator, value }) => {
        if (operator === 'eq') query = query.eq(column, value);
        else if (operator === 'neq') query = query.neq(column, value);
        else if (operator === 'gt') query = query.gt(column, value);
        else if (operator === 'gte') query = query.gte(column, value);
        else if (operator === 'lt') query = query.lt(column, value);
        else if (operator === 'lte') query = query.lte(column, value);
        else if (operator === 'like') query = query.like(column, value);
        else if (operator === 'in') query = query.in(column, value);
      });
    }

    const { data, error } = await query;

    if (error) {
      console.error(`Query error in ${table}:`, error);
      return { data: null, error };
    }

    return { data: data as T[], error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(`Exception in queryTyped:`, error);
    return { data: null, error };
  }
}

// ========== ERROR HANDLING WRAPPER ==========
/**
 * Wraps Supabase operations with consistent error handling
 * Returns { success, data, error } tuple
 */
export async function handleSupabaseError<T>(
  operation: Promise<{ data: T | null; error: any }>
): Promise<{ success: boolean; data: T | null; error: any }> {
  try {
    const { data, error } = await operation;

    if (error) {
      console.error('Supabase operation failed:', error);
      return { success: false, data: null, error };
    }

    return { success: true, data, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Supabase exception:', error);
    return { success: false, data: null, error };
  }
}

// ========== STORAGE HELPERS ==========
/**
 * Upload file to Supabase Storage
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<{ success: boolean; url?: string; error?: any }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });

    if (error) {
      console.error('Storage upload error:', error);
      return { success: false, error };
    }

    const { data: publicUrl } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return { success: true, url: publicUrl.publicUrl };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Storage exception:', error);
    return { success: false, error };
  }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ success: boolean; error?: any }> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      console.error('Storage delete error:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Storage exception:', error);
    return { success: false, error };
  }
}

// ========== REALTIME SUBSCRIPTIONS ==========
/**
 * Subscribe to real-time changes on a table
 */
export function subscribeToTable(
  table: string,
  onUpdate: (payload: any) => void,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*'
) {
  const subscription = supabase
    .channel(`${table}:${event}`)
    .on('postgres_changes', { event, schema: 'public', table }, onUpdate)
    .subscribe();

  return subscription;
}

/**
 * Unsubscribe from real-time changes
 */
export async function unsubscribeFromTable(subscription: any) {
  if (subscription) {
    await supabase.removeChannel(subscription);
  }
}

// ========== SESSION MANAGEMENT ==========
/**
 * Get current session user
 */
export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (err) {
    console.error('Failed to get current user:', err);
    return null;
  }
}

/**
 * Sign out current user
 */
export async function signOutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Sign out exception:', err);
    return false;
  }
}

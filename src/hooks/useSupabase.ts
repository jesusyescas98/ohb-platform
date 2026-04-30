'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@lib/supabaseClient';

/**
 * Hook for using Supabase realtime subscriptions
 * Usage:
 *   const data = useSupabaseRealtime('properties');
 */
export function useSupabaseRealtime<T>(
  table: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*'
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const subscription = supabase
      .channel(`${table}:${event}`)
      .on(
        'postgres_changes',
        { event, schema: 'public', table },
        (payload) => {
          console.log(`Realtime update on ${table}:`, payload);
          // Re-fetch data on change
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [table, event]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: result, error: err } = await supabase
        .from(table)
        .select('*');

      if (err) {
        throw err;
      }

      setData((result as T[]) || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [table]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for loading data from Supabase with caching
 * Usage:
 *   const { data: properties, loading } = useSupabaseData('properties');
 */
export function useSupabaseData<T>(
  table: string,
  filters?: Array<{ column: string; operator: string; value: any }>,
  cacheTime: number = 60000 // 1 minute
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase.from(table).select('*');

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

      const { data: result, error: err } = await query;

      if (err) {
        throw err;
      }

      setData((result as T[]) || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [table, filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export default useSupabaseData;

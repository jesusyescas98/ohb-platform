'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';

export interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  cacheTime?: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface UseFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isValidating: boolean;
}

// Global fetch cache
const fetchCache = new Map<string, CacheEntry<any>>();

export function useFetch<T = any>(
  url: string | null,
  options: FetchOptions = {}
): UseFetchReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!url);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const {
    skipAuth = false,
    retries = 3,
    retryDelay = 1000,
    timeout = 30000,
    cacheTime = 5 * 60 * 1000, // 5 minutes default
    ...fetchOptions
  } = options;

  const authContext = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(
    async (retryCount = 0) => {
      if (!url) {
        setLoading(false);
        return;
      }

      try {
        setIsValidating(true);

        // Check cache
        const cacheKey = `${url}_${JSON.stringify(options)}`;
        const cached = fetchCache.get(cacheKey);
        if (
          cached &&
          Date.now() - cached.timestamp < cacheTime
        ) {
          setData(cached.data);
          setLoading(false);
          setIsValidating(false);
          return;
        }

        // Setup request
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        };

        // Add auth header if not skipped
        if (!skipAuth && authContext?.sessionToken) {
          headers['Authorization'] = `Bearer ${authContext.sessionToken}`;
        }

        const response = await fetch(url, {
          ...fetchOptions,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result: T = await response.json();

        // Cache the result
        fetchCache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
        });

        setData(result);
        setError(null);
      } catch (err) {
        // Handle abort
        if (err instanceof DOMException && err.name === 'AbortError') {
          return; // Request was cancelled
        }

        // Retry logic
        if (retryCount < retries) {
          await new Promise(resolve =>
            setTimeout(resolve, retryDelay * (retryCount + 1))
          );
          return fetchData(retryCount + 1);
        }

        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
        setIsValidating(false);
      }
    },
    [url, options, skipAuth, retries, retryDelay, timeout, cacheTime, authContext?.sessionToken]
  );

  // Initial fetch
  useEffect(() => {
    if (url) {
      setLoading(true);
      fetchData();
    }

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [url, fetchData]);

  const refetch = useCallback(async () => {
    if (!url) return;

    // Clear cache for this URL
    const cacheKey = `${url}_${JSON.stringify(options)}`;
    fetchCache.delete(cacheKey);

    setLoading(true);
    await fetchData();
  }, [url, fetchData, options]);

  return {
    data,
    loading,
    error,
    refetch,
    isValidating,
  };
}

export default useFetch;

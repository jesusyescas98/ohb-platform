'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Property } from '../lib/types';
import { PropertiesDB, PropertyRecord } from '../lib/database';

interface UsePropertyDataOptions {
  filters?: {
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    location?: string;
    status?: string;
  };
  searchTerm?: string;
  sortBy?: 'price' | 'newest' | 'featured';
}

interface UsePropertyDataReturn {
  properties: PropertyRecord[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  refetch: () => void;
  getById: (id: string) => PropertyRecord | undefined;
}

// Simple in-memory cache for property data
const propertyCache = {
  data: null as Property[] | null,
  timestamp: 0,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

export function usePropertyData(options?: UsePropertyDataOptions): UsePropertyDataReturn {
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef(propertyCache);

  const loadProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache validity
      const now = Date.now();
      if (
        cacheRef.current.data &&
        now - cacheRef.current.timestamp < cacheRef.current.CACHE_DURATION
      ) {
        setProperties(cacheRef.current.data);
        setLoading(false);
        return;
      }

      // Fetch from database
      let results = PropertiesDB.getAll();

      // Apply filters
      if (options?.filters) {
        const { type, minPrice, maxPrice, bedrooms, location, status } = options.filters;

        if (type) {
          results = results.filter(p => p.category === type);
        }
        if (minPrice !== undefined) {
          results = results.filter(p => p.price >= minPrice);
        }
        if (maxPrice !== undefined) {
          results = results.filter(p => p.price <= maxPrice);
        }
        if (bedrooms !== undefined) {
          results = results.filter(p => p.bedrooms >= bedrooms);
        }
        if (location) {
          results = results.filter(
            p =>
              p.location.toLowerCase().includes(location.toLowerCase()) ||
              p.description.toLowerCase().includes(location.toLowerCase())
          );
        }
        if (status) {
          results = results.filter(p => p.status === status);
        }
      }

      // Apply search term
      if (options?.searchTerm) {
        const term = options.searchTerm.toLowerCase();
        results = results.filter(
          p =>
            p.title.toLowerCase().includes(term) ||
            p.description.toLowerCase().includes(term) ||
            p.location.toLowerCase().includes(term)
        );
      }

      // Apply sorting
      if (options?.sortBy) {
        if (options.sortBy === 'price') {
          results.sort((a, b) => a.price - b.price);
        } else if (options.sortBy === 'newest') {
          results.sort((a, b) => b.createdAt - a.createdAt);
        } else if (options.sortBy === 'featured') {
          results.sort((a, b) => (b as any).featured ? -1 : 1);
        }
      }

      // Update cache
      cacheRef.current.data = results;
      cacheRef.current.timestamp = now;

      setProperties(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading properties');
    } finally {
      setLoading(false);
    }
  }, [options?.filters, options?.searchTerm, options?.sortBy]);

  // Initial load
  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  // Listen for database updates
  useEffect(() => {
    const handleDbUpdate = () => {
      cacheRef.current.data = null; // Invalidate cache
      loadProperties();
    };

    window.addEventListener('db_updated', handleDbUpdate);
    return () => window.removeEventListener('db_updated', handleDbUpdate);
  }, [loadProperties]);

  const getById = useCallback(
    (id: string): Property | undefined => {
      return properties.find(p => p.id === id);
    },
    [properties]
  );

  return {
    properties,
    loading,
    error,
    totalCount: properties.length,
    refetch: loadProperties,
    getById,
  };
}

export default usePropertyData;

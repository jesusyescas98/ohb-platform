'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { LeadRecord, LeadsDB } from '../lib/database';
import { useAuth } from './useAuth';

interface LeadFilters {
  status?: string;
  source?: string;
  priority?: string;
  advisor?: string;
  interestType?: string;
  dateFrom?: number;
  dateTo?: number;
}

interface UseLeadsDataReturn {
  leads: LeadRecord[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  addLead: (lead: Omit<LeadRecord, 'id' | 'createdAt' | 'updatedAt'>) => LeadRecord | null;
  updateLead: (id: string, updates: Partial<LeadRecord>) => boolean;
  deleteLead: (id: string) => boolean;
  getLead: (id: string) => LeadRecord | undefined;
  refetch: () => void;
}

export function useLeadsData(filters?: LeadFilters): UseLeadsDataReturn {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { email, isAdmin, isAdvisor } = useAuth();
  const cacheRef = useRef<{ data: LeadRecord[] | null; timestamp: number }>({
    data: null,
    timestamp: 0,
  });

  const loadLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all leads from database
      let results = LeadsDB.getAll();

      // Role-based filtering: admins see all, advisors see their own
      if (!isAdmin && isAdvisor) {
        results = results.filter(l => l.advisor === email);
      }

      // Apply user-provided filters
      if (filters) {
        const {
          status,
          source,
          priority,
          advisor,
          interestType,
          dateFrom,
          dateTo,
        } = filters;

        if (status) {
          results = results.filter(l => l.status === status);
        }
        if (source) {
          results = results.filter(l => l.source === source);
        }
        if (priority) {
          results = results.filter(l => l.priority === priority);
        }
        if (advisor && isAdmin) {
          results = results.filter(l => l.advisor === advisor);
        }
        if (interestType) {
          results = results.filter(l => l.interestType === interestType);
        }
        if (dateFrom) {
          results = results.filter(l => l.createdAt >= dateFrom);
        }
        if (dateTo) {
          results = results.filter(l => l.createdAt <= dateTo);
        }
      }

      // Sort by most recent
      results.sort((a, b) => b.createdAt - a.createdAt);

      cacheRef.current.data = results;
      cacheRef.current.timestamp = Date.now();
      setLeads(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading leads');
    } finally {
      setLoading(false);
    }
  }, [email, isAdmin, isAdvisor, filters]);

  // Initial load
  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  // Listen for database updates
  useEffect(() => {
    const handleDbUpdate = () => {
      cacheRef.current.data = null;
      loadLeads();
    };

    window.addEventListener('db_updated', handleDbUpdate);
    return () => window.removeEventListener('db_updated', handleDbUpdate);
  }, [loadLeads]);

  const addLead = useCallback(
    (leadData: Omit<LeadRecord, 'id' | 'createdAt' | 'updatedAt'>): LeadRecord | null => {
      try {
        // Set advisor to current user if they're an advisor
        const lead: LeadRecord = {
          ...leadData,
          id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          advisor: leadData.advisor || (isAdvisor ? email || 'sistema' : 'sistema'),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        LeadsDB.add(lead);
        cacheRef.current.data = null; // Invalidate cache
        loadLeads();
        return lead;
      } catch (err) {
        console.error('Error adding lead:', err);
        return null;
      }
    },
    [email, isAdvisor, loadLeads]
  );

  const updateLead = useCallback(
    (id: string, updates: Partial<LeadRecord>): boolean => {
      try {
        const lead = leads.find(l => l.id === id);
        if (!lead) return false;

        // Check permission: admins can update any, advisors only their own
        if (!isAdmin && isAdvisor && lead.advisor !== email) {
          return false;
        }

        const updated: LeadRecord = {
          ...lead,
          ...updates,
          updatedAt: Date.now(),
        };

        LeadsDB.update(id, updated);
        cacheRef.current.data = null; // Invalidate cache
        loadLeads();
        return true;
      } catch (err) {
        console.error('Error updating lead:', err);
        return false;
      }
    },
    [leads, email, isAdmin, isAdvisor, loadLeads]
  );

  const deleteLead = useCallback(
    (id: string): boolean => {
      try {
        const lead = leads.find(l => l.id === id);
        if (!lead) return false;

        // Check permission: only admins can delete
        if (!isAdmin) {
          return false;
        }

        LeadsDB.delete(id);
        cacheRef.current.data = null; // Invalidate cache
        loadLeads();
        return true;
      } catch (err) {
        console.error('Error deleting lead:', err);
        return false;
      }
    },
    [leads, isAdmin, loadLeads]
  );

  const getLead = useCallback(
    (id: string): LeadRecord | undefined => {
      return leads.find(l => l.id === id);
    },
    [leads]
  );

  return {
    leads,
    loading,
    error,
    totalCount: leads.length,
    addLead,
    updateLead,
    deleteLead,
    getLead,
    refetch: loadLeads,
  };
}

export default useLeadsData;

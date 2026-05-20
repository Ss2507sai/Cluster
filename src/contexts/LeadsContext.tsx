import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Lead } from '../types';
import { computeIcpScore, computePainScore, computeIntentScore } from '../lib/scoring';

interface LeadsContextValue {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  fetchLeads: () => Promise<void>;
  addLead: (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => Promise<Lead | null>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  updateLeadStage: (id: string, stage: Lead['stage']) => Promise<void>;
}

const LeadsContext = createContext<LeadsContextValue>({
  leads: [],
  loading: false,
  error: null,
  fetchLeads: async () => {},
  addLead: async () => null,
  updateLead: async () => {},
  deleteLead: async () => {},
  updateLeadStage: async () => {},
});

export function LeadsProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setLeads(data as Lead[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const addLead = useCallback(async (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    const icp_score = computeIcpScore(leadData);
    const pain_score = computePainScore(leadData);
    const intent_score = computeIntentScore(leadData);

    const { data, error: err } = await supabase
      .from('leads')
      .insert([{ ...leadData, icp_score, pain_score, intent_score }])
      .select()
      .single();

    if (err) {
      setError(err.message);
      return null;
    }

    setLeads(prev => [data as Lead, ...prev]);
    return data as Lead;
  }, []);

  const updateLead = useCallback(async (id: string, updates: Partial<Lead>) => {
    const existing = leads.find(l => l.id === id);
    if (!existing) return;

    const merged = { ...existing, ...updates };
    const icp_score = computeIcpScore(merged);
    const pain_score = computePainScore(merged);
    const intent_score = computeIntentScore(merged);

    const { error: err } = await supabase
      .from('leads')
      .update({ ...updates, icp_score, pain_score, intent_score })
      .eq('id', id);

    if (!err) {
      setLeads(prev =>
        prev.map(l => l.id === id ? { ...l, ...updates, icp_score, pain_score, intent_score } : l)
      );
    }
  }, [leads]);

  const deleteLead = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('leads').delete().eq('id', id);
    if (!err) {
      setLeads(prev => prev.filter(l => l.id !== id));
    }
  }, []);

  const updateLeadStage = useCallback(async (id: string, stage: Lead['stage']) => {
    const { error: err } = await supabase.from('leads').update({ stage }).eq('id', id);
    if (!err) {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, stage } : l));
    }
  }, []);

  return (
    <LeadsContext.Provider value={{ leads, loading, error, fetchLeads, addLead, updateLead, deleteLead, updateLeadStage }}>
      {children}
    </LeadsContext.Provider>
  );
}

export const useLeads = () => useContext(LeadsContext);

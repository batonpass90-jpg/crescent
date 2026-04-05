import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

export const isConfigured =
  !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(url, key);

const guard = () => { if (!isConfigured) throw new Error('Supabase 미설정'); };

// Targets
export const getTargets = async (status?: string) => {
  if (!isConfigured) return [];
  let q = supabase.from('targets').select('*').order('updated_at', { ascending: false });
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
};

export const upsertTarget = async (row: Record<string, unknown>) => {
  guard();
  const { data, error } = await supabase.from('targets').upsert(row).select().single();
  if (error) throw error;
  return data;
};

export const updateTargetStatus = async (id: string, status: string) => {
  guard();
  const { error } = await supabase.from('targets').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
};

export const getActivities = async (targetId: string) => {
  if (!isConfigured) return [];
  const { data, error } = await supabase.from('activities').select('*').eq('target_id', targetId).order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

export const insertActivity = async (row: Record<string, unknown>) => {
  guard();
  const { data, error } = await supabase.from('activities').insert(row).select().single();
  if (error) throw error;
  return data;
};

// Messages
export const getMessages = async (targetId?: string) => {
  if (!isConfigured) return [];
  let q = supabase.from('messages').select('*').order('sent_at', { ascending: false });
  if (targetId) q = q.eq('target_id', targetId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
};

export const insertMessage = async (row: Record<string, unknown>) => {
  guard();
  const { data, error } = await supabase.from('messages').insert(row).select().single();
  if (error) throw error;
  return data;
};

// Templates
export const getTemplates = async (category?: string) => {
  if (!isConfigured) return [];
  let q = supabase.from('templates').select('*');
  if (category) q = q.eq('category', category);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
};

// Quotes
export const getQuotes = async () => {
  if (!isConfigured) return [];
  const { data, error } = await supabase.from('quotes').select('*, targets(name,phone)').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

export const upsertQuote = async (row: Record<string, unknown>) => {
  guard();
  const { data, error } = await supabase.from('quotes').upsert(row).select().single();
  if (error) throw error;
  return data;
};

// Contracts
export const getContracts = async () => {
  if (!isConfigured) return [];
  const { data, error } = await supabase.from('contracts').select('*, targets(name,phone,category)').order('start_date', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

export const upsertContract = async (row: Record<string, unknown>) => {
  guard();
  const { data, error } = await supabase.from('contracts').upsert(row).select().single();
  if (error) throw error;
  return data;
};

// Tasks
export const getTasks = async (type?: string) => {
  if (!isConfigured) return [];
  let q = supabase.from('tasks').select('*, targets(name)').order('due_date', { ascending: true });
  if (type) q = q.eq('type', type);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
};

export const upsertTask = async (row: Record<string, unknown>) => {
  guard();
  const { data, error } = await supabase.from('tasks').upsert(row).select().single();
  if (error) throw error;
  return data;
};

// Daily Brief
export const getDailyBrief = async () => {
  if (!isConfigured) return { yesterday_sent: 0, yesterday_replied: 0, active_consulting: 0, month_contracts: 0, month_mrr: 0 };
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
  const yesterday = new Date(today.getTime() - 86400000).toISOString().split('T')[0];
  const [msgR, cR, contractR, mrrR] = await Promise.all([
    supabase.from('messages').select('id,replied').gte('sent_at', yesterday),
    supabase.from('targets').select('id', { count: 'exact' }).eq('status', 'consulting'),
    supabase.from('contracts').select('id', { count: 'exact' }).gte('start_date', startOfMonth),
    supabase.from('contracts').select('monthly_fee').eq('status', 'active'),
  ]);
  return {
    yesterday_sent: msgR.data?.length ?? 0,
    yesterday_replied: msgR.data?.filter(m => m.replied).length ?? 0,
    active_consulting: cR.count ?? 0,
    month_contracts: contractR.count ?? 0,
    month_mrr: mrrR.data?.reduce((s, c) => s + (c.monthly_fee || 0), 0) ?? 0,
  };
};

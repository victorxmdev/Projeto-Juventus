import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL_KEY = 'juventus_supabase_url';
const SUPABASE_ANON_KEY = 'juventus_supabase_anon_key';

export function getStoredSupabaseConfig(): { url: string; key: string } {
  const url = localStorage.getItem(SUPABASE_URL_KEY) || import.meta.env.VITE_SUPABASE_URL || '';
  const key = localStorage.getItem(SUPABASE_ANON_KEY) || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  return { url, key };
}

export function saveSupabaseConfig(url: string, key: string) {
  if (url) localStorage.setItem(SUPABASE_URL_KEY, url);
  else localStorage.removeItem(SUPABASE_URL_KEY);

  if (key) localStorage.setItem(SUPABASE_ANON_KEY, key);
  else localStorage.removeItem(SUPABASE_ANON_KEY);
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const { url, key } = getStoredSupabaseConfig();
  if (!url || !key) {
    return null;
  }
  
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key);
    } catch (e) {
      console.warn('Could not initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
}

export function isSupabaseConnected(): boolean {
  const { url, key } = getStoredSupabaseConfig();
  return Boolean(url && key);
}


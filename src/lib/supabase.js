import { createClient } from '@supabase/supabase-js';

const getEnvUrl = () => {
  return (
    import.meta.env.VITE_SUPABASE_URL ||
    localStorage.getItem('vite_supabase_url') ||
    ''
  );
};

const getEnvKey = () => {
  return (
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    localStorage.getItem('vite_supabase_anon_key') ||
    ''
  );
};

export const isSupabaseConfigured = () => {
  const url = getEnvUrl();
  const key = getEnvKey();
  return (
    typeof url === 'string' &&
    url.trim().length > 0 &&
    !url.includes('your-supabase-project') &&
    typeof key === 'string' &&
    key.trim().length > 0 &&
    !key.includes('your-anon-key')
  );
};

export const getSupabaseClient = () => {
  if (!isSupabaseConfigured()) return null;
  return createClient(getEnvUrl().trim(), getEnvKey().trim());
};

export const supabase = isSupabaseConfigured() ? getSupabaseClient() : null;

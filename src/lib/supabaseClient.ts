import { createClient } from '@supabase/supabase-js';
import { getEnv } from './env';

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your-supabase-url');

// We initialize the client even if keys are missing to avoid top-level crashes,
// but we'll handle the actual usage in the AuthContext.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

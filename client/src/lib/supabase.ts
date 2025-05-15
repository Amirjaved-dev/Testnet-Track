import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for the entire app
// Trying to read environment variables with proper fallbacks
const envVars = import.meta.env;

// Log available keys for debugging (not values, just the keys)
console.log('Available env vars:', Object.keys(envVars));

const supabaseUrl = envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY || envVars.SUPABASE_ANON_KEY;

// Check if we have the necessary values
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Make sure SUPABASE_URL and SUPABASE_ANON_KEY are set in the environment.');
}

// Create client with best-effort values
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
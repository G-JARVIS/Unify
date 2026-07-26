import { createClient } from '@supabase/supabase-js';

// ─── Supabase is DISABLED ────────────────────────────────────
// All data now flows through our FastAPI backend at /api/v1.
// The Supabase client is kept as a no-op stub so legacy db.ts
// functions compile but always fall back to dummy data.
const supabaseUrl = '';
const supabaseAnonKey = '';

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');

// Force isConfigured = false so every db.ts function returns dummy data
// instead of making Supabase REST calls that 400.
export const isConfigured = false;

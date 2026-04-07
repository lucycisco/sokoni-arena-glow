// Untyped Supabase client for use until types.ts is regenerated
// This avoids TS errors from empty Database type definitions
import { supabase as typedSupabase } from './client';
import type { SupabaseClient } from '@supabase/supabase-js';

// Export as 'any' typed client to bypass empty schema types
export const supabase = typedSupabase as SupabaseClient<any, 'public', any>;

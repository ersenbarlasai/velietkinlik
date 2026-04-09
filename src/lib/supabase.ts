import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Browser-side Supabase client.
 * RLS uyumlu, anon key ile çalışır.
 * Client component ve public API route'larda kullanılır.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

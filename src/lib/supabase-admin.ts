import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Server-side Supabase admin client.
 * Service role key ile çalışır — RLS'yi bypass eder.
 * SADECE server component, API route veya server action içinde kullanılmalıdır.
 * Client component'lerde asla import etmeyin!
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

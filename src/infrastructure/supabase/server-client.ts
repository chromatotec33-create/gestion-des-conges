import { createClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/lib/env.server";

export function createServiceRoleClient() {
  const serverEnv = getServerEnv();
  return createClient(serverEnv.NEXT_PUBLIC_SUPABASE_URL, serverEnv.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export function createAnonServerClient() {
  const serverEnv = getServerEnv();
  return createClient(serverEnv.NEXT_PUBLIC_SUPABASE_URL, serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

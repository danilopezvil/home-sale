import { createClient } from "@supabase/supabase-js";

import { publicEnv } from "@/lib/env-public";

export const supabasePublicClient = createClient(
  publicEnv.NEXT_PUBLIC_SUPABASE_URL,
  publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

import "server-only";

import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";

const url = env.NEXT_PUBLIC_SUPABASE_URL;

export const supabaseServerAnonClient = createClient(
  url,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export const supabaseServiceRoleClient = createClient(
  url,
  env.SUPABASE_SERVICE_ROLE_KEY,
);

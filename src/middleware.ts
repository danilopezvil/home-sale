import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/lib/env";
import { ACCESS_TOKEN_COOKIE } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    },
  );

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (accessToken) {
    await supabase.auth.getUser(accessToken);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};

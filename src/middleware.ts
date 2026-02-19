import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/lib/env";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, baseCookieOptions } from "@/lib/supabase/server";
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
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (accessToken) {
    const { data } = await supabase.auth.getUser(accessToken);

    if (data.user) {
      return response;
    }
  }

  if (!refreshToken) {
    return response;
  }

  const { data } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (!data.session) {
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    response.cookies.delete(REFRESH_TOKEN_COOKIE);
    return response;
  }

  response.cookies.set(ACCESS_TOKEN_COOKIE, data.session.access_token, {
    ...baseCookieOptions,
    expires: data.session.expires_at
      ? new Date(data.session.expires_at * 1000)
      : undefined,
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, data.session.refresh_token, baseCookieOptions);

  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

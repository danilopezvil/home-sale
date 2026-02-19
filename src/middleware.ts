import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/lib/env";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

const baseCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

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

  let hasUser = false;

  if (accessToken) {
    const { data } = await supabase.auth.getUser(accessToken);
    hasUser = Boolean(data.user);
  }

  if (!hasUser && refreshToken) {
    const { data } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

    if (data.session) {
      response.cookies.set(ACCESS_TOKEN_COOKIE, data.session.access_token, {
        ...baseCookieOptions,
        expires: data.session.expires_at
          ? new Date(data.session.expires_at * 1000)
          : undefined,
      });
      response.cookies.set(REFRESH_TOKEN_COOKIE, data.session.refresh_token, {
        ...baseCookieOptions,
      });
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};

import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/lib/env";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

const adminEmails = new Set(env.ADMIN_EMAILS.map((email) => email.toLowerCase()));

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

  let userEmail: string | null = null;

  if (accessToken) {
    const { data } = await supabase.auth.getUser(accessToken);
    userEmail = data.user?.email?.toLowerCase() ?? null;
  }

  if (!userEmail && refreshToken) {
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
      userEmail = data.session.user.email?.toLowerCase() ?? null;
    }
  }

  const path = request.nextUrl.pathname;
  const isProtectedPage =
    path.startsWith("/admin/items") || path.startsWith("/admin/reservations");

  if (isProtectedPage && (!userEmail || !adminEmails.has(userEmail))) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};

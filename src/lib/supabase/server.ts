import "server-only";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { type NextResponse } from "next/server";

import { env } from "@/lib/env";

const url = env.NEXT_PUBLIC_SUPABASE_URL;

export const ACCESS_TOKEN_COOKIE = "sb-access-token";
export const REFRESH_TOKEN_COOKIE = "sb-refresh-token";

const baseCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export const supabaseServerAnonClient = createClient(
  url,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  },
);

export const supabaseServiceRoleClient = createClient(
  url,
  env.SUPABASE_SERVICE_ROLE_KEY,
);

export async function persistSupabaseSession(session: {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
}) {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_COOKIE, session.access_token, {
    ...baseCookieOptions,
    expires: session.expires_at ? new Date(session.expires_at * 1000) : undefined,
  });

  cookieStore.set(REFRESH_TOKEN_COOKIE, session.refresh_token, {
    ...baseCookieOptions,
  });
}

export function persistSupabaseSessionOnResponse(
  response: NextResponse,
  session: {
    access_token: string;
    refresh_token: string;
    expires_at?: number;
  },
) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, session.access_token, {
    ...baseCookieOptions,
    expires: session.expires_at ? new Date(session.expires_at * 1000) : undefined,
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, session.refresh_token, {
    ...baseCookieOptions,
  });
}

export async function clearSupabaseSession() {
  const cookieStore = await cookies();

  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}

export function clearSupabaseSessionOnResponse(response: NextResponse) {
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (accessToken) {
    const { data, error } = await supabaseServerAnonClient.auth.getUser(accessToken);

    if (!error && data.user) {
      return data.user;
    }
  }

  if (!refreshToken) {
    return null;
  }

  const { data, error } = await supabaseServerAnonClient.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session?.user) {
    return null;
  }

  cookieStore.set(ACCESS_TOKEN_COOKIE, data.session.access_token, {
    ...baseCookieOptions,
    expires: data.session.expires_at
      ? new Date(data.session.expires_at * 1000)
      : undefined,
  });

  cookieStore.set(REFRESH_TOKEN_COOKIE, data.session.refresh_token, {
    ...baseCookieOptions,
  });

  return data.session.user;
}

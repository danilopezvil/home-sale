import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import {
  clearSupabaseSession,
  persistSupabaseSession,
  supabaseServerAnonClient,
} from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/admin";

  if (code) {
    const { data, error } = await supabaseServerAnonClient.auth.exchangeCodeForSession(code);

    if (error || !data.session) {
      await clearSupabaseSession();
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    await persistSupabaseSession(data.session);

    return NextResponse.redirect(new URL(next, request.url));
  }

  if (!tokenHash || !type) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  const { data, error } = await supabaseServerAnonClient.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error || !data.session) {
    await clearSupabaseSession();
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  await persistSupabaseSession(data.session);

  return NextResponse.redirect(new URL(next, request.url));
}

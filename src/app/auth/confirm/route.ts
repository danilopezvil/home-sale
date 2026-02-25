import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import {
  clearSupabaseSessionOnResponse,
  createSupabaseRouteHandlerClient,
  persistSupabaseSessionOnResponse,
  supabaseServerAnonClient,
} from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/admin";

  if (code) {
    const supabase = createSupabaseRouteHandlerClient(request);
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.session) {
      const response = NextResponse.redirect(new URL("/admin", request.url));
      clearSupabaseSessionOnResponse(response);
      return response;
    }

    const response = NextResponse.redirect(new URL(next, request.url));
    persistSupabaseSessionOnResponse(response, data.session);
    return response;
  }

  if (!tokenHash || !type) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  const { data, error } = await supabaseServerAnonClient.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error || !data.session) {
    const response = NextResponse.redirect(new URL("/admin", request.url));
    clearSupabaseSessionOnResponse(response);
    return response;
  }

  const response = NextResponse.redirect(new URL(next, request.url));
  persistSupabaseSessionOnResponse(response, data.session);
  return response;
}

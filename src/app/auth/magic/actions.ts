"use server";

import type { EmailOtpType } from "@supabase/supabase-js";

import { persistSupabaseSession, supabaseServerAnonClient } from "@/lib/supabase/server";

export async function setSessionFromHash(
  accessToken: string,
  refreshToken: string,
  expiresAt?: number,
): Promise<boolean> {
  const { data, error } = await supabaseServerAnonClient.auth.getUser(accessToken);
  if (error || !data.user) return false;

  await persistSupabaseSession({
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: expiresAt,
  });

  return true;
}

export async function verifyOtpAndSetSession(
  tokenHash: string,
  type: string,
): Promise<boolean> {
  const { data, error } = await supabaseServerAnonClient.auth.verifyOtp({
    token_hash: tokenHash,
    type: type as EmailOtpType,
  });
  if (error || !data.session) return false;

  await persistSupabaseSession(data.session);
  return true;
}

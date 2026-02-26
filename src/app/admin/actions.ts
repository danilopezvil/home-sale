"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { env } from "@/lib/env";
import { clearSupabaseSession, supabaseServerAnonClient } from "@/lib/supabase/server";

export type LoginFormState = {
  status: "idle" | "sent" | "error";
  message: string;
};

async function getSiteUrl(): Promise<string> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

export async function sendMagicLinkAction(
  _prev: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const emailValue = formData.get("email");
  const email = typeof emailValue === "string" ? emailValue.trim().toLowerCase() : "";

  if (!email) {
    return { status: "error", message: "Please enter your email address." };
  }

  const allowedEmails = new Set(env.ADMIN_EMAILS.map((v) => v.toLowerCase()));

  if (allowedEmails.has(email)) {
    const redirectTo = `${await getSiteUrl()}/auth/magic?next=/admin/items`;
    await supabaseServerAnonClient.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: redirectTo },
    });
  }

  // Always return "sent" — never reveal which emails are registered
  return {
    status: "sent",
    message: "If this email is registered you'll receive a sign-in link shortly. Check your inbox (and spam folder).",
  };
}

export async function signOutAction(): Promise<void> {
  await clearSupabaseSession();
  redirect("/admin");
}

import "server-only";

import { redirect } from "next/navigation";

import { env } from "@/lib/env";
import { getSessionUser } from "@/lib/supabase/server";

const adminEmails = new Set(env.ADMIN_EMAILS.map((email) => email.toLowerCase()));

export async function requireAdminUser(nextPath = "/admin") {
  const user = await getSessionUser();

  if (!user?.email) {
    redirect(`/admin?error=not-signed-in&next=${encodeURIComponent(nextPath)}`);
  }

  if (!adminEmails.has(user.email.toLowerCase())) {
    redirect(`/admin?error=not-allowed&email=${encodeURIComponent(user.email)}`);
  }

  return user;
}

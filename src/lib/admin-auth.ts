import "server-only";

import { redirect } from "next/navigation";

import { env } from "@/lib/env";
import { getSessionUser } from "@/lib/supabase/server";

const adminEmails = new Set(env.ADMIN_EMAILS.map((email) => email.toLowerCase()));

export async function requireAdminUser() {
  const user = await getSessionUser();

  if (!user?.email || !adminEmails.has(user.email.toLowerCase())) {
    redirect("/admin");
  }

  return user;
}

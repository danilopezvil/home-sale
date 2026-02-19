import Link from "next/link";
import { headers } from "next/headers";

import { env } from "@/lib/env";
import {
  clearSupabaseSession,
  getSessionUser,
  supabaseServerAnonClient,
} from "@/lib/supabase/server";

type SearchParams = {
  error?: string;
  next?: string;
  email?: string;
};

async function getSiteUrl() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";

  if (!host) {
    return "http://localhost:3000";
  }

  return `${protocol}://${host}`;
}

async function sendMagicLink(formData: FormData) {
  "use server";

  const emailValue = formData.get("email");
  const email = typeof emailValue === "string" ? emailValue.trim().toLowerCase() : "";
  const allowedEmails = new Set(env.ADMIN_EMAILS.map((value) => value.toLowerCase()));

  if (!email || !allowedEmails.has(email)) {
    return;
  }

  const redirectTo = `${await getSiteUrl()}/auth/confirm?next=/admin/items`;

  await supabaseServerAnonClient.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: redirectTo,
    },
  });
}

async function signOut() {
  "use server";

  await clearSupabaseSession();
}

function getAccessErrorMessage(params: SearchParams) {
  if (params.error === "not-signed-in") {
    return `Please sign in first to access ${params.next ?? "that page"}.`;
  }

  if (params.error === "not-allowed") {
    if (params.email) {
      return `${params.email} is signed in but is not listed in ADMIN_EMAILS.`;
    }

    return "Your current account is not listed in ADMIN_EMAILS.";
  }

  return null;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await getSessionUser();
  const params = await searchParams;
  const accessError = getAccessErrorMessage(params);

  const isAdmin = user?.email
    ? env.ADMIN_EMAILS.map((email) => email.toLowerCase()).includes(user.email.toLowerCase())
    : false;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold">Admin</h1>

      {accessError && (
        <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{accessError}</p>
      )}

      {!user && (
        <>
          <p className="mt-2 text-slate-600">
            Sign in with a Supabase magic link using an approved admin email.
          </p>
          <form action={sendMagicLink} className="mt-6 flex max-w-md flex-col gap-3">
            <label className="text-sm font-medium text-slate-700" htmlFor="email">
              Admin email
            </label>
            <input
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              id="email"
              name="email"
              placeholder="admin@example.com"
              required
              type="email"
            />
            <button
              className="w-fit rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
              type="submit"
            >
              Send magic link
            </button>
          </form>
          <p className="mt-3 text-xs text-slate-500">
            If your email is allowed, check your inbox for the sign-in link.
          </p>
        </>
      )}

      {user && !isAdmin && (
        <>
          <p className="mt-2 text-slate-600">
            Signed in as <span className="font-medium">{user.email}</span>, but this email is not in
            <code className="mx-1 rounded bg-slate-100 px-1 py-0.5">ADMIN_EMAILS</code>.
          </p>
          <form action={signOut} className="mt-6">
            <button
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              type="submit"
            >
              Sign out
            </button>
          </form>
        </>
      )}

      {user && isAdmin && (
        <>
          <p className="mt-2 text-slate-600">
            Signed in as <span className="font-medium">{user.email}</span>.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
              href="/admin/items"
            >
              Manage items
            </Link>
            <Link
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
              href="/admin/reservations"
            >
              Manage reservations
            </Link>
            <form action={signOut}>
              <button
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                type="submit"
              >
                Sign out
              </button>
            </form>
          </div>
        </>
      )}
    </section>
  );
}

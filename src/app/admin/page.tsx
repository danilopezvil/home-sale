import Link from "next/link";
import { Package, CalendarCheck, LogOut, LogIn } from "lucide-react";

import { env } from "@/lib/env";
import { getSessionUser } from "@/lib/supabase/server";
import { signOutAction } from "./actions";
import { LoginForm } from "./login-form";

type SearchParams = { error?: string; next?: string; email?: string };

function getAccessErrorMessage(params: SearchParams) {
  if (params.error === "not-signed-in") {
    return `Sign in first to access ${params.next ?? "that page"}.`;
  }
  if (params.error === "not-allowed") {
    if (params.email) return `${params.email} is not listed in ADMIN_EMAILS.`;
    return "Your account is not listed in ADMIN_EMAILS.";
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
    ? env.ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(user.email.toLowerCase())
    : false;

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-stone-900">Admin ⚙️</h1>
        <p className="mt-1 text-sm text-stone-500">Manage your sale from here.</p>
      </header>

      {accessError && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {accessError}
        </p>
      )}

      {/* Not signed in */}
      {!user && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-stone-700">
            <LogIn size={18} className="text-orange-400" />
            <p className="font-medium">Sign in to continue</p>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Enter your admin email to receive a magic link.
          </p>
          <LoginForm />
        </div>
      )}

      {/* Signed in but not admin */}
      {user && !isAdmin && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-stone-600">
            Signed in as <span className="font-semibold">{user.email}</span> — but this email
            isn&apos;t in <code className="rounded bg-stone-100 px-1.5 py-0.5 text-xs">ADMIN_EMAILS</code>.
          </p>
          <form action={signOutAction} className="mt-4">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </form>
        </div>
      )}

      {/* Signed in as admin */}
      {user && isAdmin && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-stone-500">
            Signed in as <span className="font-semibold text-stone-800">{user.email}</span>
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link
              href="/admin/items"
              className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4 transition hover:border-orange-200 hover:bg-orange-50"
            >
              <Package size={22} className="text-orange-400" />
              <div>
                <p className="font-semibold text-stone-900">Items</p>
                <p className="text-xs text-stone-500">Create, edit & manage listings</p>
              </div>
            </Link>

            <Link
              href="/admin/reservations"
              className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4 transition hover:border-orange-200 hover:bg-orange-50"
            >
              <CalendarCheck size={22} className="text-orange-400" />
              <div>
                <p className="font-semibold text-stone-900">Reservations</p>
                <p className="text-xs text-stone-500">Confirm, cancel & mark sold</p>
              </div>
            </Link>
          </div>

          <form action={signOutAction} className="mt-4">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </form>
        </div>
      )}
    </section>
  );
}

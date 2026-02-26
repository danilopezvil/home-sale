"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Mail, Wand2, CheckCircle2 } from "lucide-react";

import type { Dictionary } from "@/lib/i18n";
import { sendMagicLinkAction, type LoginFormState } from "./actions";

const initialState: LoginFormState = { status: "idle", message: "" };

function SubmitButton({ submit, submitting }: { submit: string; submitting: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 active:scale-95 disabled:opacity-60"
    >
      <Wand2 size={15} />
      {pending ? submitting : submit}
    </button>
  );
}

export function LoginForm({ t }: { t: Dictionary["loginForm"] }) {
  const [state, action] = useActionState(sendMagicLinkAction, initialState);

  if (state.status === "sent") {
    return (
      <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
        <div>
          <p className="text-sm font-semibold text-emerald-800">{t.success.heading}</p>
          <p className="mt-0.5 text-sm text-emerald-600">{state.message}</p>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="mt-5 flex max-w-sm flex-col gap-3">
      {state.status === "error" && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {state.message}
        </p>
      )}

      <label className="text-sm font-medium text-stone-700" htmlFor="admin-email">
        {t.label}
      </label>
      <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 focus-within:ring-2 focus-within:ring-orange-300">
        <Mail size={15} className="shrink-0 text-stone-400" />
        <input
          className="w-full bg-transparent py-2.5 text-sm focus:outline-none"
          id="admin-email"
          name="email"
          type="email"
          placeholder={t.placeholder}
          required
          autoComplete="email"
        />
      </div>
      <SubmitButton submit={t.submit} submitting={t.submitting} />
      <p className="text-xs text-stone-400">{t.help}</p>
    </form>
  );
}

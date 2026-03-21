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
    <button type="submit" disabled={pending} className="btn-primary h-11 w-full justify-center">
      <Wand2 size={15} />
      {pending ? submitting : submit}
    </button>
  );
}

export function LoginForm({ t }: { t: Dictionary["loginForm"] }) {
  const [state, action] = useActionState(sendMagicLinkAction, initialState);

  if (state.status === "sent") {
    return (
      <div className="notice-success mt-5 flex items-start gap-3">
        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
        <div>
          <p className="text-sm font-semibold">{t.success.heading}</p>
          <p className="mt-0.5 text-sm">{state.message}</p>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="mt-5 space-y-4">
      {state.status === "error" && <p className="notice-danger">{state.message}</p>}

      <div className="field-shell">
        <label className="field-label" htmlFor="admin-email">
          <Mail size={14} className="text-stone-400" />
          {t.label}
        </label>
        <input
          className="input-base h-11"
          id="admin-email"
          name="email"
          type="email"
          placeholder={t.placeholder}
          required
          autoComplete="email"
        />
      </div>

      <SubmitButton submit={t.submit} submitting={t.submitting} />

      <div className="rounded-2xl border border-stone-200 bg-[hsl(var(--surface-muted))] px-4 py-3 text-xs text-stone-600">
        {t.help}
      </div>
    </form>
  );
}

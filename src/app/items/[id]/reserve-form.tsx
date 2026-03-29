"use client";

import { useActionState } from "react";
import { User, Mail, Phone, MessageSquare, Calendar, CheckCircle2, Send } from "lucide-react";

import type { Dictionary } from "@/lib/i18n";
import { createReservationAction, type ReserveFormState } from "./actions";

const initialState: ReserveFormState = { status: "idle", message: "" };

function inputClass(hasError: boolean) {
  return `w-full rounded-lg border px-4 py-3 text-sm outline-none transition ${
    hasError
      ? "border-red-300 bg-red-50 focus:border-red-400"
      : "border-slate-200 bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
  }`;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs font-medium text-red-600">{message}</p>;
}

function FieldLabel({
  htmlFor,
  icon,
  children,
  optional,
  optionalText,
}: {
  htmlFor: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  optional?: boolean;
  optionalText?: string;
}) {
  return (
    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500" htmlFor={htmlFor}>
      <span className="text-slate-400">{icon}</span>
      <span>{children}</span>
      {optional ? <span className="text-slate-400">({optionalText})</span> : <span className="text-red-400">*</span>}
    </label>
  );
}

export function ReserveForm({ itemId, t }: { itemId: string; t: Dictionary["reserveForm"] }) {
  const [state, action, isPending] = useActionState(createReservationAction, initialState);

  if (state.status === "success") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center text-emerald-800">
        <CheckCircle2 size={34} className="mx-auto text-emerald-500" />
        <p className="mt-3 text-base font-semibold">{t.success.heading}</p>
        <p className="mt-1 text-sm">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="itemId" value={itemId} />

      <div className="hidden" aria-hidden="true">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === "error" ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="res-name" icon={<User size={12} />}>
            {t.name.label}
          </FieldLabel>
          <input
            className={inputClass(!!state.errors?.name)}
            id="res-name"
            name="name"
            type="text"
            placeholder={t.name.placeholder}
            required
            autoComplete="name"
            maxLength={100}
          />
          <FieldError message={state.errors?.name?.[0]} />
        </div>

        <div>
          <FieldLabel htmlFor="res-email" icon={<Mail size={12} />}>
            {t.email.label}
          </FieldLabel>
          <input
            className={inputClass(!!state.errors?.email)}
            id="res-email"
            name="email"
            type="email"
            placeholder={t.email.placeholder}
            required
            autoComplete="email"
            maxLength={200}
          />
          <p className="mt-1 text-xs text-slate-500">{t.email.hint}</p>
          <FieldError message={state.errors?.email?.[0]} />
        </div>

        <div>
          <FieldLabel htmlFor="res-phone" icon={<Phone size={12} />} optional optionalText={t.optional}>
            {t.phone.label}
          </FieldLabel>
          <input
            className={inputClass(!!state.errors?.phone)}
            id="res-phone"
            name="phone"
            type="tel"
            placeholder={t.phone.placeholder}
            autoComplete="tel"
            maxLength={50}
          />
          <FieldError message={state.errors?.phone?.[0]} />
        </div>

        <div>
          <FieldLabel htmlFor="res-pickup" icon={<Calendar size={12} />} optional optionalText={t.optional}>
            {t.pickup.label}
          </FieldLabel>
          <input
            className={inputClass(!!state.errors?.preferredPickupAt)}
            id="res-pickup"
            name="preferredPickupAt"
            type="datetime-local"
          />
          <p className="mt-1 text-xs text-slate-500">{t.pickup.hint}</p>
          <FieldError message={state.errors?.preferredPickupAt?.[0]} />
        </div>
      </div>

      <div>
        <FieldLabel htmlFor="res-message" icon={<MessageSquare size={12} />} optional optionalText={t.optional}>
          {t.message.label}
        </FieldLabel>
        <textarea
          className={`${inputClass(!!state.errors?.message)} min-h-24 resize-y`}
          id="res-message"
          name="message"
          rows={4}
          maxLength={1000}
          placeholder={t.message.placeholder}
        />
        <p className="mt-1 text-xs text-slate-500">{t.message.hint}</p>
        <FieldError message={state.errors?.message?.[0]} />
      </div>

      <p className="text-xs italic text-slate-500">
        {t.required.split("*")[0]}
        <span className="text-red-500">*</span>
        {t.required.split("*")[1]}
      </p>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-sky-700 to-sky-500 text-sm font-bold text-white shadow-lg shadow-sky-700/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"
      >
        <Send size={14} />
        {isPending ? t.submitting : t.submit}
      </button>
    </form>
  );
}

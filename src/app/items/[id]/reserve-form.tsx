"use client";

import { useActionState } from "react";
import {
  User,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  CheckCircle2,
  Send,
} from "lucide-react";

import type { Dictionary } from "@/lib/i18n";
import { createReservationAction, type ReserveFormState } from "./actions";

const initialState: ReserveFormState = { status: "idle", message: "" };

function inputClass(hasError: boolean) {
  return (
    "w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 " +
    (hasError ? "border-red-300 bg-red-50" : "border-stone-200 bg-white")
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
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
    <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-stone-700" htmlFor={htmlFor}>
      <span className="text-stone-400">{icon}</span>
      {children}
      {optional && (
        <span className="ml-1 text-xs font-normal text-stone-400">{optionalText}</span>
      )}
      {!optional && <span className="text-red-400">*</span>}
    </label>
  );
}

export function ReserveForm({ itemId, t }: { itemId: string; t: Dictionary["reserveForm"] }) {
  const [state, action, isPending] = useActionState(createReservationAction, initialState);

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 size={36} className="text-emerald-500" />
        <p className="mt-3 text-base font-semibold text-emerald-800">{t.success.heading}</p>
        <p className="mt-1 text-sm text-emerald-600">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="itemId" value={itemId} />

      {/* Honeypot */}
      <div className="hidden" aria-hidden="true">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === "error" && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {state.message}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Name */}
        <div>
          <FieldLabel htmlFor="res-name" icon={<User size={14} />}>
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

        {/* Email */}
        <div>
          <FieldLabel htmlFor="res-email" icon={<Mail size={14} />}>
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
          <p className="mt-1 text-xs text-stone-400">{t.email.hint}</p>
          <FieldError message={state.errors?.email?.[0]} />
        </div>

        {/* Phone */}
        <div>
          <FieldLabel htmlFor="res-phone" icon={<Phone size={14} />} optional optionalText={t.optional}>
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

        {/* Preferred pickup */}
        <div>
          <FieldLabel htmlFor="res-pickup" icon={<Calendar size={14} />} optional optionalText={t.optional}>
            {t.pickup.label}
          </FieldLabel>
          <input
            className={inputClass(!!state.errors?.preferredPickupAt)}
            id="res-pickup"
            name="preferredPickupAt"
            type="datetime-local"
          />
          <p className="mt-1 text-xs text-stone-400">{t.pickup.hint}</p>
          <FieldError message={state.errors?.preferredPickupAt?.[0]} />
        </div>
      </div>

      {/* Message */}
      <div>
        <FieldLabel htmlFor="res-message" icon={<MessageSquare size={14} />} optional optionalText={t.optional}>
          {t.message.label}
        </FieldLabel>
        <textarea
          className={inputClass(!!state.errors?.message)}
          id="res-message"
          name="message"
          rows={3}
          maxLength={1000}
          placeholder={t.message.placeholder}
        />
        <p className="mt-1 text-xs text-stone-400">{t.message.hint}</p>
        <FieldError message={state.errors?.message?.[0]} />
      </div>

      <p className="text-xs text-stone-400">
        {t.required.split("*")[0]}
        <span className="text-red-400">*</span>
        {t.required.split("*")[1]}
      </p>

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 active:scale-95 disabled:opacity-60"
      >
        <Send size={15} />
        {isPending ? t.submitting : t.submit}
      </button>
    </form>
  );
}

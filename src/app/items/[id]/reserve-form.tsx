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
  return `${hasError ? "border-red-300 bg-red-50" : ""} input-base`;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="field-error">{message}</p>;
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
    <label className="field-label" htmlFor={htmlFor}>
      <span className="text-stone-400">{icon}</span>
      {children}
      {optional && <span className="field-note ml-1">{optionalText}</span>}
      {!optional && <span className="text-red-400">*</span>}
    </label>
  );
}

export function ReserveForm({ itemId, t }: { itemId: string; t: Dictionary["reserveForm"] }) {
  const [state, action, isPending] = useActionState(createReservationAction, initialState);

  if (state.status === "success") {
    return (
      <div className="notice-success flex flex-col items-center p-8 text-center">
        <CheckCircle2 size={36} className="text-emerald-500" />
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

      {state.status === "error" && <p className="notice-danger">{state.message}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="field-shell">
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

        <div className="field-shell">
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
          <p className="field-note">{t.email.hint}</p>
          <FieldError message={state.errors?.email?.[0]} />
        </div>

        <div className="field-shell">
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

        <div className="field-shell">
          <FieldLabel htmlFor="res-pickup" icon={<Calendar size={14} />} optional optionalText={t.optional}>
            {t.pickup.label}
          </FieldLabel>
          <input
            className={inputClass(!!state.errors?.preferredPickupAt)}
            id="res-pickup"
            name="preferredPickupAt"
            type="datetime-local"
          />
          <p className="field-note">{t.pickup.hint}</p>
          <FieldError message={state.errors?.preferredPickupAt?.[0]} />
        </div>
      </div>

      <div className="field-shell">
        <FieldLabel htmlFor="res-message" icon={<MessageSquare size={14} />} optional optionalText={t.optional}>
          {t.message.label}
        </FieldLabel>
        <textarea
          className={`${inputClass(!!state.errors?.message)} textarea-base min-h-28 resize-y`}
          id="res-message"
          name="message"
          rows={4}
          maxLength={1000}
          placeholder={t.message.placeholder}
        />
        <p className="field-note">{t.message.hint}</p>
        <FieldError message={state.errors?.message?.[0]} />
      </div>

      <p className="field-note">
        {t.required.split("*")[0]}
        <span className="text-red-400">*</span>
        {t.required.split("*")[1]}
      </p>

      <button type="submit" disabled={isPending} className="btn-primary w-full">
        <Send size={15} />
        {isPending ? t.submitting : t.submit}
      </button>
    </form>
  );
}

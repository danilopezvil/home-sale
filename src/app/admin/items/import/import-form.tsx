"use client";

import { useActionState } from "react";
import { FileJson } from "lucide-react";

import type { Dictionary } from "@/lib/i18n";
import { importItemsAction, type ImportState } from "./actions";

const initialState: ImportState = { status: "idle", message: "" };

export function ImportForm({ t }: { t: Dictionary["importItems"] }) {
  const [state, action, isPending] = useActionState(importItemsAction, initialState);

  return (
    <form action={action} className="space-y-5">
      <div className="border-b border-stone-200 pb-4">
        <p className="eyebrow">JSON input</p>
        <p className="mt-2 text-sm text-stone-500">Paste one item or a compact batch. Keep the payload clean and operational.</p>
      </div>

      <div className="field-shell">
        <label htmlFor="import-json" className="field-label">
          <FileJson size={14} className="text-stone-400" />
          {t.jsonLabel}
        </label>
        <textarea
          id="import-json"
          name="json"
          rows={14}
          placeholder={t.jsonPlaceholder}
          className="textarea-base min-h-[320px] font-mono text-xs leading-relaxed"
          required
        />
      </div>

      {state.status !== "idle" && (
        <div className={state.status === "success" ? "notice-success" : state.status === "partial" ? "notice-warning" : "notice-danger"}>
          {state.message}
        </div>
      )}

      {state.results && state.results.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-[hsl(var(--surface-muted))] p-4">
          <h3 className="text-sm font-semibold text-stone-900">{t.results.title}</h3>
          <ul className="mt-3 space-y-2">
            {state.results.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className={`mt-0.5 shrink-0 font-bold ${r.success ? "text-emerald-600" : "text-red-500"}`}>
                  {r.success ? t.results.success : t.results.error}
                </span>
                <span className={r.success ? "text-stone-700" : "text-stone-500"}>
                  {r.title}
                  {r.error && <span className="ml-2 text-xs text-red-400">({r.error})</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button type="submit" disabled={isPending} className="btn-primary h-11 w-full sm:w-auto">
        <FileJson size={15} />
        {isPending ? t.importing : t.submit}
      </button>
    </form>
  );
}

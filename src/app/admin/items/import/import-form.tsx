"use client";

import { useActionState } from "react";
import { FileJson } from "lucide-react";

import type { Dictionary } from "@/lib/i18n";
import { importItemsAction, type ImportState } from "./actions";

const initialState: ImportState = { status: "idle", message: "" };

export function ImportForm({ t }: { t: Dictionary["importItems"] }) {
  const [state, action, isPending] = useActionState(
    importItemsAction,
    initialState,
  );

  return (
    <form action={action} className="space-y-5">
      <div>
        <label
          htmlFor="import-json"
          className="block text-sm font-medium text-stone-700"
        >
          {t.jsonLabel}
        </label>
        <textarea
          id="import-json"
          name="json"
          rows={12}
          placeholder={t.jsonPlaceholder}
          className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-orange-300"
          required
        />
      </div>

      {state.status !== "idle" && (
        <div
          className={`rounded-xl border p-3 text-sm ${
            state.status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : state.status === "partial"
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-red-200 bg-red-50 text-red-600"
          }`}
        >
          {state.message}
        </div>
      )}

      {state.results && state.results.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-stone-700">
            {t.results.title}
          </h3>
          <ul className="mt-2 space-y-1.5">
            {state.results.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span
                  className={`shrink-0 font-bold ${r.success ? "text-emerald-600" : "text-red-500"}`}
                >
                  {r.success ? t.results.success : t.results.error}
                </span>
                <span className={r.success ? "text-stone-700" : "text-stone-500"}>
                  {r.title}
                  {r.error && (
                    <span className="ml-2 text-xs text-red-400">
                      ({r.error})
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 active:scale-95 disabled:opacity-60"
      >
        <FileJson size={15} />
        {isPending ? t.importing : t.submit}
      </button>
    </form>
  );
}

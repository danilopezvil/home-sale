"use client";

import { useEffect, useState } from "react";
import { Pencil, X } from "lucide-react";

import { ItemForm } from "@/app/admin/items/item-form";
import type { Dictionary } from "@/lib/i18n";

type EditValues = {
  id: string;
  title: string;
  description: string;
  price: string;
  category: string;
  condition: string;
  pickup_area: string;
};

type Props = {
  initialValues: EditValues;
  t: Dictionary["itemForm"];
  categories: Dictionary["categories"];
};

export function EditItemModal({ initialValues, t, categories }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
      >
        <Pencil size={11} /> {t.edit}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Cerrar modal"
            className="absolute inset-0 bg-slate-950/45"
            onClick={() => setOpen(false)}
          />

          <div className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl md:p-6">
            <div className="mb-3 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50"
              >
                <X size={15} />
              </button>
            </div>

            <ItemForm mode="edit" initialValues={initialValues} t={t} categories={categories} />
          </div>
        </div>
      ) : null}
    </>
  );
}

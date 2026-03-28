"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, CircleCheckBig, RotateCcw, Image as ImageIcon } from "lucide-react";

import { toggleItemStatusAction, deleteItemsAction } from "@/app/admin/items/actions";
import { getCategoryMeta } from "@/lib/category-meta";
import type { Dictionary } from "@/lib/i18n";

type Item = {
  id: string;
  title: string;
  price: number | string;
  category: string;
  condition: string;
  pickup_area: string;
  status: "available" | "reserved" | "sold";
};

function statusBadgeClasses(status: Item["status"]) {
  if (status === "available") return "badge badge-success";
  if (status === "reserved") return "badge badge-warning";
  return "badge badge-danger";
}

function getStatusLabel(t: Dictionary["adminItems"]["status"], status: string): string {
  return (t as Record<string, string>)[status] ?? status;
}

function getCatLabel(categories: Dictionary["categories"], key: string | null | undefined): string {
  if (!key) return categories.other;
  return (categories as Record<string, string>)[key] ?? key;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

type Props = {
  items: Item[];
  selectedStatus: string;
  searchTerm: string;
  t: Dictionary["adminItems"];
  categories: Dictionary["categories"];
  conditionT: Dictionary["items"]["condition"];
};

export function ItemsTable({ items, selectedStatus, searchTerm, t, categories, conditionT }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  function toggleAll() {
    setSelectedIds(allSelected ? new Set() : new Set(items.map((i) => i.id)));
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleDelete() {
    if (!confirm(`Delete ${selectedIds.size} item(s)? This cannot be undone.`)) return;
    const fd = new FormData();
    for (const id of selectedIds) fd.append("itemIds", id);
    startTransition(async () => {
      await deleteItemsAction(fd);
    });
  }

  return (
    <div className="space-y-4">
      {selectedIds.size > 0 && (
        <div className="notice-danger flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Trash2 size={14} />
            <span className="text-sm font-medium">{selectedIds.size} selected</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleDelete} disabled={isPending} className="btn-danger px-3 py-2 text-xs">
              <Trash2 size={12} />
              {t.actions.deleteSelected}
            </button>
            <button onClick={() => setSelectedIds(new Set())} className="btn-secondary px-3 py-2 text-xs">
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="table-shell">
        <div className="table-wrap">
          <table className="min-w-full text-sm">
            <thead className="bg-[hsl(var(--surface-muted))] text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={toggleAll}
                    className="rounded border-slate-300 accent-sky-500"
                  />
                </th>
                <th className="px-4 py-3">Imagen</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">{t.table.item}</th>
                <th className="px-4 py-3">{t.table.price}</th>
                <th className="px-4 py-3">{t.table.category}</th>
                <th className="px-4 py-3">{t.table.status}</th>
                <th className="px-4 py-3">{t.table.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((item) => {
                const cat = getCategoryMeta(item.category);
                const condLabel = (conditionT as Record<string, string>)[item.condition] ?? item.condition;
                const isSelected = selectedIds.has(item.id);
                return (
                  <tr key={item.id} className={`${isSelected ? "bg-sky-50" : "bg-white"} transition hover:bg-slate-50`}>
                    <td className="px-4 py-5 align-top">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(item.id)}
                        className="rounded border-slate-300 accent-sky-500"
                      />
                    </td>
                    <td className="px-4 py-5 align-top">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500">
                        <ImageIcon size={14} />
                      </span>
                    </td>
                    <td className="px-4 py-5 align-top font-mono text-xs text-slate-500">SKU-{item.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-4 py-5 align-top">
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-500">{condLabel}</p>
                      </div>
                    </td>
                    <td className="px-4 py-5 align-top font-semibold text-slate-900">{currencyFormatter.format(Number(item.price))}</td>
                    <td className="px-4 py-5 text-slate-600 align-top">
                      <span className="inline-flex items-center gap-2">
                        <span>{cat.emoji}</span>
                        <span>{getCatLabel(categories, item.category)}</span>
                      </span>
                    </td>
                    <td className="px-4 py-5 align-top">
                      <span className={statusBadgeClasses(item.status)}>{getStatusLabel(t.status, item.status)}</span>
                    </td>
                    <td className="px-4 py-5 align-top">
                      <div className="flex min-w-[180px] flex-col gap-2">
                        <Link
                          href={`/admin/items?status=${selectedStatus}&search=${encodeURIComponent(searchTerm)}&edit=${item.id}`}
                          className="btn-secondary h-9 justify-start px-3 text-xs"
                        >
                          <Pencil size={11} /> {t.actions.edit}
                        </Link>
                        <form action={toggleItemStatusAction}>
                          <input type="hidden" name="itemId" value={item.id} />
                          <input type="hidden" name="currentStatus" value={item.status} />
                          <button type="submit" className="btn-secondary h-9 w-full justify-start px-3 text-xs">
                            {item.status === "sold" ? <RotateCcw size={11} /> : <CircleCheckBig size={11} />}
                            {item.status === "sold" ? t.actions.makeAvailable : t.actions.markSold}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

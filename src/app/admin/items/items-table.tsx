"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

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
  if (status === "available") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "reserved") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-stone-200 bg-stone-100 text-stone-600";
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
    <div>
      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <span className="text-sm font-medium text-red-700">{selectedIds.size} selected</span>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 size={12} />
            {t.actions.deleteSelected}
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-xs text-red-600 hover:underline"
          >
            Clear
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-stone-100 text-sm">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-stone-400">
              <th className="px-3 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                  className="rounded border-stone-300 accent-orange-500"
                />
              </th>
              <th className="px-3 py-3">{t.table.item}</th>
              <th className="px-3 py-3">{t.table.price}</th>
              <th className="px-3 py-3">{t.table.category}</th>
              <th className="px-3 py-3">{t.table.condition}</th>
              <th className="px-3 py-3">{t.table.pickupArea}</th>
              <th className="px-3 py-3">{t.table.status}</th>
              <th className="px-3 py-3">{t.table.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {items.map((item) => {
              const cat = getCategoryMeta(item.category);
              const condLabel = (conditionT as Record<string, string>)[item.condition] ?? item.condition;
              const isSelected = selectedIds.has(item.id);
              return (
                <tr key={item.id} className={`hover:bg-stone-50 ${isSelected ? "bg-red-50" : ""}`}>
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOne(item.id)}
                      className="rounded border-stone-300 accent-orange-500"
                    />
                  </td>
                  <td className="px-3 py-3 font-medium text-stone-900">{item.title}</td>
                  <td className="px-3 py-3 font-semibold text-stone-800">
                    {currencyFormatter.format(Number(item.price))}
                  </td>
                  <td className="px-3 py-3 text-stone-600">
                    {cat.emoji} {getCatLabel(categories, item.category)}
                  </td>
                  <td className="px-3 py-3 text-stone-600">{condLabel}</td>
                  <td className="px-3 py-3 text-stone-600">{item.pickup_area || "—"}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadgeClasses(item.status)}`}
                    >
                      {getStatusLabel(t.status, item.status)}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/items?status=${selectedStatus}&search=${encodeURIComponent(searchTerm)}&edit=${item.id}`}
                        className="flex items-center gap-1 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:border-orange-200 hover:text-orange-600"
                      >
                        <Pencil size={11} /> {t.actions.edit}
                      </Link>
                      <form action={toggleItemStatusAction}>
                        <input type="hidden" name="itemId" value={item.id} />
                        <input type="hidden" name="currentStatus" value={item.status} />
                        <button
                          type="submit"
                          className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100"
                        >
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
  );
}

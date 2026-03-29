"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Trash2, CheckCircle2 } from "lucide-react";

import { clearCart, readCartItemIds, removeItemFromCart, writeCartItemIds } from "@/lib/cart";
import { supabasePublicClient } from "@/lib/supabase/public";
import { createCartReservationsAction, type CartReservationFormState } from "./actions";

type CartItem = {
  id: string;
  title: string;
  price: number | string;
  status: string;
};

const initialState: CartReservationFormState = { status: "idle", message: "" };

export function CartClient() {
  const [itemIds, setItemIds] = useState<string[]>([]);
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [state, action, isPending] = useActionState(createCartReservationsAction, initialState);

  useEffect(() => {
    const ids = readCartItemIds();
    setItemIds(ids);

    if (ids.length === 0) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      const { data, error } = await supabasePublicClient
        .from("items")
        .select("id, title, price, status")
        .in("id", ids);

      if (error) {
        console.error("Could not load cart items", error);
        setItems([]);
      } else {
        setItems((data ?? []) as CartItem[]);
      }
      setIsLoading(false);
    };

    void load();
  }, []);

  useEffect(() => {
    if (state.status !== "success") return;

    const reserved = new Set(state.reservedItemIds ?? []);
    if (reserved.size === 0) return;

    const nextIds = itemIds.filter((id) => !reserved.has(id));
    setItemIds(nextIds);
    setItems((prev) => prev.filter((item) => !reserved.has(item.id)));

    if (nextIds.length === 0) clearCart();
    else writeCartItemIds(nextIds);
  }, [state.status, state.reservedItemIds, itemIds]);

  const total = useMemo(() => items.reduce((sum, item) => sum + Number(item.price || 0), 0), [items]);
  const availableItems = items.filter((item) => item.status === "available");

  const currency = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }),
    [],
  );

  if (isLoading) return <p className="text-sm text-slate-500">Loading cart…</p>;

  if (items.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <ShoppingCart className="mx-auto text-slate-400" />
        <p className="mt-3 text-lg font-semibold">Tu carrito está vacío</p>
        <p className="mt-1 text-sm text-slate-500">Agrega artículos y luego confirma tus datos en esta pantalla.</p>
        <Link href="/items" className="mt-5 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          Ver artículos
        </Link>
      </section>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h1 className="text-2xl font-bold">Resumen de artículos</h1>
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <div>
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="text-sm text-slate-500">{Number(item.price) === 0 ? "Gratis" : currency.format(Number(item.price))}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const nextIds = removeItemFromCart(item.id);
                  setItemIds(nextIds);
                  setItems((prev) => prev.filter((entry) => entry.id !== item.id));
                }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Quitar artículo"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-bold">Confirmar reserva</h2>
        <p className="mt-1 text-sm text-slate-500">Completa una sola vez tus datos y reservamos los artículos disponibles.</p>

        <p className="mt-4 text-sm font-semibold text-slate-800">Total estimado: {currency.format(total)}</p>

        {state.status !== "idle" ? (
          <p className={`mt-4 rounded-lg px-3 py-2 text-sm ${state.status === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
            {state.status === "success" ? <CheckCircle2 size={14} className="mr-1 inline" /> : null}
            {state.message}
          </p>
        ) : null}

        <form action={action} className="mt-4 space-y-3">
          <input type="hidden" name="itemIds" value={JSON.stringify(availableItems.map((item) => item.id))} />
          <input name="name" placeholder="Nombre completo" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" required />
          <input name="email" type="email" placeholder="tu@email.com" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" required />
          <input name="phone" placeholder="Teléfono (opcional)" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input name="preferredPickupAt" type="datetime-local" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <textarea name="message" placeholder="Notas para la recogida (opcional)" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" rows={3} />
          <button disabled={isPending || availableItems.length === 0} className="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {isPending ? "Enviando…" : `Reservar ${availableItems.length} artículo(s)`}
          </button>
        </form>
      </div>
    </section>
  );
}

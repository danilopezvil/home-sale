"use client";

import { useActionState, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock3, Info, ShieldCheck, ShoppingCart, Trash2, Truck } from "lucide-react";

import { clearCart, readCartItemIds, removeItemFromCart, writeCartItemIds } from "@/lib/cart";
import { supabasePublicClient } from "@/lib/supabase/public";
import { createCartReservationsAction, type CartReservationFormState } from "./actions";

type CartItem = {
  id: string;
  title: string;
  price: number | string;
  status: string;
  imageUrl?: string | null;
  category?: string | null;
};

type CartItemQueryRow = {
  id: string;
  title: string;
  price: number | string;
  status: string;
  category?: string | null;
  item_images?: { image_url: string; sort_order: number }[];
};

type PickupSlot = {
  id: string;
  label: string;
  time: string;
  value: string;
};

const initialState: CartReservationFormState = { status: "idle", message: "" };

export function CartClient() {
  const [itemIds, setItemIds] = useState<string[]>([]);
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState("today-18");
  const [state, action, isPending] = useActionState(createCartReservationsAction, initialState);

  const pickupSlots = useMemo<PickupSlot[]>(() => {
    const now = new Date();
    const today = new Date(now);
    today.setHours(18, 0, 0, 0);

    const tomorrowMorning = new Date(now);
    tomorrowMorning.setDate(now.getDate() + 1);
    tomorrowMorning.setHours(10, 0, 0, 0);

    const tomorrowAfternoon = new Date(now);
    tomorrowAfternoon.setDate(now.getDate() + 1);
    tomorrowAfternoon.setHours(14, 0, 0, 0);

    return [
      { id: "today-18", label: "Hoy", time: "18:00", value: today.toISOString().slice(0, 16) },
      { id: "tomorrow-10", label: "Mañana", time: "10:00", value: tomorrowMorning.toISOString().slice(0, 16) },
      { id: "tomorrow-14", label: "Mañana", time: "14:00", value: tomorrowAfternoon.toISOString().slice(0, 16) },
    ];
  }, []);

  const loadCartItems = useCallback(async (ids: string[]) => {
    setItemIds(ids);

    if (ids.length === 0) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabasePublicClient
      .from("items")
      .select("id, title, price, status, category, item_images(image_url, sort_order)")
      .in("id", ids);

    if (error) {
      console.error("Could not load cart items", error);
      clearCart();
      setItemIds([]);
      setItems([]);
      setIsLoading(false);
      return;
    }

    const itemMap = new Map(((data ?? []) as CartItemQueryRow[]).map((item) => [item.id, item]));
    const orderedItems = ids
      .map((id) => itemMap.get(id))
      .filter((item): item is NonNullable<typeof data>[number] => Boolean(item));

    const mappedItems = orderedItems.map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      status: item.status,
      imageUrl:
        item.item_images
          ?.slice()
          .sort((a, b) => a.sort_order - b.sort_order)[0]
          ?.image_url ?? null,
      category: item.category,
    }));

    setItems(mappedItems);

    const persistedIds = mappedItems.map((item) => item.id);
    if (persistedIds.length !== ids.length) {
      setItemIds(persistedIds);
      writeCartItemIds(persistedIds);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    const syncFromStorage = () => {
      void loadCartItems(readCartItemIds());
    };

    syncFromStorage();
    window.addEventListener("storage", syncFromStorage);
    window.addEventListener("cart:updated", syncFromStorage as EventListener);

    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener("cart:updated", syncFromStorage as EventListener);
    };
  }, [loadCartItems]);

  useEffect(() => {
    if (state.status !== "success") return;

    const reserved = new Set(state.reservedItemIds ?? []);
    if (reserved.size === 0) return;

    const nextIds = itemIds.filter((id) => !reserved.has(id));
    if (nextIds.length === itemIds.length) return;

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

  const activeSlot = pickupSlots.find((slot) => slot.id === selectedSlot) ?? pickupSlots[0];

  if (isLoading) return <p className="text-sm text-slate-500">Cargando carrito…</p>;

  if (items.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <ShoppingCart className="mx-auto text-slate-400" />
        <p className="mt-3 text-lg font-semibold">Tu carrito está vacío</p>
        <p className="mt-1 text-sm text-slate-500">Agrega artículos para continuar con la reserva.</p>
        <Link href="/items" className="mt-5 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          Ver artículos
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-2 pb-24 sm:px-4">
      <div className="flex items-center justify-between rounded bg-sky-100 px-4 py-3 text-sky-900">
        <div className="flex items-center gap-3 text-sm font-medium">
          <Clock3 size={16} />
          Inventario reservado para tu selección.
        </div>
        <span className="text-xs font-bold tracking-[0.15em] sm:text-sm">09:42 MINUTOS RESTANTES</span>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="space-y-12 lg:col-span-8">
          <section>
            <header className="mb-5">
              <span className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Tu selección</span>
              <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">Items Selected</h1>
            </header>
            <div className="space-y-3">
              {items.map((item) => (
                <article key={item.id} className="group flex items-center gap-4 border border-slate-200 bg-white p-4">
                  <div className="h-24 w-24 overflow-hidden bg-slate-100">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.15em] text-slate-500">No image</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xl font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">{item.category ?? "general"}</p>
                  </div>
                  <div className="hidden items-center gap-8 px-2 sm:flex">
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Qty</p>
                      <p className="font-medium">1</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Price</p>
                      <p className="font-bold text-sky-700">{Number(item.price) === 0 ? "Gratis" : currency.format(Number(item.price))}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextIds = removeItemFromCart(item.id);
                      void loadCartItems(nextIds);
                    }}
                    className="rounded p-2 text-slate-500 transition hover:bg-slate-100 hover:text-red-600"
                    aria-label="Quitar artículo"
                  >
                    <Trash2 size={16} />
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="border border-slate-200 bg-slate-50 p-6 sm:p-10">
            <header className="mb-8">
              <span className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Detalles de recogida</span>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">Pickup Information</h2>
            </header>

            <form action={action} className="space-y-8">
              <input type="hidden" name="itemIds" value={JSON.stringify(availableItems.map((item) => item.id))} />
              <input type="hidden" name="preferredPickupAt" value={activeSlot?.value} />

              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Nombre completo</label>
                  <input name="name" placeholder="Julianne Sterling" className="w-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-sky-200 focus:ring" required />
                </div>
                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Email</label>
                  <input name="email" type="email" placeholder="j.sterling@curated.com" className="w-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-sky-200 focus:ring" required />
                </div>
                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Teléfono</label>
                  <input name="phone" placeholder="+1 (555) 012-3456" className="w-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-sky-200 focus:ring" />
                </div>
              </div>

              <section>
                <header className="mb-5">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Horario</span>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight">Schedule Pickup</h3>
                </header>
                <div className="grid gap-3 md:grid-cols-3">
                  {pickupSlots.map((slot) => {
                    const selected = slot.id === selectedSlot;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlot(slot.id)}
                        className={`border p-5 text-left transition ${selected ? "border-sky-700 bg-sky-100" : "border-transparent bg-white hover:border-slate-300"}`}
                      >
                        <p className={`text-xs font-bold uppercase tracking-[0.15em] ${selected ? "text-sky-700" : "text-slate-500"}`}>{slot.label}</p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">{slot.time}</p>
                        <p className={`mt-4 text-[10px] font-bold uppercase tracking-[0.2em] ${selected ? "text-sky-700" : "text-slate-400"}`}>
                          {selected ? "Seleccionado" : "Seleccionar"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>

              <textarea name="message" placeholder="Notas para la recogida (opcional)" className="w-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-sky-200 focus:ring" rows={3} />

              {state.status !== "idle" ? (
                <p className={`rounded px-3 py-2 text-sm ${state.status === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                  {state.status === "success" ? <CheckCircle2 size={14} className="mr-1 inline" /> : null}
                  {state.message}
                </p>
              ) : null}

              <button
                disabled={isPending || availableItems.length === 0}
                className="w-full bg-gradient-to-r from-cyan-800 to-sky-500 px-4 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "Enviando…" : `Reservar ${availableItems.length} artículo(s)`}
              </button>
            </form>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:col-span-4">
          <div className="border border-slate-200 bg-white p-8 shadow-[0_20px_40px_rgba(17,28,45,0.06)]">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Order Summary</h3>
            <div className="mt-8 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium">{currency.format(total)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Concierge Shipping</span>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-700">Free</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Estimated Tax</span>
                <span className="font-medium">$0.00</span>
              </div>
            </div>
            <div className="mt-8 border-t border-slate-200 pt-6">
              <div className="flex items-end justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-700">Total a pagar</span>
                <span className="text-3xl font-black tracking-tight text-sky-700">{currency.format(total)}</span>
              </div>
            </div>
            <div className="mt-8 space-y-5 border-t border-slate-200 pt-6 text-xs text-slate-500">
              <div className="flex gap-3">
                <ShieldCheck size={18} className="mt-0.5 text-sky-700" />
                <div>
                  <p className="font-bold uppercase tracking-[0.18em] text-slate-900">Secure Transaction</p>
                  <p className="mt-1">Reservas encriptadas de extremo a extremo.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Truck size={18} className="mt-0.5 text-sky-700" />
                <div>
                  <p className="font-bold uppercase tracking-[0.18em] text-slate-900">White Glove Pickup</p>
                  <p className="mt-1">Listo en aproximadamente 2 horas en tu punto local.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 px-2 text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400">¿Necesitas ayuda?</p>
            <Link href="#" className="mt-1 block text-[11px] font-bold uppercase tracking-[0.2em] text-sky-700 hover:underline">
              Chatea con soporte
            </Link>
          </div>
        </aside>
      </div>

      <div className="fixed bottom-6 left-1/2 z-40 hidden -translate-x-1/2 items-center gap-8 rounded-full border border-white/60 bg-white/85 px-6 py-3 shadow-[0_20px_40px_rgba(17,28,45,0.08)] backdrop-blur md:flex">
        <div className="flex items-center gap-2">
          <Info size={16} className="text-sky-700" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Reservation Active</span>
        </div>
        <div className="h-4 w-px bg-slate-200" />
        <button type="button" className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 transition hover:text-sky-700">
          Cancel Reservation
        </button>
        <button type="button" className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 transition hover:text-sky-700">
          Email Quote
        </button>
      </div>
    </section>
  );
}

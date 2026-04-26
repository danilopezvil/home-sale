"use client";

import { Check, ShoppingCart } from "lucide-react";
import { useState } from "react";

import { addItemToCart } from "@/lib/cart";

type QuickAddToCartButtonProps = {
  itemId: string;
  disabled?: boolean;
};

export function QuickAddToCartButton({ itemId, disabled = false }: QuickAddToCartButtonProps) {
  const [isAdded, setIsAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        if (disabled) return;
        addItemToCart(itemId);
        setIsAdded(true);
      }}
      disabled={disabled}
      aria-label={isAdded ? "Agregado al carrito" : "Agregar al carrito"}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-300"
      title={isAdded ? "Agregado" : "Agregar al carrito"}
    >
      {isAdded ? <Check size={16} className="text-emerald-600" /> : <ShoppingCart size={16} />}
    </button>
  );
}

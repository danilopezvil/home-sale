"use client";

import Link from "next/link";
import { ShoppingCart, CheckCircle2 } from "lucide-react";
import { useState } from "react";

import { addItemToCart } from "@/lib/cart";

type AddToCartButtonProps = {
  itemId: string;
  cta: string;
  added: string;
  goToCart: string;
};

export function AddToCartButton({ itemId, cta, added, goToCart }: AddToCartButtonProps) {
  const [isAdded, setIsAdded] = useState(false);

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => {
          addItemToCart(itemId);
          setIsAdded(true);
        }}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
      >
        {isAdded ? <CheckCircle2 size={14} /> : <ShoppingCart size={14} />}
        {isAdded ? added : cta}
      </button>

      <Link href="/cart" className="inline-flex w-full items-center justify-center rounded-lg text-sm font-medium text-sky-700 hover:text-sky-900">
        {goToCart}
      </Link>
    </div>
  );
}

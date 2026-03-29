"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

import { readCartItemIds } from "@/lib/cart";

type CartLinkProps = {
  label: string;
};

export function CartLink({ label }: CartLinkProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(readCartItemIds().length);

    const onUpdate = () => setCount(readCartItemIds().length);
    window.addEventListener("storage", onUpdate);
    window.addEventListener("cart:updated", onUpdate as EventListener);

    return () => {
      window.removeEventListener("storage", onUpdate);
      window.removeEventListener("cart:updated", onUpdate as EventListener);
    };
  }, []);

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900"
    >
      <ShoppingCart size={15} />
      {label}
      {count > 0 ? (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-600 px-1.5 text-[10px] font-bold text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

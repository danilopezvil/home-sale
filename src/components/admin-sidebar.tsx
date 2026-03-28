"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Boxes, CalendarCheck2, Settings } from "lucide-react";

function navItemClass(active: boolean) {
  return active
    ? "flex items-center gap-2 rounded-lg border-l-4 border-sky-500 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm"
    : "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900";
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="surface section-pad h-fit xl:sticky xl:top-24">
      <p className="eyebrow">Admin</p>
      <h2 className="mt-2 text-lg font-bold text-slate-900">Workspace</h2>
      <nav className="mt-4 space-y-1">
        <Link href="/admin" className={navItemClass(pathname === "/admin")}>
          <LayoutDashboard size={16} /> Dashboard
        </Link>
        <Link href="/admin/items" className={navItemClass(pathname.startsWith("/admin/items"))}>
          <Boxes size={16} /> Gestión de Inventario
        </Link>
        <Link href="/admin/reservations" className={navItemClass(pathname.startsWith("/admin/reservations"))}>
          <CalendarCheck2 size={16} /> Reservas
        </Link>
        <Link href="/admin" className={navItemClass(false)}>
          <Settings size={16} /> Configuración
        </Link>
      </nav>
    </aside>
  );
}

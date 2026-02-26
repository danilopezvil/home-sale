"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/admin-auth";
import { supabaseServiceRoleClient } from "@/lib/supabase/server";

function revalidateAll() {
  revalidatePath("/admin/reservations");
  revalidatePath("/admin/items");
  revalidatePath("/items");
}

export async function confirmReservationAction(formData: FormData) {
  await requireAdminUser("/admin/reservations");

  const reservationId = formData.get("reservationId") as string;

  const { error } = await supabaseServiceRoleClient
    .from("reservations")
    .update({ status: "confirmed" })
    .eq("id", reservationId);

  if (error) {
    console.error("confirmReservation failed", error);
    redirect("/admin/reservations?error=Failed+to+confirm+reservation.");
  }

  // Item remains reserved — no item update needed.
  revalidateAll();
}

export async function cancelReservationAction(formData: FormData) {
  await requireAdminUser("/admin/reservations");

  const reservationId = formData.get("reservationId") as string;
  const itemId = formData.get("itemId") as string;

  const { error } = await supabaseServiceRoleClient
    .from("reservations")
    .update({ status: "cancelled" })
    .eq("id", reservationId);

  if (error) {
    console.error("cancelReservation failed", error);
    redirect("/admin/reservations?error=Failed+to+cancel+reservation.");
  }

  // Release the item so it can be reserved again.
  if (itemId) {
    await supabaseServiceRoleClient
      .from("items")
      .update({ status: "available" })
      .eq("id", itemId)
      .eq("status", "reserved");
  }

  revalidateAll();
}

export async function markSoldAction(formData: FormData) {
  await requireAdminUser("/admin/reservations");

  const itemId = formData.get("itemId") as string;

  const { error } = await supabaseServiceRoleClient
    .from("items")
    .update({ status: "sold" })
    .eq("id", itemId);

  if (error) {
    console.error("markSold failed", error);
    redirect("/admin/reservations?error=Failed+to+mark+item+as+sold.");
  }

  revalidateAll();
}

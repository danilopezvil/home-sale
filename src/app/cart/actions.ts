"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { sendReservationEmails } from "@/lib/resend";
import { supabaseServiceRoleClient } from "@/lib/supabase/server";

export type CartReservationFormState = {
  status: "idle" | "success" | "error";
  message: string;
  errors?: Record<string, string[]>;
  reservedItemIds?: string[];
};

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 3;

const cartReservationSchema = z.object({
  itemIds: z.array(z.string().uuid()).min(1, "Select at least one item."),
  name: z.string().trim().min(1, "Name is required.").max(100),
  email: z.string().trim().email("A valid email address is required.").max(200),
  phone: z.string().trim().max(50).optional(),
  message: z.string().trim().max(1000).optional(),
  preferredPickupAt: z
    .string()
    .trim()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Enter a valid date and time.",
    })
    .optional(),
});

function fromZodErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors = error.flatten().fieldErrors;
  return Object.fromEntries(
    Object.entries(fieldErrors).filter((entry): entry is [string, string[]] => Array.isArray(entry[1])),
  );
}

export async function createCartReservationsAction(
  _prev: CartReservationFormState,
  formData: FormData,
): Promise<CartReservationFormState> {
  let parsedIds: unknown[] = [];

  try {
    parsedIds = JSON.parse(String(formData.get("itemIds") ?? "[]"));
  } catch {
    parsedIds = [];
  }

  const parsed = cartReservationSchema.safeParse({
    itemIds: parsedIds,
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    message: formData.get("message") || undefined,
    preferredPickupAt: formData.get("preferredPickupAt") || undefined,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      errors: fromZodErrors(parsed.error),
    };
  }

  const { itemIds, name, email, phone, message, preferredPickupAt } = parsed.data;
  const normalizedEmail = email.toLowerCase();
  const reservedAt = preferredPickupAt || new Date().toISOString();

  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  const { count, error: countError } = await supabaseServiceRoleClient
    .from("reservations")
    .select("*", { count: "exact", head: true })
    .eq("customer_email", normalizedEmail)
    .gte("created_at", windowStart);

  if (countError) {
    console.error("Cart rate limit check failed.", countError);
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  if ((count ?? 0) >= RATE_LIMIT_MAX) {
    return {
      status: "error",
      message: "Too many reservation requests. Please try again later.",
    };
  }

  const reservedItemIds: string[] = [];
  const failedItemIds: string[] = [];

  for (const itemId of itemIds) {
    const { data: claimed, error: claimError } = await supabaseServiceRoleClient
      .from("items")
      .update({ status: "reserved" })
      .eq("id", itemId)
      .eq("status", "available")
      .select("id, title")
      .maybeSingle();

    if (claimError || !claimed) {
      failedItemIds.push(itemId);
      continue;
    }

    const { error: insertError } = await supabaseServiceRoleClient.from("reservations").insert({
      item_id: itemId,
      customer_name: name,
      customer_email: normalizedEmail,
      customer_phone: phone ?? null,
      message: message ?? null,
      status: "pending",
      reserved_at: reservedAt,
    });

    if (insertError) {
      console.error("Failed to insert cart reservation.", insertError);
      await supabaseServiceRoleClient.from("items").update({ status: "available" }).eq("id", itemId);
      failedItemIds.push(itemId);
      continue;
    }

    reservedItemIds.push(itemId);

    sendReservationEmails({
      itemTitle: claimed.title ?? "Unknown item",
      buyerName: name,
      buyerEmail: normalizedEmail,
      buyerPhone: phone ?? null,
      message: message ?? null,
      preferredPickupAt: preferredPickupAt ?? null,
    }).catch((err) => console.error("sendReservationEmails failed from cart flow.", err));
  }

  if (reservedItemIds.length === 0) {
    return {
      status: "error",
      message: "None of the selected items could be reserved. They may already be taken.",
    };
  }

  revalidatePath("/items");
  revalidatePath("/admin/items");
  reservedItemIds.forEach((itemId) => revalidatePath(`/items/${itemId}`));

  if (failedItemIds.length > 0) {
    return {
      status: "success",
      message: `Reserved ${reservedItemIds.length} item(s). ${failedItemIds.length} item(s) were already unavailable.`,
      reservedItemIds,
    };
  }

  return {
    status: "success",
    message: `Reserved ${reservedItemIds.length} item(s). We'll email you shortly with pickup details.`,
    reservedItemIds,
  };
}

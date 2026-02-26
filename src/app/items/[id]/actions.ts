"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { supabaseServiceRoleClient } from "@/lib/supabase/server";
import { sendReservationEmails } from "@/lib/resend";

export type ReserveFormState = {
  status: "idle" | "success" | "error";
  message: string;
  errors?: Record<string, string[]>;
};

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 3; // max submissions per email per window

const reservationSchema = z.object({
  itemId: z.string().uuid("Invalid item."),
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(100, "Name must be 100 characters or fewer."),
  email: z
    .string()
    .trim()
    .email("A valid email address is required.")
    .max(200),
  phone: z
    .string()
    .trim()
    .max(50, "Phone must be 50 characters or fewer.")
    .optional(),
  message: z
    .string()
    .trim()
    .max(1000, "Message must be 1,000 characters or fewer.")
    .optional(),
  preferredPickupAt: z
    .string()
    .trim()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Enter a valid date and time.",
    })
    .optional(),
  // Honeypot — must remain empty; bots typically fill every input
  website: z.string().max(0),
});

function fromZodErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors = error.flatten().fieldErrors;
  return Object.fromEntries(
    Object.entries(fieldErrors).filter(
      (entry): entry is [string, string[]] => Array.isArray(entry[1]),
    ),
  );
}

export async function createReservationAction(
  _prev: ReserveFormState,
  formData: FormData,
): Promise<ReserveFormState> {
  const parsed = reservationSchema.safeParse({
    itemId: formData.get("itemId"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    message: formData.get("message") || undefined,
    preferredPickupAt: formData.get("preferredPickupAt") || undefined,
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    // Honeypot triggered — silently appear to succeed so bots don't retry
    if (parsed.error.issues.some((i) => i.path[0] === "website")) {
      return { status: "success", message: "Your reservation has been submitted." };
    }

    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      errors: fromZodErrors(parsed.error),
    };
  }

  const { itemId, name, email, phone, message, preferredPickupAt } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  // Rate limit: max 3 reservations from the same email per hour
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

  const { count, error: countError } = await supabaseServiceRoleClient
    .from("reservations")
    .select("*", { count: "exact", head: true })
    .eq("customer_email", normalizedEmail)
    .gte("created_at", windowStart);

  if (countError) {
    console.error("Rate limit check failed.", {
      code: countError.code,
      message: countError.message,
      details: countError.details,
      hint: countError.hint,
    });
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  if ((count ?? 0) >= RATE_LIMIT_MAX) {
    return {
      status: "error",
      message: "Too many reservation requests. Please try again later.",
    };
  }

  // Atomically claim the item — only succeeds when status is still 'available'
  const { data: claimed, error: claimError } = await supabaseServiceRoleClient
    .from("items")
    .update({ status: "reserved" })
    .eq("id", itemId)
    .eq("status", "available")
    .select("id")
    .maybeSingle();

  if (claimError) {
    console.error("Failed to claim item.", claimError);
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  if (!claimed) {
    return {
      status: "error",
      message: "Sorry, this item is no longer available for reservation.",
    };
  }

  // Fetch item title for emails before inserting
  const { data: itemData } = await supabaseServiceRoleClient
    .from("items")
    .select("title")
    .eq("id", itemId)
    .single();

  // Persist the reservation record
  const { error: insertError } = await supabaseServiceRoleClient
    .from("reservations")
    .insert({
      item_id: itemId,
      customer_name: name,
      customer_email: normalizedEmail,
      customer_phone: phone ?? null,
      message: message ?? null,
      status: "pending",
      reserved_at: preferredPickupAt ?? null,
    });

  if (insertError) {
    console.error("Failed to insert reservation.", insertError);
    // Revert item status so it doesn't stay reserved with no record
    await supabaseServiceRoleClient
      .from("items")
      .update({ status: "available" })
      .eq("id", itemId);
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  // Send emails — fire-and-forget, never block the response
  sendReservationEmails({
    itemTitle: itemData?.title ?? "Unknown item",
    buyerName: name,
    buyerEmail: normalizedEmail,
    buyerPhone: phone ?? null,
    message: message ?? null,
    preferredPickupAt: preferredPickupAt ?? null,
  }).catch((err) => console.error("sendReservationEmails threw unexpectedly.", err));

  revalidatePath(`/items/${itemId}`);
  revalidatePath("/items");
  revalidatePath("/admin/items");

  return {
    status: "success",
    message: "We'll be in touch soon to confirm the pickup details.",
  };
}

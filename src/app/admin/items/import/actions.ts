"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminUser } from "@/lib/admin-auth";
import { categoryValues } from "@/lib/category-meta";
import { supabaseServiceRoleClient } from "@/lib/supabase/server";

const conditionValues = ["new", "like_new", "good", "fair", "parts"] as const;

const importItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  description: z.string().trim().optional(),
  price: z
    .number({ invalid_type_error: "Price must be a number." })
    .finite()
    .min(0, "Price must be 0 or greater."),
  category: z.enum(categoryValues, {
    errorMap: () => ({ message: "Invalid category." }),
  }),
  condition: z.enum(conditionValues, {
    errorMap: () => ({ message: "Invalid condition." }),
  }),
  pickup_area: z.string().trim().min(1, "Pickup area is required."),
});

export type ImportState = {
  status: "idle" | "success" | "partial" | "error";
  message: string;
  results?: Array<{ title: string; success: boolean; error?: string }>;
};

export async function importItemsAction(
  _: ImportState,
  formData: FormData,
): Promise<ImportState> {
  await requireAdminUser();

  const raw = formData.get("json");
  if (!raw || typeof raw !== "string" || !raw.trim()) {
    return { status: "error", message: "No JSON provided." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      status: "error",
      message: "Invalid JSON \u2014 please check your input.",
    };
  }

  const items: unknown[] = Array.isArray(parsed) ? parsed : [parsed];
  const results: NonNullable<ImportState["results"]> = [];

  for (const item of items) {
    const validation = importItemSchema.safeParse(item);
    if (!validation.success) {
      const firstError =
        validation.error.errors[0]?.message ?? "Validation failed.";
      const title =
        item && typeof item === "object" && "title" in item
          ? String((item as Record<string, unknown>).title)
          : "Unknown";
      results.push({ title, success: false, error: firstError });
      continue;
    }

    const { error } = await supabaseServiceRoleClient.from("items").insert({
      title: validation.data.title,
      description:
        validation.data.description?.trim() || null,
      price: validation.data.price,
      category: validation.data.category,
      condition: validation.data.condition,
      pickup_area: validation.data.pickup_area,
      status: "available",
    });

    if (error) {
      console.error("Failed to import item.", error);
      results.push({
        title: validation.data.title,
        success: false,
        error: "Database error.",
      });
    } else {
      results.push({ title: validation.data.title, success: true });
    }
  }

  revalidatePath("/admin/items");
  revalidatePath("/items");

  const successCount = results.filter((r) => r.success).length;
  const total = results.length;

  if (successCount === 0) {
    return {
      status: "error",
      message: "No items were imported.",
      results,
    };
  }
  if (successCount < total) {
    return {
      status: "partial",
      message: `${successCount} of ${total} items imported. ${total - successCount} failed.`,
      results,
    };
  }
  return {
    status: "success",
    message: `${successCount} item${successCount !== 1 ? "s" : ""} imported successfully.`,
    results,
  };
}

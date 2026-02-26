"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdminUser } from "@/lib/admin-auth";
import { categoryValues } from "@/lib/category-meta";
import { supabaseServiceRoleClient } from "@/lib/supabase/server";

const conditionValues = ["new", "like_new", "good", "fair", "parts"] as const;

const baseItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  description: z.string().trim().optional(),
  price: z
    .string()
    .trim()
    .min(1, "Price is required.")
    .transform((value) => Number(value))
    .pipe(z.number({ invalid_type_error: "Price must be a number." }).finite("Price must be a number.").min(0, "Price must be 0 or greater.")),
  category: z.enum(categoryValues, { errorMap: () => ({ message: "Category is required." }) }),
  condition: z.enum(conditionValues, { errorMap: () => ({ message: "Condition is required." }) }),
  pickup_area: z.string().trim().min(1, "Pickup area is required."),
});

const createItemSchema = baseItemSchema;
const updateItemSchema = baseItemSchema.extend({
  id: z.string().uuid("Invalid item ID."),
});

const uploadImagesSchema = z.object({
  itemId: z.string().uuid("Invalid item ID."),
});

export type ItemFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};


function fromZodErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors = error.flatten().fieldErrors;

  return Object.fromEntries(
    Object.entries(fieldErrors).filter((entry): entry is [string, string[]] => Array.isArray(entry[1])),
  );
}

function cleanOptional(value: string | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function createItemAction(_: ItemFormState, formData: FormData): Promise<ItemFormState> {
  await requireAdminUser();

  const parsed = createItemSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    category: formData.get("category"),
    condition: formData.get("condition"),
    pickup_area: formData.get("pickup_area"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the highlighted fields.",
      errors: fromZodErrors(parsed.error),
    };
  }

  const { error } = await supabaseServiceRoleClient.from("items").insert({
    title: parsed.data.title,
    description: cleanOptional(parsed.data.description),
    price: parsed.data.price,
    category: parsed.data.category,
    condition: parsed.data.condition,
    pickup_area: parsed.data.pickup_area,
    status: "available",
  });

  if (error) {
    console.error("Failed to create item.", error);

    return {
      success: false,
      message: "We couldn't create the item. Please try again.",
    };
  }

  revalidatePath("/admin/items");
  revalidatePath("/items");

  return {
    success: true,
    message: "Item created successfully.",
  };
}

export async function updateItemAction(_: ItemFormState, formData: FormData): Promise<ItemFormState> {
  await requireAdminUser();

  const parsed = updateItemSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    category: formData.get("category"),
    condition: formData.get("condition"),
    pickup_area: formData.get("pickup_area"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the highlighted fields.",
      errors: fromZodErrors(parsed.error),
    };
  }

  const { id, ...rest } = parsed.data;

  const { error } = await supabaseServiceRoleClient
    .from("items")
    .update({
      ...rest,
      description: cleanOptional(rest.description),
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to update item.", error);

    return {
      success: false,
      message: "We couldn't update the item. Please try again.",
    };
  }

  revalidatePath("/admin/items");
  revalidatePath(`/items/${id}`);
  revalidatePath("/items");

  return {
    success: true,
    message: "Item updated successfully.",
  };
}

export async function toggleItemStatusAction(formData: FormData) {
  await requireAdminUser();

  const itemId = z.string().uuid().safeParse(formData.get("itemId"));
  const currentStatus = z.enum(["available", "sold", "reserved"]).safeParse(formData.get("currentStatus"));

  if (!itemId.success || !currentStatus.success) {
    redirect("/admin/items?error=Invalid+status+request");
  }

  const nextStatus = currentStatus.data === "sold" ? "available" : "sold";

  const { error } = await supabaseServiceRoleClient
    .from("items")
    .update({ status: nextStatus })
    .eq("id", itemId.data);

  if (error) {
    console.error("Failed to toggle status.", error);
    redirect("/admin/items?error=Failed+to+update+status");
  }

  revalidatePath("/admin/items");
  revalidatePath("/items");
  revalidatePath(`/items/${itemId.data}`);

  redirect(`/admin/items?success=Item+marked+${nextStatus}`);
}

function normalizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function uploadItemImagesAction(_: ItemFormState, formData: FormData): Promise<ItemFormState> {
  await requireAdminUser();

  const parsed = uploadImagesSchema.safeParse({
    itemId: formData.get("itemId"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid item.",
      errors: fromZodErrors(parsed.error),
    };
  }

  const files = formData.getAll("images").filter((file): file is File => file instanceof File && file.size > 0);

  if (files.length === 0) {
    return {
      success: false,
      message: "Please select at least one image.",
      errors: {
        images: ["Please select at least one image."],
      },
    };
  }

  const invalidFile = files.find((file) => !file.type.startsWith("image/") || file.size > 10 * 1024 * 1024);
  if (invalidFile) {
    return {
      success: false,
      message: "Every file must be an image under 10MB.",
      errors: {
        images: ["Every file must be an image under 10MB."],
      },
    };
  }

  const itemId = parsed.data.itemId;
  const currentOrderQuery = await supabaseServiceRoleClient
    .from("item_images")
    .select("sort_order")
    .eq("item_id", itemId)
    .order("sort_order", { ascending: false })
    .limit(1);

  if (currentOrderQuery.error) {
    console.error("Failed to read existing image order.", currentOrderQuery.error);
    return {
      success: false,
      message: "We couldn't upload images right now.",
    };
  }

  let currentMaxOrder = currentOrderQuery.data?.[0]?.sort_order ?? -1;

  for (const file of files) {
    const filePath = `items/${itemId}/${Date.now()}-${crypto.randomUUID()}-${normalizeFilename(file.name)}`;
    const uploadResult = await supabaseServiceRoleClient.storage
      .from("item-images")
      .upload(filePath, file, {
        upsert: false,
        contentType: file.type,
      });

    if (uploadResult.error) {
      console.error("Failed to upload image.", uploadResult.error);
      return {
        success: false,
        message: "At least one image failed to upload. Please try again.",
      };
    }

    const { data } = supabaseServiceRoleClient.storage.from("item-images").getPublicUrl(filePath);

    currentMaxOrder += 1;

    const { error } = await supabaseServiceRoleClient.from("item_images").insert({
      item_id: itemId,
      image_url: data.publicUrl,
      sort_order: currentMaxOrder,
    });

    if (error) {
      console.error("Failed to create item_images row.", error);
      return {
        success: false,
        message: "Images uploaded but metadata save failed. Please check storage and retry.",
      };
    }
  }

  revalidatePath("/admin/items");
  revalidatePath(`/items/${itemId}`);

  return {
    success: true,
    message: "Images uploaded successfully.",
  };
}

export async function moveItemImageAction(formData: FormData) {
  await requireAdminUser();

  const parsed = z
    .object({
      itemId: z.string().uuid(),
      imageId: z.string().uuid(),
      direction: z.enum(["up", "down"]),
    })
    .safeParse({
      itemId: formData.get("itemId"),
      imageId: formData.get("imageId"),
      direction: formData.get("direction"),
    });

  if (!parsed.success) {
    redirect("/admin/items?error=Invalid+image+reorder+request");
  }

  const { itemId, imageId, direction } = parsed.data;

  const { data: images, error } = await supabaseServiceRoleClient
    .from("item_images")
    .select("id, sort_order")
    .eq("item_id", itemId)
    .order("sort_order", { ascending: true });

  if (error || !images) {
    console.error("Failed to fetch images for reordering.", error);
    redirect("/admin/items?error=Unable+to+reorder+image");
  }

  const index = images.findIndex((image) => image.id === imageId);
  if (index === -1) {
    redirect("/admin/items?error=Image+not+found");
  }

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= images.length) {
    redirect(`/admin/items?edit=${itemId}`);
  }

  const current = images[index];
  const target = images[targetIndex];

  const swapCurrent = await supabaseServiceRoleClient
    .from("item_images")
    .update({ sort_order: target.sort_order })
    .eq("id", current.id);

  const swapTarget = await supabaseServiceRoleClient
    .from("item_images")
    .update({ sort_order: current.sort_order })
    .eq("id", target.id);

  if (swapCurrent.error || swapTarget.error) {
    console.error("Failed to swap image order.", {
      swapCurrentError: swapCurrent.error,
      swapTargetError: swapTarget.error,
    });
    redirect("/admin/items?error=Unable+to+reorder+image");
  }

  revalidatePath("/admin/items");
  revalidatePath(`/items/${itemId}`);

  redirect(`/admin/items?edit=${itemId}&success=Image+order+updated`);
}

"use client";

import { useActionState } from "react";
import { Plus, Save, ImagePlus, MapPin, Tag, Sparkles, DollarSign, FileText } from "lucide-react";

import {
  createItemAction,
  type ItemFormState,
  updateItemAction,
  uploadItemImagesAction,
} from "@/app/admin/items/actions";
import { categoryValues, CATEGORY_META } from "@/lib/category-meta";

type ItemValues = {
  id?: string;
  title: string;
  description: string;
  price: string;
  category: (typeof categoryValues)[number] | "";
  condition: string;
  pickup_area: string;
};

type ItemFormProps = { mode: "create" | "edit"; initialValues: ItemValues };
type UploadImagesFormProps = { itemId: string };

const initialItemFormState: ItemFormState = { success: false, message: "" };

const conditions = [
  { value: "new",      label: "✨ New" },
  { value: "like_new", label: "⭐ Like New" },
  { value: "good",     label: "👍 Good" },
  { value: "fair",     label: "🟡 Fair" },
  { value: "parts",    label: "🔧 For Parts" },
];

const categories = categoryValues.map((v) => ({
  value: v,
  label: `${CATEGORY_META[v]?.emoji ?? "📦"} ${CATEGORY_META[v]?.label ?? v}`,
}));

function inputClass(hasError: boolean) {
  return (
    "mt-1 w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 " +
    (hasError ? "border-red-300 bg-red-50" : "border-stone-200 bg-white")
  );
}

function FieldLabel({
  htmlFor,
  icon,
  children,
  optional,
}: {
  htmlFor: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label className="flex items-center gap-1.5 text-sm font-medium text-stone-700" htmlFor={htmlFor}>
      {icon && <span className="text-stone-400">{icon}</span>}
      {children}
      {optional ? (
        <span className="ml-1 text-xs font-normal text-stone-400">(optional)</span>
      ) : (
        <span className="text-red-400">*</span>
      )}
    </label>
  );
}

function FieldError({ errors, name }: { errors: ItemFormState["errors"]; name: string }) {
  const value = errors?.[name]?.[0];
  if (!value) return null;
  return <p className="mt-1 text-xs text-red-500">{value}</p>;
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-stone-400">{children}</p>;
}

function FormMessage({ state }: { state: ItemFormState }) {
  if (!state.message) return null;
  return (
    <p className={`rounded-xl border p-3 text-sm ${
      state.success
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-red-200 bg-red-50 text-red-600"
    }`}>
      {state.message}
    </p>
  );
}

export function ItemForm({ mode, initialValues }: ItemFormProps) {
  const isEdit = mode === "edit";
  const action = isEdit ? updateItemAction : createItemAction;
  const [state, formAction, pending] = useActionState(action, initialItemFormState);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-stone-900">
          {isEdit ? <><Save size={18} className="text-orange-400" /> Edit Item</> : <><Plus size={18} className="text-orange-400" /> New Item</>}
        </h2>
        <p className="text-xs text-stone-400"><span className="text-red-400">*</span> Required</p>
      </div>

      <FormMessage state={state} />

      {isEdit ? <input type="hidden" name="id" value={initialValues.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Title */}
        <div>
          <FieldLabel htmlFor="item-title" icon={<FileText size={14} />}>Title</FieldLabel>
          <input
            id="item-title" name="title" type="text"
            defaultValue={initialValues.title}
            className={inputClass(!!state.errors?.title)}
            placeholder="e.g., IKEA KALLAX shelf unit"
            maxLength={200} required
          />
          <FieldError errors={state.errors} name="title" />
        </div>

        {/* Price */}
        <div>
          <FieldLabel htmlFor="item-price" icon={<DollarSign size={14} />}>Price</FieldLabel>
          <input
            id="item-price" name="price" type="number"
            min="0" step="0.01"
            defaultValue={initialValues.price}
            className={inputClass(!!state.errors?.price)}
            placeholder="0.00" required
          />
          <Hint>Amount in USD. Use 0 for free items.</Hint>
          <FieldError errors={state.errors} name="price" />
        </div>

        {/* Category */}
        <div>
          <FieldLabel htmlFor="item-category" icon={<Tag size={14} />}>Category</FieldLabel>
          <select
            id="item-category" name="category"
            defaultValue={initialValues.category}
            className={inputClass(!!state.errors?.category)} required
          >
            <option value="" disabled>Select a category</option>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <FieldError errors={state.errors} name="category" />
        </div>

        {/* Condition */}
        <div>
          <FieldLabel htmlFor="item-condition" icon={<Sparkles size={14} />}>Condition</FieldLabel>
          <select
            id="item-condition" name="condition"
            defaultValue={initialValues.condition}
            className={inputClass(!!state.errors?.condition)} required
          >
            {conditions.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <FieldError errors={state.errors} name="condition" />
        </div>

        {/* Pickup Area */}
        <div className="md:col-span-2">
          <FieldLabel htmlFor="item-pickup" icon={<MapPin size={14} />}>Pickup Area</FieldLabel>
          <input
            id="item-pickup" name="pickup_area" type="text"
            defaultValue={initialValues.pickup_area}
            className={inputClass(!!state.errors?.pickup_area)}
            placeholder="e.g., Downtown, North Side, ZIP 90210"
            maxLength={200} required
          />
          <Hint>Where buyers can pick this item up.</Hint>
          <FieldError errors={state.errors} name="pickup_area" />
        </div>
      </div>

      {/* Description */}
      <div>
        <FieldLabel htmlFor="item-description" icon={<FileText size={14} />} optional>Description</FieldLabel>
        <textarea
          id="item-description" name="description"
          defaultValue={initialValues.description}
          className={inputClass(!!state.errors?.description) + " min-h-28 resize-y"}
          placeholder="Dimensions, colour, any defects, reason for selling…"
          maxLength={2000}
        />
        <Hint>Up to 2,000 characters.</Hint>
        <FieldError errors={state.errors} name="description" />
      </div>

      <button
        type="submit" disabled={pending}
        className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 active:scale-95 disabled:opacity-60"
      >
        {isEdit ? <Save size={15} /> : <Plus size={15} />}
        {pending ? "Saving…" : isEdit ? "Save Changes" : "Create Item"}
      </button>
    </form>
  );
}

export function UploadImagesForm({ itemId }: UploadImagesFormProps) {
  const [state, formAction, pending] = useActionState(uploadItemImagesAction, initialItemFormState);

  return (
    <form action={formAction} className="space-y-3 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h3 className="flex items-center gap-2 text-lg font-bold text-stone-900">
        <ImagePlus size={18} className="text-orange-400" />
        Upload Images
      </h3>
      <FormMessage state={state} />
      <input type="hidden" name="itemId" value={itemId} />

      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-stone-700" htmlFor="item-images">
          <ImagePlus size={14} className="text-stone-400" />
          Images <span className="text-red-400">*</span>
        </label>
        <input
          id="item-images" type="file" name="images"
          accept="image/*" multiple
          className={
            "mt-1 block w-full rounded-xl border px-3 py-2 text-sm " +
            "file:mr-3 file:rounded-lg file:border-0 file:bg-orange-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-orange-600 hover:file:bg-orange-100 " +
            (state.errors?.images ? "border-red-300 bg-red-50" : "border-stone-200")
          }
        />
        <p className="mt-1 text-xs text-stone-400">
          JPG, PNG, WebP — max 10 MB each. Select multiple at once.
        </p>
        <FieldError errors={state.errors} name="images" />
      </div>

      <button
        type="submit" disabled={pending}
        className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 active:scale-95 disabled:opacity-60"
      >
        <ImagePlus size={15} />
        {pending ? "Uploading…" : "Upload Images"}
      </button>
    </form>
  );
}

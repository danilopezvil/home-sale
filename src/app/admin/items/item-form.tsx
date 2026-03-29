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
import type { Dictionary } from "@/lib/i18n";

type ItemValues = {
  id?: string;
  title: string;
  description: string;
  price: string;
  category: string;
  condition: string;
  pickup_area: string;
};

type ItemFormProps = {
  mode: "create" | "edit";
  initialValues: ItemValues;
  t: Dictionary["itemForm"];
  categories: Dictionary["categories"];
};
type UploadImagesFormProps = { itemId: string; t: Dictionary["uploadForm"] };

const initialItemFormState: ItemFormState = { success: false, message: "" };

function inputClass(hasError: boolean) {
  return `${hasError ? "border-red-300 bg-red-50" : ""} input-base h-11`;
}

function FieldLabel({
  htmlFor,
  icon,
  children,
  optional,
  optionalText,
}: {
  htmlFor: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  optional?: boolean;
  optionalText?: string;
}) {
  return (
    <label className="field-label" htmlFor={htmlFor}>
      {icon && <span className="text-stone-400">{icon}</span>}
      {children}
      {optional ? <span className="field-note ml-1">{optionalText ?? "(optional)"}</span> : <span className="text-red-400">*</span>}
    </label>
  );
}

function FieldError({ errors, name }: { errors: ItemFormState["errors"]; name: string }) {
  const value = errors?.[name]?.[0];
  if (!value) return null;
  return <p className="field-error">{value}</p>;
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="field-note">{children}</p>;
}

function FormMessage({ state }: { state: ItemFormState }) {
  if (!state.message) return null;
  return <p className={state.success ? "notice-success" : "notice-danger"}>{state.message}</p>;
}

export function ItemForm({ mode, initialValues, t, categories }: ItemFormProps) {
  const isEdit = mode === "edit";
  const action = isEdit ? updateItemAction : createItemAction;
  const [state, formAction, pending] = useActionState(action, initialItemFormState);

  const conditionOptions = [
    { value: "new", label: t.conditions.new },
    { value: "like_new", label: t.conditions.like_new },
    { value: "good", label: t.conditions.good },
    { value: "fair", label: t.conditions.fair },
    { value: "parts", label: t.conditions.parts },
  ];

  const categoryOptions = categoryValues.map((v) => ({
    value: v,
    label: `${CATEGORY_META[v]?.emoji ?? "📦"} ${(categories as Record<string, string>)[v] ?? v}`,
  }));

  return (
    <form action={formAction} className="admin-panel section-pad space-y-4">
      <div className="flex flex-col gap-3 border-b border-stone-200 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">{isEdit ? "Update listing" : "Create listing"}</p>
            <h2 className="mt-2 flex items-center gap-2 text-lg font-semibold tracking-[-0.03em] text-stone-950">
              {isEdit ? <Save size={18} className="text-stone-500" /> : <Plus size={18} className="text-stone-500" />}
              {isEdit ? t.edit : t.new}
            </h2>
          </div>
          <span className="badge badge-neutral">
            <span className="text-red-400">*</span>
            {t.required}
          </span>
        </div>
        <p className="text-sm text-stone-500">Use compact, factual copy: title, condition, pickup and anything that changes the handoff.</p>
      </div>

      <FormMessage state={state} />

      {isEdit ? <input type="hidden" name="id" value={initialValues.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="field-shell md:col-span-2">
          <FieldLabel htmlFor="item-title" icon={<FileText size={14} />}>{t.fields.title.label}</FieldLabel>
          <input
            id="item-title"
            name="title"
            type="text"
            defaultValue={initialValues.title}
            className={inputClass(!!state.errors?.title)}
            placeholder={t.fields.title.placeholder}
            maxLength={200}
            required
          />
          <FieldError errors={state.errors} name="title" />
        </div>

        <div className="field-shell">
          <FieldLabel htmlFor="item-price" icon={<DollarSign size={14} />}>{t.fields.price.label}</FieldLabel>
          <input
            id="item-price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={initialValues.price}
            className={inputClass(!!state.errors?.price)}
            placeholder={t.fields.price.placeholder}
            required
          />
          <Hint>{t.fields.price.hint}</Hint>
          <FieldError errors={state.errors} name="price" />
        </div>

        <div className="field-shell">
          <FieldLabel htmlFor="item-pickup" icon={<MapPin size={14} />}>{t.fields.pickupArea.label}</FieldLabel>
          <input
            id="item-pickup"
            name="pickup_area"
            type="text"
            defaultValue={initialValues.pickup_area}
            className={inputClass(!!state.errors?.pickup_area)}
            placeholder={t.fields.pickupArea.placeholder}
            maxLength={200}
            required
          />
          <Hint>{t.fields.pickupArea.hint}</Hint>
          <FieldError errors={state.errors} name="pickup_area" />
        </div>

        <div className="field-shell">
          <FieldLabel htmlFor="item-category" icon={<Tag size={14} />}>{t.fields.category.label}</FieldLabel>
          <select id="item-category" name="category" defaultValue={initialValues.category} className={`${inputClass(!!state.errors?.category)} select-base`} required>
            <option value="" disabled>{t.fields.category.placeholder}</option>
            {categoryOptions.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <FieldError errors={state.errors} name="category" />
        </div>

        <div className="field-shell">
          <FieldLabel htmlFor="item-condition" icon={<Sparkles size={14} />}>{t.fields.condition.label}</FieldLabel>
          <select id="item-condition" name="condition" defaultValue={initialValues.condition} className={`${inputClass(!!state.errors?.condition)} select-base`} required>
            {conditionOptions.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <FieldError errors={state.errors} name="condition" />
        </div>
      </div>

      <div className="field-shell">
        <FieldLabel htmlFor="item-description" icon={<FileText size={14} />} optional optionalText="(optional)">
          {t.fields.description.label}
        </FieldLabel>
        <textarea
          id="item-description"
          name="description"
          defaultValue={initialValues.description}
          className={`${state.errors?.description ? "border-red-300 bg-red-50" : ""} textarea-base min-h-32 resize-y`}
          placeholder={t.fields.description.placeholder}
          maxLength={2000}
        />
        <Hint>{t.fields.description.hint}</Hint>
        <FieldError errors={state.errors} name="description" />
      </div>

      <div className="field-shell rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4">
        <label className="field-label" htmlFor={isEdit ? "item-images-edit" : "item-images-create"}>
          <ImagePlus size={14} className="text-stone-400" />
          Imágenes {isEdit ? "(agregar nuevas)" : "(opcionales al crear)"}
        </label>
        <input
          id={isEdit ? "item-images-edit" : "item-images-create"}
          type="file"
          name="images"
          accept="image/*"
          multiple
          className={`input-base mt-2 file:mr-3 file:rounded-xl file:border-0 file:bg-stone-950 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-stone-800 ${state.errors?.images ? "border-red-300 bg-red-50" : ""}`}
        />
        <Hint>Puedes subir varias imágenes (máx 10MB por archivo).</Hint>
        <FieldError errors={state.errors} name="images" />
      </div>

      <div className="flex flex-col gap-3 border-t border-stone-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-stone-500">Keep descriptions specific: dimensions, wear, missing parts, building access or pickup constraints.</div>
        <button type="submit" disabled={pending} className="btn-primary h-11 w-full sm:w-auto">
          {isEdit ? <Save size={15} /> : <Plus size={15} />}
          {pending ? t.submit.saving : isEdit ? t.submit.save : t.submit.create}
        </button>
      </div>
    </form>
  );
}

export function UploadImagesForm({ itemId, t }: UploadImagesFormProps) {
  const [state, formAction, pending] = useActionState(uploadItemImagesAction, initialItemFormState);

  return (
    <form action={formAction} className="admin-panel section-pad space-y-4">
      <div className="border-b border-stone-200 pb-4">
        <p className="eyebrow">Media</p>
        <h3 className="mt-2 flex items-center gap-2 text-lg font-semibold tracking-[-0.03em] text-stone-950">
          <ImagePlus size={18} className="text-stone-500" />
          {t.heading}
        </h3>
      </div>
      <FormMessage state={state} />
      <input type="hidden" name="itemId" value={itemId} />

      <div className="field-shell">
        <label className="field-label" htmlFor="item-images">
          <ImagePlus size={14} className="text-stone-400" />
          {t.label} <span className="text-red-400">*</span>
        </label>
        <input
          id="item-images"
          type="file"
          name="images"
          accept="image/*"
          multiple
          className={`input-base file:mr-3 file:rounded-xl file:border-0 file:bg-stone-950 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-stone-800 ${state.errors?.images ? "border-red-300 bg-red-50" : ""}`}
        />
        <p className="field-note">{t.help}</p>
        <FieldError errors={state.errors} name="images" />
      </div>

      <button type="submit" disabled={pending} className="btn-primary h-11 w-full sm:w-auto">
        <ImagePlus size={15} />
        {pending ? t.uploading : t.submit}
      </button>
    </form>
  );
}

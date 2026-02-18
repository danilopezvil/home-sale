"use client";

import { useActionState } from "react";

import {
  createItemAction,
  type ItemFormState,
  updateItemAction,
  uploadItemImagesAction,
} from "@/app/admin/items/actions";

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
};

type UploadImagesFormProps = {
  itemId: string;
};

const initialItemFormState: ItemFormState = {
  success: false,
  message: "",
};

const conditions = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "parts", label: "For Parts" },
];

function Message({ state }: { state: ItemFormState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p className={`rounded-md border p-3 text-sm ${state.success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
      {state.message}
    </p>
  );
}

function FieldError({ errors, name }: { errors: ItemFormState["errors"]; name: string }) {
  const value = errors?.[name]?.[0];

  if (!value) {
    return null;
  }

  return <p className="mt-1 text-xs text-red-600">{value}</p>;
}

export function ItemForm({ mode, initialValues }: ItemFormProps) {
  const isEdit = mode === "edit";
  const action = isEdit ? updateItemAction : createItemAction;
  const [state, formAction, pending] = useActionState(action, initialItemFormState);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">{isEdit ? "Edit Item" : "Create Item"}</h2>
      <Message state={state} />

      {isEdit ? <input type="hidden" name="id" value={initialValues.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Title
          <input
            name="title"
            defaultValue={initialValues.title}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            required
          />
          <FieldError errors={state.errors} name="title" />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Price
          <input
            name="price"
            defaultValue={initialValues.price}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            inputMode="decimal"
            required
          />
          <FieldError errors={state.errors} name="price" />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Category
          <input
            name="category"
            defaultValue={initialValues.category}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            required
          />
          <FieldError errors={state.errors} name="category" />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Condition
          <select
            name="condition"
            defaultValue={initialValues.condition}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            required
          >
            {conditions.map((condition) => (
              <option key={condition.value} value={condition.value}>
                {condition.label}
              </option>
            ))}
          </select>
          <FieldError errors={state.errors} name="condition" />
        </label>

        <label className="text-sm font-medium text-slate-700 md:col-span-2">
          Pickup Area
          <input
            name="pickup_area"
            defaultValue={initialValues.pickup_area}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            required
          />
          <FieldError errors={state.errors} name="pickup_area" />
        </label>
      </div>

      <label className="block text-sm font-medium text-slate-700">
        Description
        <textarea
          name="description"
          defaultValue={initialValues.description}
          className="mt-1 min-h-28 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <FieldError errors={state.errors} name="description" />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Saving..." : isEdit ? "Save Changes" : "Create Item"}
      </button>
    </form>
  );
}

export function UploadImagesForm({ itemId }: UploadImagesFormProps) {
  const [state, formAction, pending] = useActionState(uploadItemImagesAction, initialItemFormState);

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Upload Images</h3>
      <Message state={state} />
      <input type="hidden" name="itemId" value={itemId} />
      <label className="block text-sm font-medium text-slate-700">
        Images
        <input
          type="file"
          name="images"
          accept="image/*"
          multiple
          className="mt-1 block w-full text-sm"
        />
        <FieldError errors={state.errors} name="images" />
      </label>
      <p className="text-xs text-slate-500">You can select multiple files (max 10MB each).</p>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Uploading..." : "Upload Images"}
      </button>
    </form>
  );
}

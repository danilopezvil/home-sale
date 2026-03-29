export const CART_STORAGE_KEY = "home-sale-cart-item-ids";

export function normalizeCartItemIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const uniqueIds = new Set<string>();
  for (const item of value) {
    if (typeof item !== "string") continue;
    const id = item.trim();
    if (!id) continue;
    uniqueIds.add(id);
  }

  return [...uniqueIds];
}

export function readCartItemIds(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    return normalizeCartItemIds(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function writeCartItemIds(itemIds: string[]) {
  if (typeof window === "undefined") return;

  const normalized = normalizeCartItemIds(itemIds);
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent("cart:updated", { detail: normalized }));
}

export function addItemToCart(itemId: string): string[] {
  const current = readCartItemIds();
  if (current.includes(itemId)) return current;

  const next = [...current, itemId];
  writeCartItemIds(next);
  return next;
}

export function removeItemFromCart(itemId: string): string[] {
  const next = readCartItemIds().filter((id) => id !== itemId);
  writeCartItemIds(next);
  return next;
}

export function clearCart() {
  writeCartItemIds([]);
}

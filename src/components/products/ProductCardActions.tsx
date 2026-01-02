"use client";

import * as React from "react";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setCartFromShopify } from "@/features/cart/cartSlice";

type Props = {
  variantId: string | null | undefined; // Shopify gid, eller null hvis Prisma-produkt
  quantity?: number;
  disabled?: boolean;
};

export default function ProductCardActions({
  variantId,
  quantity = 1,
  disabled,
}: Props) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = React.useState(false);

  const canAdd = Boolean(variantId) && !disabled;

  async function handleAddToCart() {
    if (!variantId) return;

    setLoading(true);
    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, quantity }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json?.error ?? `Add to cart failed (${res.status})`);
      }

      // Shopify cart -> Redux (Header/MiniCart leser fra Redux)
      dispatch(setCartFromShopify(json.cart));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={!canAdd || loading}
      className="w-full rounded-full bg-black px-5 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition"
    >
      {loading ? "Legger til..." : canAdd ? "Add to cart" : "No variant"}
    </button>
  );
}

"use client";

import Link from "next/link";
import * as React from "react";
import type { ProductDTO } from "@/features/products/types";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setCartFromShopify } from "@/features/cart/cartSlice";
import { formatNOKFromCents } from "@/lib/utils/money";

type Props = {
  product: ProductDTO; // vi sender hele produktet inn
};

export default function ProductCard({ product }: Props) {
  const dispatch = useAppDispatch();

  // UI state (ikke Redux)
  const [loading, setLoading] = React.useState(false);

  // Kan bare legge i Shopify-cart hvis vi har variantId
  const canAdd = Boolean(product.variantId);

  async function handleAddToCart() {
    if (!product.variantId) return; // guard

    setLoading(true);

    try {
      // 1) mutasjon: legg til linje i Shopify-cart
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: product.variantId, quantity: 1 }),
      });

      // 2) les respons
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed");

      // 3) sync Shopify cart -> Redux (Header/MiniCart leser fra Redux)
      dispatch(setCartFromShopify(json.cart));
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="flex flex-col rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      {/* klikkbar produkt-side */}
      <Link href={`/products/${product.slug}`} className="hover:underline">
        <h2 className="text-lg font-semibold text-black dark:text-white">
          {product.name}
        </h2>
      </Link>

      <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
        {product.description}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-base font-medium text-black dark:text-white">
          {formatNOKFromCents(product.priceCents)}
        </span>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!canAdd || loading}
        className="mt-4 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white disabled:opacity-50 dark:border-white/20 dark:text-white dark:hover:bg-white dark:hover:text-black"
      >
        {loading ? "Legger til..." : canAdd ? "Add to cart" : "No variant"}
      </button>
    </article>
  );
}

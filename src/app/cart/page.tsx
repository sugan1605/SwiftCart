"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { selectCartSummary } from "@/features/cart/selectors";
import { setCartFromShopify } from "@/features/cart/cartSlice";
import { formatNOKFromCents } from "@/lib/utils/money";

/**
 * CartPage
 *
 * - Leser cart kun fra Redux
 * - Alle endringer går via Shopify API
 * - Redux oppdateres med responsen (setCartFromShopify)
 */
export default function CartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { items, totalItems, cartTotal } =
    useAppSelector(selectCartSummary);

  /**
   * Oppdater quantity på en cart-line
   */
  async function updateQty(lineId: string, nextQty: number) {
    if (nextQty < 1) return;

    const res = await fetch("/api/cart/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lineId, quantity: nextQty }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error(json?.error ?? "Update failed");
      return;
    }

    // Sync Shopify -> Redux
    dispatch(setCartFromShopify(json.cart ?? null));

    // Refresh server components (HeaderServer)
    router.refresh();
  }

  /**
   * Fjern en cart-line helt
   */
  async function removeLine(lineId: string) {
    const res = await fetch("/api/cart/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lineId }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error(json?.error ?? "Remove failed");
      return;
    }

    dispatch(setCartFromShopify(json.cart ?? null));
    router.refresh();
  }

  // Tom cart
  if (totalItems === 0) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-2xl font-semibold">Cart</h1>
        <p className="mt-3 text-zinc-500">Handlekurven er tom.</p>

        <Link
          href="/products"
          className="mt-6 inline-flex rounded-md bg-black px-4 py-2 text-white"
        >
          Fortsett å handle
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-2xl font-semibold">Cart</h1>

      {/* Cart items */}
      <div className="mt-8 space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl border p-4 dark:border-zinc-800"
          >
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="mt-1 text-sm text-zinc-500">
                {formatNOKFromCents(item.priceCents)} / stk
              </p>
            </div>

            {/* Quantity controls */}
            <div className="flex items-center gap-3">
              <button
                className="rounded-md border px-2 py-1"
                onClick={() =>
                  updateQty(item.id, item.quantity - 1)
                }
                disabled={item.quantity <= 1}
              >
                −
              </button>

              <span className="w-8 text-center">
                {item.quantity}
              </span>

              <button
                className="rounded-md border px-2 py-1"
                onClick={() =>
                  updateQty(item.id, item.quantity + 1)
                }
              >
                +
              </button>

              <button
                className="ml-4 text-sm text-red-500 hover:underline"
                onClick={() => removeLine(item.id)}
              >
                Remove
              </button>
            </div>

            {/* Line total */}
            <div className="ml-6 w-24 text-right font-semibold">
              {formatNOKFromCents(
                item.priceCents * item.quantity
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary + checkout */}
      <div className="mt-10 flex items-center justify-between border-t pt-6 dark:border-zinc-800">
        <div>
          <p className="text-sm text-zinc-500">Total</p>
          <p className="text-xl font-semibold">
            {formatNOKFromCents(cartTotal)}
          </p>
        </div>

        {/* Redirecter til Shopify checkout */}
        <a
          href="/api/cart/checkout"
          className="inline-flex rounded-md bg-black px-5 py-3 text-white"
        >
          Go to checkout
        </a>
      </div>
    </section>
  );
}

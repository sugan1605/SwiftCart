"use client";

import * as React from "react";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setCartFromShopify } from "@/features/cart/cartSlice";

type Props = {
  children: React.ReactNode;
};

/**
 * CartHydrator
 *
 * - Kjøres én gang på client ved refresh / hard reload
 * - Leser cart fra /api/cart (Shopify via cookie)
 * - Synker Shopify-cart -> Redux
 *
 * NB:
 * - UI (Header/MiniCart) leser kun fra Redux
 * - Shopify er fortsatt source of truth
 */
export default function CartHydrator({ children }: Props) {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    const controller = new AbortController();

    async function hydrateCart() {
      try {
        const res = await fetch("/api/cart", {
          cache: "no-store",
          credentials: "same-origin",
          signal: controller.signal,
        });

        // HTTP-feil -> reset (vi vil ikke kræsje layout)
        if (!res.ok) {
          dispatch(setCartFromShopify(null));
          return;
        }

        const json = await res.json();

        // cart kan være objekt eller null
        dispatch(setCartFromShopify(json.cart ?? null));
      } catch (e) {
        // Abort = normal unmount / route change
        if ((e as any)?.name === "AbortError") return;

        // Stille fail – fallback til tom cart
        dispatch(setCartFromShopify(null));
      }
    }

    hydrateCart();

    // Avbryt fetch ved unmount (ryddig cleanup)
    return () => controller.abort();
  }, [dispatch]);

  return <>{children}</>;
}

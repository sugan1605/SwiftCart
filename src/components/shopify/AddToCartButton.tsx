"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setCartFromShopify } from "@/features/cart/cartSlice";

type Props = {
  variantId: string;
  quantity?: number;
  disabled?: boolean;
};

export function AddToCartButton({ variantId, quantity = 1, disabled }: Props) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  async function handleAdd() {
    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, quantity }),
      });

      const json = await res.json().catch(() => ({}));

      // API feil -> vis feilmelding (hvis den finnes)
      if (!res.ok) {
        throw new Error(json?.error ?? "Failed to add to cart");
      }

      //  Instant sync: Shopify cart -> Redux
      dispatch(setCartFromShopify(json.cart ?? null));

      setMsg("Lagt til i cart ✅");

      //  Refresh server components (HeaderServer shopifyCount)
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Noe gikk galt ❌");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      <button
        onClick={handleAdd}
        disabled={disabled || loading}
        className="rounded-md bg-white px-4 py-2 text-black disabled:opacity-50"
      >
        {loading ? "Legger til..." : "Add to cart"}
      </button>

      {msg && <p className="mt-2 text-sm text-zinc-400">{msg}</p>}
    </div>
  );
}

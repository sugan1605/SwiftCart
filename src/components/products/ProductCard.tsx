// Dummy fil som skal forbedres senere med Redux Toolkit og kobles til backend,
// Denne komponenten skal bruke Redux dispatch, håndtere brukerklikk og oppdatere global state.

"use client";

import Link from "next/link";
import { useAppDispatch } from "@/lib/redux/hooks";
import { addItem } from "@/features/cart/cartSlice";
import { formatNOKFromCents } from "@/lib/utils/money";

type ProductCardProps = {
  id: number;
  name: string;
  slug: string;
  priceCents: number;
  description: string;
};

export default function ProductCard({
  id,
  name,
  slug,
  priceCents,
  description,
}: ProductCardProps) {
  const dispatch = useAppDispatch();

  function handleAddToCart() {
    dispatch(
      addItem({
        id,
        name,
        priceCents,
        quantity: 1,
      })
    );
  }
  return (
    <article className="flex flex-col rounded-xl border bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-3 h-40 w-full rounded-lg bg-zinc-100 dark:bg-zinc-900" />

      {/*Link til product detail page */}

      <Link href={`/products/${slug}`} className="hover:underline">
        <h2 className="text-lg font-semibold text-black dark:text-white">
          {name}
        </h2>
      </Link>

      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
        {description}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-base font-medium text-black dark:text-white">
          {formatNOKFromCents(priceCents)}
        </span>
      </div>
      <button
        onClick={handleAddToCart}
        className="rounded-full px-4 py-1 text-sm font-medium border border-black/10 dark:border-white/20 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition"
        type="button"
      >
        Add to Cart
      </button>
    </article>
  );
}

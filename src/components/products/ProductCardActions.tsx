"use client";

import { useAppDispatch } from "@/lib/redux/hooks";
import { addItem } from "@/features/cart/cartSlice";

type Props = {
  id: number;
  name: string;
  priceCents: number;
};

export default function ProductCardActions({ id, name, priceCents }: Props) {
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
    <button
      type="button"
      onClick={handleAddToCart}
      className="w-full rounded-full bg-black px-5 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition"
    >
      Add to cart
    </button>
  );
}

"use client";

import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  removeItem,
  clearCart,
  increaseQuantity,
  decreaseQuantity,
} from "@/features/cart/cartSlice";

import { selectCartSummary } from "@/features/cart/selectors";
import { CURRENCY } from "@/config/appConfig";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const { items, totalItems, cartTotal } = useAppSelector(selectCartSummary);

  const handleIncrease = (id: number) => {
    dispatch(increaseQuantity(id));
  };

  const handleDecrease = (id: number) => {
    dispatch(decreaseQuantity(id));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleRemoveItem = (id: number) => {
    dispatch(removeItem(id));
  };

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold text-black dark:text-white">Cart</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Your shopping cart is currently empty.
        </p>

        <div className="mt-8">
          <Link
            href="/products"
            className="inline-block rounded-full border px-5 py-2 text-sm font-medium border-zinc-700 hover:bg-zinc-800 hover:text-white dark:hover:bg-zinc-200 dark:hover:text-black transition"
          >
            Browse Products
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Your Cart
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            You have {totalItems} item{totalItems !== 1 ? "s" : ""} in your
            cart.
          </p>
        </div>

        <button
          type="button"
          onClick={handleClearCart}
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-900 hover:text-white dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-100 dark:hover:text-black transition"
        >
          Clear cart
        </button>
      </header>

      <div className="space-y-4">
        {items.map((item) => {
          const lineTotal = item.priceCents * item.quantity;

          return (
            <article
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-xl border bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex-1">
                <h2 className="text-base font-semibold text-black dark:text-white">
                  {item.name}
                </h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Price: {item.priceCents.toFixed(2)} {CURRENCY}
                </p>
                <div className="mt-2 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <span>Qty:</span>
                  <div className="inline-flex items-center gap-3 rounded-full border border-zinc-300 px-3 py-1 dark:border-zinc-700">
                    <button
                      type="button"
                      onClick={() => handleDecrease(item.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none text-zinc-700 hover:bg-zinc-200 hover:text-black dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-white"
                    >
                      –
                    </button>
                    <span className="min-w-[2rem] text-center text-sm font-medium text-black dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleIncrease(item.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none text-zinc-700 hover:bg-zinc-200 hover:text-black dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-white"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className="text-base font-semibold text-black dark:text-white">
                  {lineTotal.toFixed(2)} NOK
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-xs font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <footer className="mt-8 flex items-center justify-between border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          Shipping and taxes calculated at checkout (later 😄)
        </div>
        <div className="text-right">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Total</p>
          <p className="text-2xl font-bold text-black dark:text-white">
            {cartTotal.toFixed(2)} {CURRENCY}
          </p>
        </div>
      </footer>
    </section>
  );
}

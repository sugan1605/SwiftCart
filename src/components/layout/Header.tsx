"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectCartSummary } from "@/features/cart/selectors";
import { APP_NAME } from "@/config/appConfig";
import { formatNOKFromCents } from "@/lib/utils/money";

type HeaderProps = {
  shopifyCount?: number; // kommer fra server (Shopify cart)
};

export default function Header({ shopifyCount = 0 }: HeaderProps) {
  // Local UI state (dropdown open/close) -> skal ikke ligge i Redux
  const [isOpen, setIsOpen] = useState(false);

  // Hydration guard (unngå mismatch server vs client)
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // Redux mini-cart (preview)
  const { items, totalItems, cartTotal } = useAppSelector(selectCartSummary);

  const previewItems = useMemo(() => items.slice(0, 3), [items]);

  // Source of truth:
  // - Før hydrering: bruk server count (unngå “blink”)
  // - Etter hydrering: bruk Redux
  const countToShow = hydrated ? totalItems : shopifyCount;

  // Hvis cart er tom, gir det ikke mening å ha dropdown åpen
  useEffect(() => {
    if (hydrated && totalItems === 0) setIsOpen(false);
  }, [hydrated, totalItems]);

  return (
    <header className="relative border-b bg-white/80 backdrop-blur dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-black dark:text-white"
        >
          {APP_NAME}
        </Link>

        <nav className="flex items-center gap-6 text-sm text-zinc-600 dark:text-zinc-300">
          <Link href="/products" className="hover:text-black dark:hover:text-white">
            Products
          </Link>

          {/* Cart trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className="hover:text-black dark:hover:text-white"
            >
              Cart ({countToShow})
              {cartTotal > 0 && <> · {formatNOKFromCents(cartTotal)}</>}
            </button>

            {/* Mini-cart dropdown */}
            {isOpen && (
              <div className="absolute right-0 top-full z-50 mt-3 w-80 rounded-xl border bg-white p-4 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
                <p className="mb-3 text-sm font-medium text-black dark:text-white">
                  Cart preview
                </p>

                {totalItems === 0 ? (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Cart is empty
                  </p>
                ) : (
                  <>
                    <div className="space-y-3">
                      {previewItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-black dark:text-white">
                              {item.name}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              Qty: {item.quantity}
                            </p>
                          </div>

                          <span className="font-medium text-black dark:text-white">
                            {formatNOKFromCents(item.priceCents * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {items.length > 3 && (
                      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                        + {items.length - 3} more item{items.length - 3 > 1 ? "s" : ""}
                      </p>
                    )}

                    <div className="mt-4 border-t pt-4 dark:border-zinc-800">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400">Total</span>
                        <span className="font-semibold text-black dark:text-white">
                          {formatNOKFromCents(cartTotal)}
                        </span>
                      </div>

                      <Link
                        href="/cart"
                        onClick={() => setIsOpen(false)}
                        className="mt-4 block w-full rounded-full bg-black px-4 py-2 text-center text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition"
                      >
                        Go to cart
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

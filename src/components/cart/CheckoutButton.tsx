"use client";

import { clearCart } from "@/features/cart/cartSlice";
import { createOrder } from "@/features/orders/actions";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";



export default function CheckoutButton() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);


    const items = useAppSelector((s) => s.cart.items);

    const disabled = loading || items.length === 0;


    async function handleCheckout() {
        try {
            setLoading(true);

            // Send kun det serveren trenger (productId + quantity)
            const payload = items.map((i) => ({
                productId: i.id, // hvis cart state bruker "id" som produkt-id
                quantity: i.quantity,
            }));

            const { orderId } = await createOrder(payload);

            // UX: tøm cart lokalt etter at order er opprettet

            dispatch(clearCart());

            router.push(`/order/success?orderId=${orderId}`);
        } catch (err) {
            console.error(err);
            alert("Checkout failed. Check console.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
      type="button"
      onClick={handleCheckout}
      disabled={disabled}
      className="w-full rounded-full bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition"
    >
      {loading ? "Creating order..." : "Checkout"}
    </button>
    );
}
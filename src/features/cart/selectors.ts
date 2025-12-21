import type { RootState } from "@/lib/redux/store";

export const selectCartItems = (state: RootState) => state.cart.items;

export const selectCartSummary = (state: RootState) => {
    const items = selectCartItems(state);


    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);


    const cartTotal = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

    return { items, totalItems, cartTotal};
}

// selecetCartItems -> Bare hent listen
// selectCartSummary -> gi meg: all items, total antall varer (med qty tatt med), total sum i penger
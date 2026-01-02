import type { RootState } from "@/lib/redux/store";

export const selectShopifyCart = (state: RootState) => state.cart.shopifyCart;

export const selectCartCount = (state: RootState) =>
  selectShopifyCart(state)?.totalQuantity ?? 0;

export const selectCartTotalCents = (state: RootState) => {
  const amountStr = selectShopifyCart(state)?.cost?.totalAmount?.amount;
  const amount = Number(amountStr ?? 0);
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
};

export type CartPreviewItem = {
  id: string;
  name: string;
  quantity: number;
  priceCents: number;
};

export const selectCartItems = (state: RootState): CartPreviewItem[] => {
  const cart = selectShopifyCart(state);
  const nodes = cart?.lines?.nodes ?? [];

  return nodes.map((line: any) => {
    const unitAmountStr = line?.cost?.amountPerQuantity?.amount;
    const unitAmount = Number(unitAmountStr ?? 0);
    const priceCents = Number.isFinite(unitAmount) ? Math.round(unitAmount * 100) : 0;

    const name =
      line?.merchandise?.product?.title ??
      line?.merchandise?.title ??
      "Item";

    return {
      id: String(line?.id ?? ""),
      name,
      quantity: Number(line?.quantity ?? 0),
      priceCents,
    };
  });
};

export const selectCartSummary = (state: RootState) => ({
  items: selectCartItems(state),
  totalItems: selectCartCount(state),
  cartTotal: selectCartTotalCents(state),
});

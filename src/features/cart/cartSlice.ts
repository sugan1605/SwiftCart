import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/**
 * Redux item (brukes i UI / mini-cart)
 * id = Shopify lineId (stabil)
 */
export type CartItem = {
  id: string;
  variantId: string | null;
  name: string;
  priceCents: number;
  quantity: number;
};

/**
 * Rå Shopify cart (source of truth)
 * Brukes av selectors (count / totals)
 */
export type ShopifyCart = {
  totalQuantity?: number;
  cost?: {
    totalAmount?: {
      amount: string;
      currencyCode: string;
    };
  };
  lines?: {
    nodes: Array<{
      id: string; // lineId
      quantity: number;
      cost?: {
        amountPerQuantity?: {
          amount: string;
          currencyCode: string;
        };
      };
      merchandise?: {
        id?: string; // variantId
        title?: string;
        product?: {
          title?: string;
        };
      };
    }>;
  };
};

/**
 * Redux cart state
 */
type CartState = {
  items: CartItem[];              // UI / mini-cart
  shopifyCart: ShopifyCart | null; // Shopify snapshot
};

const initialState: CartState = {
  items: [],
  shopifyCart: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /**
     * Kun for lokal testing / fallback
     * Shopify-flow bruker setCartFromShopify
     */
    addItem(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },

    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },

    clearCart(state) {
      state.items = [];
      state.shopifyCart = null;
    },

    /**
     * Source of truth:
     * Mapper Shopify cart -> Redux
     */
    setCartFromShopify(
      state,
      action: PayloadAction<ShopifyCart | null>
    ) {
      const cart = action.payload;

      // Lagre rå Shopify cart (for selectors)
      state.shopifyCart = cart;

      // Ingen cart / tom cart
      if (!cart?.lines?.nodes?.length) {
        state.items = [];
        return;
      }

      // Map Shopify lines -> Redux items
      state.items = cart.lines.nodes.map((line) => {
        const name =
          line.merchandise?.product?.title ??
          line.merchandise?.title ??
          "Item";

        const amount =
          line.cost?.amountPerQuantity?.amount ?? "0";

        const priceCents = Math.round(Number(amount) * 100);

        return {
          id: line.id, // lineId = stabil
          variantId: line.merchandise?.id ?? null,
          name,
          quantity: line.quantity ?? 1,
          priceCents,
        };
      });
    },
  },
});

export const {
  addItem,
  removeItem,
  clearCart,
  setCartFromShopify,
} = cartSlice.actions;

export default cartSlice.reducer;

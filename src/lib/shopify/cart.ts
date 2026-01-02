import "server-only";
import { cookies } from "next/headers";
import { storefrontFetch } from "@/lib/shopify/storefront";

const CART_ID_COOKIE = "swiftcart_cart_id";

const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    totalQuantity
    checkoutUrl
  }
`;

const CART_GET = /* GraphQL */ `
  query CartGet($id: ID!) {
    cart(id: $id) {
      ...CartFields
    }
  }
  ${CART_FRAGMENT}
`;

export async function getCart() {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_ID_COOKIE)?.value;

  // Ingen cookie => ingen cart ennå
  if (!cartId) return null;

  // Hent cart fra Shopify
  const data = await storefrontFetch<{
    cart: { id: string; totalQuantity: number; checkoutUrl: string } | null;
  }>(CART_GET, { id: cartId });

  return data.cart; // kan være null hvis cartId er utløpt
}

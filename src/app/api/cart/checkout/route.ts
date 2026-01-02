import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { storefrontFetch } from "@/lib/shopify/storefront";

const CART_ID_COOKIE = "swiftcart_cart_id";

const CART_CHECKOUT = /* GraphQL */ `
  query CartCheckout($id: ID!) {
    cart(id: $id) {
      id
      checkoutUrl
    }
  }
`;

export async function GET() {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_ID_COOKIE)?.value;

  if (!cartId) {
    return NextResponse.redirect(new URL("/cart", process.env.NEXT_PUBLIC_APP_URL));
  }

  const data = await storefrontFetch<{ cart: { checkoutUrl: string } | null }>(
    CART_CHECKOUT,
    { id: cartId }
  );

  const url = data.cart?.checkoutUrl;

  if (!url) {
    const res = NextResponse.redirect(new URL("/cart", process.env.NEXT_PUBLIC_APP_URL));
    res.cookies.delete(CART_ID_COOKIE);
    return res;
  }

  return NextResponse.redirect(url);
}

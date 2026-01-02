import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { storefrontFetch } from "@/lib/shopify/storefront";

const CART_ID_COOKIE = "swiftcart_cart_id";

const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    totalQuantity
    checkoutUrl
    cost {
      totalAmount { amount currencyCode }
    }
    lines(first: 50) {
      nodes {
        id
        quantity
        cost {
          amountPerQuantity { amount currencyCode }
          totalAmount { amount currencyCode }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            product { title handle }
          }
        }
      }
    }
  }
`;

const CART_LINES_UPDATE = /* GraphQL */ `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;

type UserError = { field?: string[]; message: string };
type Payload = { cart: any; userErrors: UserError[] };

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_ID_COOKIE)?.value;

  if (!cartId) {
    return NextResponse.json({ error: "No cart" }, { status: 400 });
  }

  const body = await req.json();
  const lineId = body?.lineId as string | undefined;
  const quantity = Number(body?.quantity);

  if (!lineId) {
    return NextResponse.json({ error: "Missing lineId" }, { status: 400 });
  }
  if (!Number.isFinite(quantity) || quantity < 1) {
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
  }

  const data = await storefrontFetch<{ cartLinesUpdate: Payload }>(
    CART_LINES_UPDATE,
    { cartId, lines: [{ id: lineId, quantity }] }
  );

  const errs = data.cartLinesUpdate?.userErrors ?? [];
  if (errs.length) {
    return NextResponse.json(
      { error: errs.map((e) => e.message).join(" | ") },
      { status: 400 }
    );
  }

  const cart = data.cartLinesUpdate?.cart;
  if (!cart?.id) {
    const res = NextResponse.json({ error: "Cart not found" }, { status: 400 });
    res.cookies.delete(CART_ID_COOKIE);
    return res;
  }

  return NextResponse.json({ cart });
}

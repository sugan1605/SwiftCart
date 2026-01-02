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
type CartPayload = { cart: any; userErrors: UserError[] };

export async function POST(req: Request) {
  const cookieStore = await cookies();

  try {
    const body = await req.json();
    const lineId = body?.lineId as string | undefined;

    if (!lineId) {
      return NextResponse.json({ error: "Missing lineId" }, { status: 400 });
    }

    const cartId = cookieStore.get(CART_ID_COOKIE)?.value;
    if (!cartId) {
      return NextResponse.json({ error: "No cart" }, { status: 400 });
    }

    // Fjern = sett quantity til 0
    const lines = [{ id: lineId, quantity: 0 }];

    const data = await storefrontFetch<{ cartLinesUpdate: CartPayload }>(
      CART_LINES_UPDATE,
      { cartId, lines }
    );

    const payload = data.cartLinesUpdate;
    const errs = payload?.userErrors ?? [];

    if (errs.length) {
      return NextResponse.json(
        {
          error: errs.map((e) => e.message).join(" | "),
          debug: process.env.NODE_ENV !== "production" ? errs : undefined,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ cart: payload.cart });
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Kunne ikke fjerne varen. Prøv igjen.",
        debug: process.env.NODE_ENV !== "production" ? raw : undefined,
      },
      { status: 500 }
    );
  }
}

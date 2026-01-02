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
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 50) {
      nodes {
        id
        quantity
        cost {
          amountPerQuantity {
            amount
            currencyCode
          }
          totalAmount {
            amount
            currencyCode
          }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            product {
              title
              handle
            }
          }
        }
      }
    }
  }
`;

const CART_GET = /* GraphQL */ `
  query CartGet($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFields
    }
  }
  ${CART_FRAGMENT}
`;

export async function GET() {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_ID_COOKIE)?.value;

  if (!cartId) {
    return NextResponse.json({ cart: null });
  }

  try {
    const data = await storefrontFetch<{ cart: any | null }>(CART_GET, {
      cartId,
    });

    if (!data.cart?.id) {
      const res = NextResponse.json({ cart: null });
      res.cookies.delete(CART_ID_COOKIE);
      return res;
    }

    return NextResponse.json({ cart: data.cart });
  } catch (e) {
    // Hvis Shopify klager på cartId, er det ofte best å "self-heale" ved å slette cookie
    const msg = e instanceof Error ? e.message : "Unknown error";
    const shouldDeleteCookie =
      typeof msg === "string" &&
      (msg.toLowerCase().includes("not found") ||
        msg.toLowerCase().includes("invalid") ||
        msg.toLowerCase().includes("does not exist"));

    const res = NextResponse.json({ error: msg }, { status: 500 });

    if (shouldDeleteCookie) {
      res.cookies.delete(CART_ID_COOKIE);
    }

    return res;
  }
}

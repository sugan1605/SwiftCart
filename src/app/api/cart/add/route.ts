import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { storefrontFetch } from "@/lib/shopify/storefront";

// Mutasjons-endpoint (create cart + add lines)

const CART_ID_COOKIE = "swiftcart_cart_id";

/**
 * Fragment: samme cart-shape uansett om vi create eller add
 */

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

/**
 * Create cart hvis vi ikke har cartId i cookie
 */

const CART_CREATE = /* GraphQL */ `
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

/**
 * Add lines til eksisterende cartId
 */

const CART_LINES_ADD = /* GraphQL */ `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

type UserError = { field?: string[]; message: string };

type CartPayload = {
  cart: any;
  userErrors: UserError[];
};

/**
 *  Lager en mer menneskelig feilmelding til klienten, 
 * men vi beholder "debug" i dev (så du slipper å gjette).
 */

function toUserMessage(raw: string) {
  const msg = raw.toLowerCase();

  // Typisk når variantId er feil / null / ikke tilgjengelig

  if (
    msg.includes("merchandise") ||
    msg.includes("variant") ||
    msg.includes("gid")
  ) {
    return "Denne varen er ikke tilgjengelig akkurat nå (variant mangler / ugyldig).";
  }

  // Typisk når cartId er død / utløpt

  if (
    msg.includes("cart") &&
    (msg.includes("not found") || msg.includes("invalid") || msg.includes("does not exist"))
  ) {
    return "Handlekurven din var utløpt. Prøv igjen - vi oppretter en ny.";
  }

  // Fallback

  return "Noe gikk galt. Prøv igjen.";
}

export async function POST(req: Request) {
  const cookieStore = await cookies(); // hent én gang
  try {
    // 1. Parse input fra frontend pluss valider input
    const body = await req.json();
    const variantId = body?.variantId as string | undefined;
    const quantity = Number(body?.quantity ?? 1);

    // Basic input validation
    if (!variantId) {
      return NextResponse.json({ error: "Missing variantId" }, { status: 400 });
    }
    if (!Number.isFinite(quantity) || quantity < 1) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    // 2) Les cartId fra cookie (hvis den finnes)
    const cartId = cookieStore.get(CART_ID_COOKIE)?.value;

    // 3.  Shopify forventer lines som ARRAY av merchandiseId + quantity
    const lines = [{ merchandiseId: variantId, quantity }];

    // Dev-logg (så man kan se hva som faktisk sendes)

    if (process.env.NODE_ENV !== "production") {
      console.log("[/api/cart/add] incoming", { variantId, quantity, cartId });
    }

    /**
     * CASE 1: Ingen cart finnes -> opprett ny
     */
    if (!cartId) {
      const data = await storefrontFetch<{ cartCreate: CartPayload }>(
        CART_CREATE,
        { lines }
      );

      const payload = data.cartCreate;
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

      const cart = payload?.cart;
      if (!cart?.id) {
        return NextResponse.json(
          {
            error: "Could not create cart.",
            debug: process.env.NODE_ENV !== "production" ? payload : undefined,
          },
          { status: 500 }
        );
      }

      // returner samme response-objektet som setter cookie
      const res = NextResponse.json({ cart });
      res.cookies.set(CART_ID_COOKIE, cart.id, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 dager
      });

      return res;
    }

    /**
     * CASE 2: Cart finnes -> legg til linje
     */
    const data = await storefrontFetch<{ cartLinesAdd: CartPayload }>(
      CART_LINES_ADD,
      { cartId, lines }
    );

    const payload = data.cartLinesAdd;
    const errs = payload?.userErrors ?? [];

    if (errs.length) {
      // Hvis Shopify sier cart/line-feil -> slett cookie og be klienten prøve igjen
      const res = NextResponse.json(
        {
          error: errs.map((e) => e.message).join(" | "),
          retry: true,
          debug: process.env.NODE_ENV !== "production" ? errs : undefined,
        },
        { status: 400 }
      );
      res.cookies.delete(CART_ID_COOKIE);
      return res;
    }

    return NextResponse.json({ cart: payload.cart });
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Unknown error";
    const userMessage = toUserMessage(raw);

    // Self-heal: hvis feilen tyder på død cartId -> slett cookie
    const lower = raw.toLowerCase();

    const shouldDeleteCookie =
      lower.includes("cart") &&
      (lower.includes("not found") ||
        lower.includes("invalid") ||
        lower.includes("does not exist"));

    const res = NextResponse.json(
      {
        error: userMessage,
        // debug kun i dev (for å få eksakt Shopify-feil)
        debug: process.env.NODE_ENV !== "production" ? raw : undefined,
      },
      { status: 400 } // <- ikke 500 for "forventede" Shopify-feil
    );

    if (shouldDeleteCookie) {
      res.cookies.delete(CART_ID_COOKIE);
    }

    // Dev-logg

    if (process.env.NODE_ENV !== "production") {
      console.error("[/api/cart/add] error:", raw);
    }

    return res;
  }
}

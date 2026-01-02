import "server-only";


// Leser config fra env (server-side only)
const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const version = process.env.SHOPIFY_API_VERSION ?? "2025-01";

// Fail fast hvis env mangler
if (!domain) throw new Error("Missing SHOPIFY_STORE_DOMAIN");
if (!token) throw new Error("Missing SHOPIFY_STOREFRONT_ACCESS_TOKEN");

const accessToken = token;

// Bygger GraphQL endpoint for Storefront API
const endpoint = `https://${domain}/api/${version}/graphql.json`;

// Definerer typisk Shopify response shape
type StorefrontResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

export async function storefrontFetch<T>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {

  // POST til shopify GraphQL endpoint
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",

      // Storefront token (ikke Admin token)
      "X-Shopify-Storefront-Access-Token": accessToken,
    },

    body: JSON.stringify({ query, variables }),

    // dev: jeg kan bruke "no-store" for å slippe caching, når jeg tester
    cache: "no-store",
  });

  // HTTP-level feil (f.eks. 401 / 403 / 500)
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify Storefront error ${res.status}: ${text}`);
  }

  // GraphQL-level response
  const json = (await res.json()) as StorefrontResponse<T>;


  // GraphQl errors (query / permissions / etc)
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join(" | "));
  }

  // Sikrer at vi alltid returnerer data
  if (!json.data) throw new Error("No data returned from Storefront API");

  return json.data;
}

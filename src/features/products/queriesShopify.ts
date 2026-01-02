import { storefrontFetch } from "@/lib/shopify/storefront";
import { PRODUCTS_QUERY } from "@/lib/shopify/queries";
import type { ProductDTO } from "./types";

type ShopifyProductsQuery = {
  products: {
    nodes: Array<{
      id: string;
      title: string;
      handle: string;
      description?: string;
      featuredImage?: { url: string | null } | null;
      priceRange?: {
        minVariantPrice: { amount: string; currencyCode: string };
      };
      variants?: {
        nodes: Array<{ id: string }>;
      };
    }>;
  };
};

export async function getActiveProductsShopify(): Promise<ProductDTO[]> {
  const data = await storefrontFetch<ShopifyProductsQuery>(PRODUCTS_QUERY, {
    first: 30,
  });

  return data.products.nodes.map((p) => ({
    id: p.id,
    slug: p.handle,
    name: p.title,
    description: p.description ?? "",
    priceCents: Math.round(Number(p.priceRange?.minVariantPrice.amount ?? "0") * 100),
    imageUrl: p.featuredImage?.url ?? null,
    variantId: p.variants?.nodes?.[0]?.id ?? null, // 👈 viktig for Add to cart
  }));
}

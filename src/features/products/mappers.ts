import type { Product } from "@prisma/client";
import type { ProductDTO } from "./types";

/**
 * Prisma -> ProductDTO (UI)
 * - Prisma har ikke variantId (Shopify har)
 */
export function toProductDTO(product: Product): ProductDTO {
  return {
    id: String(product.id), // viktig: UI bruker string id
    name: product.name,
    slug: product.slug,
    description: product.description,
    priceCents: product.priceCents,
    imageUrl: product.imageUrl ?? null,
    variantId: null, // Prisma har ikke Shopify variantId
  };
}

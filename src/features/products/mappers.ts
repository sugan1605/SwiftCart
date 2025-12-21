import type { Product } from "@prisma/client";
import type { ProductDTO } from "./types";

export function toProductDTO(product: Product): ProductDTO {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    priceCents: product.priceCents,
    imageUrl: product.imageUrl ?? null,
  };
}

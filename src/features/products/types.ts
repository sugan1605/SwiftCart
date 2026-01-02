import type { Product } from "@prisma/client";

// DTO som UI jobber med (uansett om data kommer fra Prisma eller Shopify)
export type ProductDTO = {
  id: string; // UI bruker string (Shopify id er string, Prisma gjør vi String(id))
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  imageUrl?: string | null;

  // Shopify-only (Prisma har ikke dette)
  variantId?: string | null;
};

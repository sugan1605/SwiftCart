import type { Product } from "@prisma/client";

export type ProductDTO = Pick<
  Product,
  "id" | "name" | "slug" | "description" | "priceCents" | "imageUrl"
>;

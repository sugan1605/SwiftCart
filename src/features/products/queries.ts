import { prisma } from "@/lib/prisma";
import { toProductDTO } from "./mappers";

// Henter alle aktive produkter (liste).  Brukes på /products

export async function getActiveProducts() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  console.log("Active products found:", products.length);
  return products.map(toProductDTO);
}

// Henter ett aktivt produkt basert på slug. Brukes på /products/[slug]

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: {
      slug,
      isActive: true,
    },
  });
  return product ? toProductDTO(product) : null;
}

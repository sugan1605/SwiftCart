"use server";

import { prisma } from "@/lib/prisma";

type CartItemInput = {
  productId: number;
  quantity: number;
};

function normalizeItems(items: CartItemInput[]): CartItemInput[] {
  const map = new Map<number, number>();

  for (const item of items) {
    if (!Number.isInteger(item.productId) || item.productId <= 0) {
      throw new Error(`Invalid productId: ${item.productId}`);
    }
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error(`Invalid quantity for product ${item.productId}`);
    }

    map.set(item.productId, (map.get(item.productId) ?? 0) + item.quantity);
  }

  return Array.from(map.entries()).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

export async function createOrder(items: CartItemInput[], email?: string) {
  if (!items?.length) {
    throw new Error("Cart is empty");
  }

  // Normaliser cart: slå sammen duplikate productId til én linje per produkt
  const normalized = normalizeItems(items);

  // Server-side source of truth: hent produkter og priser fra DB
  const productIds = normalized.map((i) => i.productId);

  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    select: { id: true, name: true, slug: true, priceCents: true },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  // Valider at alle produkter finnes og er aktive
  const missing = productIds.filter((id) => !productMap.has(id));
  if (missing.length) {
    throw new Error(`Product(s) not found/active: ${missing.join(", ")}`);
  }

  // Bygg OrderItems (snapshot: name/slug/priceCents) + totalCents
  const orderItems = normalized.map((i) => {
    const p = productMap.get(i.productId)!;

    return {
      productId: p.id,
      name: p.name,
      slug: p.slug,
      priceCents: p.priceCents,
      quantity: i.quantity,
    };
  });

  const totalCents = orderItems.reduce(
    (sum, i) => sum + i.priceCents * i.quantity,
    0
  );

  // Atomisk insert: én Order med nested create av OrderItems (alt lagres eller ingenting lagres)
  const order = await prisma.order.create({
    data: {
      email: email ?? null,
      totalCents,
      status: "PENDING",
      items: { create: orderItems },
    },
    select: { id: true },
  });

  return { orderId: order.id };
}

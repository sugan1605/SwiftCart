import ProductCard from "@/components/products/ProductCard";
import { getActiveProductsShopify } from "@/features/products/queriesShopify";
import type { ProductDTO } from "@/features/products/types";

export default async function ProductsPage() {
  const products: ProductDTO[] = await getActiveProductsShopify();

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-red-500">
          Products
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Products loaded from Shopify (Storefront API)
        </p>
      </header>

      {products.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">No products yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}

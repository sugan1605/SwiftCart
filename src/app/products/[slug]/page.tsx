import { notFound } from "next/navigation";
import { getProductBySlug } from "@/features/products/queries";
import ProductCardActions from "@/components/products/ProductCardActions";
import { CURRENCY } from "@/config/appConfig";

type PageProps = {
  params: { slug: string };
};

export default async function ProductDetailsPage({ params }: PageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) return notFound();

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="h-[360px] w-full rounded-xl bg-zinc-100 dark:bg-zinc-900" />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">
            {product.name}
          </h1>

          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {product.description}
          </p>

          <p className="mt-6 text-2xl font-semibold text-black dark:text-white">
            {(product.priceCents / 100).toFixed(2)} {CURRENCY}
          </p>

          <div className="mt-6">
            <ProductCardActions
              id={product.id}
              name={product.name}
              priceCents={product.priceCents}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

import { notFound } from "next/navigation";
import Image from "next/image";

import { storefrontFetch } from "@/lib/shopify/storefront";
import { PRODUCTS_QUERY } from "@/lib/shopify/queries";
import { AddToCartButton } from "@/components/shopify/AddToCartButton";

type PageProps = {
  params: Promise<{ slug: string }>;
};

type ProductByHandleResponse = {
  productByHandle: null | {
    id: string;
    title: string;
    handle: string;
    description: string;
    featuredImage: null | {
      url: string;
      altText: string | null;
      width: number | null;
      height: number | null;
    };
    images: {
      nodes: Array<{
        url: string;
        altText: string | null;
        width: number | null;
        height: number | null;
      }>;
    };
    variants: {
      nodes: Array<{
        id: string;
        title: string;
        availableForSale: boolean;
        price: { amount: string; currencyCode: string };
      }>;
    };
  };
};

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  const data = await storefrontFetch<ProductByHandleResponse>(
    PRODUCTS_QUERY,
    { handle: slug, firstVariants: 20 }
  );

  const product = data.productByHandle;
  if (!product) return notFound();

  const firstVariant = product.variants.nodes[0];
  if (!firstVariant) return notFound();

  const img = product.featuredImage ?? product.images.nodes[0] ?? null;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 text-white">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          {img ? (
            <Image
              src={img.url}
              alt={img.altText ?? product.title}
              width={img.width ?? 900}
              height={img.height ?? 900}
              className="h-auto w-full rounded-lg object-cover"
              priority
            />
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-lg bg-white/5 text-zinc-400">
              No image
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold">{product.title}</h1>
          <p className="mt-2 text-zinc-300">{product.description}</p>

          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-zinc-400">Price</p>
            <p className="mt-1 text-xl font-semibold">
              {Number(firstVariant.price.amount).toFixed(2)}{" "}
              {firstVariant.price.currencyCode}
            </p>

            <div className="mt-4">
              <p className="text-sm text-zinc-400">Variants</p>
              <ul className="mt-2 space-y-2">
                {product.variants.nodes.map((v) => (
                  <li
                    key={v.id}
                    className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 px-3 py-2"
                  >
                    <span>{v.title}</span>
                    <span className="text-sm text-zinc-400">
                      {Number(v.price.amount).toFixed(2)} {v.price.currencyCode}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <AddToCartButton
              variantId={firstVariant.id}
              disabled={!firstVariant.availableForSale}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

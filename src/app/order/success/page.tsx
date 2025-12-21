import Link from "next/link";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-black dark:text-white">
        Order received ✅
      </h1>

      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Order ID: <span className="font-mono">{orderId ?? "unknown"}</span>
      </p>

      <div className="mt-8 flex gap-3">
        <Link
          href="/products"
          className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900 transition"
        >
          Continue shopping
        </Link>

        {orderId && (
          <Link
            href={`/order/${orderId}`}
            className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition"
          >
            View order
          </Link>
        )}
      </div>
    </section>
  );
}

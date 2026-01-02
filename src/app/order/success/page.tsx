import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatNOKFromCents } from "@/lib/utils/money";

//Signaturen (leser query params)
type PageProps = {
  searchParams: {
    orderId?: string;
  };
};


export default async function SuccessPage({ searchParams }: PageProps) {
  const { orderId } = searchParams;
  const id = Number.parseInt(orderId ?? "", 10);
  if (!Number.isInteger(id) || id <= 0) return notFound();

  const order = await prisma.order.findUnique({
    where: { id }, // Int
    include: { items: true },
  });
  if (!order) return notFound();

  // Parse & guard:

  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-black dark:text-white">
        Order received ✅
      </h1>

      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Order ID: <span className="font-mono">{orderId}</span>
      </p>

      <p className="mt-1 text-zinc-600 dark:text-zinc-400">
        Total:{" "}
        <span className="font-mono">
          {formatNOKFromCents(order.totalCents ?? 0)}
        </span>
      </p>
      <div className="mt-8 rounded-2xl border bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-lg font-semibold text-black dark:text-white">
          Items
        </h2>
        <ul className="mt-3 space-y-3">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-xl border px-4 py-3 dark:border-zinc-800"
            >
              <div>
                <p className="font-medium text-black dark:text-white">
                  {item.name}
                </p>
              </div>

              <div className="text-right">
                <p className="font-medium text-black dark:text-white">
                  {item.name}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Qty: {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-black dark:text-white">
                  {formatNOKFromCents(item.priceCents)}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Line: {formatNOKFromCents(item.priceCents * item.quantity)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

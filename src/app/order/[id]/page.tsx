import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatNOKFromCents } from "@/lib/utils/money";

type PageProps = {
  params: Promise<{ id: string }>;
};

//Se ordre

export default async function OrderPage({ params }: PageProps) {
  const { id } = await params;
  const orderId = Number(id);

  if (!Number.isFinite(orderId)) return notFound();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) return notFound();

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-black dark:text-white">
        Order #{order.id}
      </h1>

      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Status: <span className="font-medium">{order.status}</span>
      </p>

      <div className="mt-8 space-y-3">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div>
              <p className="font-medium text-black dark:text-white">
                {item.name}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Qty: {item.quantity}
              </p>
            </div>

            <p className="font-semibold text-black dark:text-white">
              {formatNOKFromCents(item.priceCents * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-zinc-200 pt-6 text-right dark:border-zinc-800">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Total</p>
        <p className="text-2xl font-bold text-black dark:text-white">
          {formatNOKFromCents(order.totalCents)}
        </p>
      </div>
    </section>
  );
}

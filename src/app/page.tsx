import { storefrontFetch } from "@/lib/shopify/storefront";
import { PRODUCTS_QUERY } from "@/lib/shopify/queries";

type ProductsQuery = {
  shop: { name: string };
  products: { nodes: { id: string; title: string; handle: string }[] };
};

export default async function Page() {
  const data = await storefrontFetch<ProductsQuery>(PRODUCTS_QUERY, { first: 20 });

  return (
    <main>
      <h1>{data.shop.name}</h1>
      <ul>
        {data.products.nodes.map((p) => (
          <li key={p.id}>{p.title}</li>
        ))}
      </ul>
    </main>
  );
}

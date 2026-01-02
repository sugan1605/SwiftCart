import Header from "@/components/layout/Header";
import { getCart } from "@/lib/shopify/cart";

export default async function HeaderServer() {
  const cart = await getCart();
  const shopifyCount = cart?.totalQuantity ?? 0;

  return <Header shopifyCount={shopifyCount} />;
}

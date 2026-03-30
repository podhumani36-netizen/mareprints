import { notFound } from "next/navigation";
import { shopData } from "../../../data/shopdata";
import ProductClient from "./ProductClient";

export async function generateStaticParams() {
  return shopData.map((product) => ({
    id: product.id.toString(),
  }));
}

export default function ProductPage({ params }) {
  const product = shopData.find((p) => p.id === parseInt(params.id));

  if (!product) {
    notFound();
  }

  return <ProductClient product={product} />;
}
         
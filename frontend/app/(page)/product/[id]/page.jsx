import Link from "next/link";
import { notFound } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { shopData } from "../../../data/shopdata";
import ProductClient from "./ProductClient";

export async function generateStaticParams() {
  return shopData.map((product) => ({
    id: product.id.toString(),
  }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const product = shopData.find(
    (item) => item.id === parseInt(resolvedParams.id),
  );

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.name} - Premium Photo Frame`,
    description: product.description,
  };
}

export default async function ProductPage({ params }) {
  const resolvedParams = await params;
  const product = shopData.find(
    (item) => item.id === parseInt(resolvedParams.id),
  );

  if (!product) {
    notFound();
  }

  return <ProductClient product={product} />;
}

import { notFound } from "next/navigation";
import { shopData } from "../../../data/shopdata";
import ProductClientLandscape from "./ProductClientLandscape";
import ProductClientSquare from "./ProductClientSquare";
import ProductClientCutout from "./ProductClientCutout";
import ProductClient from "./ProductClient";
import RounderPortrait from "./RounderPortrait";
import ProductClientCircleAcrylic from "./ProductClientCircleAcrylic";
import ProductClientSquareRoundAcrylic from "./ProductClientSquareRoundAcrylic";
import ProductClientRoundedRectLandscape from "./ProductClientRoundedRectLandscape";
import ProductClientRoundedRectPortrait from "./ProductClientRoundedRectPortrait";

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

  // Determine which component to render based on product type
  const productType = product.type || product.category || "portrait";

  switch (productType.toLowerCase()) {
    case "landscape":
      return <ProductClientLandscape product={product} />;
    case "RounderPortrait":
      return <RounderPortrait product={product} />;
    case "square":
      return <ProductClientSquare product={product} />;
    case "cutout":
      return <ProductClientCutout product={product} />;
    case "circle_acrylic":
      return <ProductClientCircleAcrylic product={product} />;
    case "square_round_acrylic":
      return <ProductClientSquareRoundAcrylic product={product} />;
    case "rounded_rect_landscape":
      return <ProductClientRoundedRectLandscape product={product} />;
    case "rounded_rect_portrait":
      return <ProductClientRoundedRectPortrait product={product} />;
    default:
      return <ProductClient product={product} />;
  }
}

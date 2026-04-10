import { notFound } from "next/navigation";
import { shopData } from "../../../data/shopdata";
import dynamic from "next/dynamic";

// Each component is now a separate JS chunk — only the needed one is downloaded.
// This cuts the per-page JS by ~75% on mobile and prevents OOM tab crashes.
const ProductClient = dynamic(() => import("./ProductClient"), {
  loading: () => (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  ),
});

const ProductClientLandscape = dynamic(() => import("./ProductClientLandscape"), {
  loading: () => (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  ),
});

const ProductClientSquare = dynamic(() => import("./ProductClientSquare"), {
  loading: () => (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  ),
});

const ProductClientCutout = dynamic(() => import("./ProductClientCutout"), {
  loading: () => (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  ),
});

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

  const productType = product.type || product.category || "portrait";

  switch (productType.toLowerCase()) {
    case "landscape":
      return <ProductClientLandscape product={product} />;
    case "square":
      return <ProductClientSquare product={product} />;
    case "cutout":
      return <ProductClientCutout product={product} />;
    default:
      return <ProductClient product={product} />;
  }
}

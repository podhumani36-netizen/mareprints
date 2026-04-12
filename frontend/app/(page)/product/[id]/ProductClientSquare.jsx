"use client";
import ProductClientBase from "./ProductClientBase";

// Fallback constants if product data is missing
const DEFAULT_SIZE_OPTIONS = ["8×8", "10×10", "12×12", "16×16", "20×20", "24×24"];
const DEFAULT_FRAME_DIMENSIONS = {
  "8×8":   { width: 180, height: 180 },
  "10×10": { width: 210, height: 210 },
  "12×12": { width: 240, height: 240 },
  "16×16": { width: 300, height: 300 },
  "20×20": { width: 360, height: 360 },
  "24×24": { width: 420, height: 420 },
};

export default function ProductClientSquare({ product }) {
  const sizeOptions    = product?.sizeOptions    ?? DEFAULT_SIZE_OPTIONS;
  const frameDimensions = product?.frameDimensions ?? DEFAULT_FRAME_DIMENSIONS;
  const defaultSize    = product?.defaultSize    ?? "12×12";
  const basePrice      = product?.basePrice      ?? 849;

  return (
    <ProductClientBase
      sizeOptions={sizeOptions}
      frameDimensions={frameDimensions}
      defaultSize={defaultSize}
      basePrice={basePrice}
      frameRadius="0px"
      productOrientation="square"
      exportWidth={1600}
      exportHeight={1600}
    />
  );
}

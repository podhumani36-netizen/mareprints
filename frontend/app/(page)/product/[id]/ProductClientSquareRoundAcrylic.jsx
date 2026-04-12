"use client";
import ProductClientBase from "./ProductClientBase";

// Fallback constants if product data is missing
const DEFAULT_SIZE_OPTIONS = ["8x8", "10x10", "12x12", "16x16"];
const DEFAULT_FRAME_DIMENSIONS = {
  "8x8":   { width: 160, height: 160 },
  "10x10": { width: 200, height: 200 },
  "12x12": { width: 240, height: 240 },
  "16x16": { width: 320, height: 320 },
};

export default function ProductClientSquareRoundAcrylic({ product }) {
  const sizeOptions     = product?.sizeOptions     ?? DEFAULT_SIZE_OPTIONS;
  const frameDimensions = product?.frameDimensions ?? DEFAULT_FRAME_DIMENSIONS;
  const defaultSize     = product?.defaultSize     ?? "10x10";
  const basePrice       = product?.basePrice       ?? 899;

  return (
    <ProductClientBase
      sizeOptions={sizeOptions}
      frameDimensions={frameDimensions}
      defaultSize={defaultSize}
      basePrice={basePrice}
      frameRadius="24px"
      productOrientation="square_round_acrylic"
      exportWidth={1600}
      exportHeight={1600}
    />
  );
}

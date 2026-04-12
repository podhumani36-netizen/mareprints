"use client";
import ProductClientBase from "./ProductClientBase";

const SIZE_OPTIONS = ["8x8", "10x10", "12x12", "16x16"];
const FRAME_DIMENSIONS = {
  "8x8":   { width: 160, height: 160 },
  "10x10": { width: 200, height: 200 },
  "12x12": { width: 240, height: 240 },
  "16x16": { width: 320, height: 320 },
};

export default function ProductClientSquareRoundAcrylic() {
  return (
    <ProductClientBase
      sizeOptions={SIZE_OPTIONS}
      frameDimensions={FRAME_DIMENSIONS}
      defaultSize="10x10"
      basePrice={899}
      frameRadius="24px"
      productOrientation="square_round_acrylic"
      exportWidth={1600}
      exportHeight={1600}
    />
  );
}

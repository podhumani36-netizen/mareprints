"use client";
import ProductClientBase from "./ProductClientBase";

const SIZE_OPTIONS = ["10x8", "14x11", "20x16", "24x20", "36x24"];
const FRAME_DIMENSIONS = {
  "10x8":  { width: 100, height: 80  },
  "14x11": { width: 140, height: 110 },
  "20x16": { width: 200, height: 160 },
  "24x20": { width: 240, height: 200 },
  "36x24": { width: 360, height: 240 },
};

export default function ProductClientRoundedRectLandscape() {
  return (
    <ProductClientBase
      sizeOptions={SIZE_OPTIONS}
      frameDimensions={FRAME_DIMENSIONS}
      defaultSize="20x16"
      basePrice={549}
      frameRadius="20px"
      productOrientation="rounded_rect_landscape"
      exportWidth={2000}
      exportHeight={1600}
    />
  );
}

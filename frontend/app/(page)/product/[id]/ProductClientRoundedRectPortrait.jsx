"use client";
import ProductClientBase from "./ProductClientBase";

const SIZE_OPTIONS = ["8x10", "11x14", "16x20", "20x24", "24x36"];
const FRAME_DIMENSIONS = {
  "8x10":  { width: 80,  height: 100 },
  "11x14": { width: 110, height: 140 },
  "16x20": { width: 160, height: 200 },
  "20x24": { width: 200, height: 240 },
  "24x36": { width: 240, height: 360 },
};

export default function ProductClientRoundedRectPortrait() {
  return (
    <ProductClientBase
      sizeOptions={SIZE_OPTIONS}
      frameDimensions={FRAME_DIMENSIONS}
      defaultSize="16x20"
      basePrice={549}
      frameRadius="20px"
      productOrientation="rounded_rect_portrait"
      exportWidth={1600}
      exportHeight={2000}
    />
  );
}

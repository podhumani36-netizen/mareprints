"use client";

import Accordion from "../Components/Accordion";
import Hero from "../Components/homeComponents/banner";
import Products from "../Components/products";
import Newsletter from "../Components/Newsletter";
import "../assest/style/Landingpage.css";
import { shopData } from "../data/shopdata";

// ── Row 1: Photo frame products (portrait, landscape, rounded variants) ──────
const photoFrameProducts = shopData.filter((p) =>
  ["portrait", "rounded_rect_portrait","cutout" ].includes(p.type)
);
// const photoFrameProducts = shopData.filter((p) =>
//   ["portrait", "rounded_rect_portrait","circle_acrylic","cutout" ].includes(p.type)
// );
// ── Row 2: Acrylic shape prints ───────────────────────────────────────────────
const acrylicShapeProducts = shopData.filter((p) =>
  [ "landscape","rounded_rect_landscape", "square_round_acrylic", ].includes(p.type)
);
// const acrylicShapeProducts = shopData.filter((p) =>
//   [ "landscape","rounded_rect_landscape", "square_round_acrylic", "square", ].includes(p.type)
// );
// ── Row 3: Special & collage frames ──────────────────────────────────────────
// const specialFrameProducts = shopData.filter((p) =>
//   ["heart_frame", "collage_frame", "png_frame"].includes(p.type)
// );

const faqData = [
  {
    id: "shipping",
    title: "How long does shipping take?",
    content:
      "Standard shipping for Acrylic and Canvas prints takes 5–7 business days. Express delivery options are available at checkout.",
  },
  {
    id: "acrylic-quality",
    title: "What is the quality of the Acrylic frames?",
    content:
      "We use premium 5mm thick acrylic with UV-resistant printing technology for crystal-clear clarity and long-lasting durability.",
  },
  {
    id: "canvas-material",
    title: "What material is used for Canvas prints?",
    content:
      "Our canvas prints are made using high-quality cotton-blend canvas stretched over durable wooden frames for a gallery-style finish.",
  },
  {
    id: "custom-orders",
    title: "Can I request custom sizes?",
    content:
      "Absolutely! We specialize in custom orders. Contact our design team with your specifications, and we'll create a perfect piece for your space.",
  },
  {
    id: "returns",
    title: "What is your return policy?",
    content:
      "We offer a 30-day satisfaction guarantee. If you're not completely happy with your purchase, we'll work with you to make it right.",
  },
  {
    id: "why-us",
    title: "Why do we have to buy your product?",
    content:
      "While there are many options in the market, what sets us apart is our attention to detail, faster execution, and commitment to quality. We focus on long-term results rather than short-term fixes, which ultimately gives you better returns.",
  },
];

export default function Home() {
  return (
    <div>
      <Hero />

      <div className="container">
        {/* Row 1 — Photo Frames: portrait, landscape, rounded variants */}
        <div className="row mt-5">
          <div className="col-12 mb-3">
            <h2 className="fw-bold">Framed Acrylic Photo Prints</h2>
          </div>
          <div className="col-12">
            <Products data={photoFrameProducts} limit={4} link="/product" />
          </div>
        </div>

        {/* Row 2 — Acrylic Shapes: circle, square, square-round, cutout */}
        <div className="row mt-5">
          <div className="col-12 mb-3">
            <h2 className="fw-bold">Acrylic Shape Prints</h2>
          </div>
          <div className="col-12">
            <Products data={acrylicShapeProducts} limit={4} link="/product" />
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="container-fluid mt-5">
        <section className="cyber-newsletter">
          <Newsletter />
        </section>
      </div>

      {/* Row 3 — Special Frames */}
      {/* <div className="container">
        <div className="row mt-5">
          <div className="col-12 mb-3">
            <h2 className="fw-bold">Special Collection</h2>
          </div>
          <div className="col-12">
            <Products data={specialFrameProducts} limit={4} link="/product" />
          </div>
        </div>
      </div> */}

      {/* FAQ */}
      <div className="container-fluid mt-5">
        <section className="faq-terminal">
          <div className="container">
            <div className="terminal-header">
              <h2 className="terminal-title">
                Frequently Asked <span className="brand-blue">Queries</span>
              </h2>
            </div>
            <div className="terminal-window">
              <div className="terminal-bar">
                <span className="terminal-dot red"></span>
                <span className="terminal-dot yellow"></span>
                <span className="terminal-dot green"></span>
                <span className="terminal-prompt">
                  <span style={{ color: "var(--mare-blue)" }}>faq@mareenterprise</span>
                </span>
              </div>
              <div className="terminal-content">
                <Accordion items={faqData} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

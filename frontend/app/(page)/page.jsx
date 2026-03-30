"use client";

import { useState, useEffect } from "react";
import Accordion from "../Components/Accordion";
import Hero from "../Components/homeComponents/banner";
import Products from "../Components/products";
import Newsletter from "../Components/Newsletter";
import "../assest/style/Landingpage.css";
import { shopData } from "../data/shopdata";

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
    id: "return",
    title: " Why do we have to buy your product?",
    content:
      "While there are many options in the market, what sets us apart is our attention to detail, faster execution, and commitment to quality. We focus on long-term results rather than short-term fixes, which ultimately gives you better returns.",
  },
];

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 30,
      });
    };

    const handleScroll = () => {
      const scrollPercent =
        window.scrollY /
        (document.documentElement.scrollHeight - window.innerHeight);
      setScrollProgress(scrollPercent);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div>
      <Hero />

      <div className="futuristic-home container">
        <div className="row">
          <div className="col-12"></div>
        </div>

        <div className="row">
          <div className="col-12">
            <h2>Framed Acrylic Photo Portrait</h2>
            <Products
              title="Portrait"
              data={
                shopData.find((item) => item.type === "Portrait")?.data || []
              }
              limit={8}
              link="/product"
            />
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-12">
            <h2>Framed Acrylic Photo Landscape</h2>
            <Products
              title="Landscape"
              data={shopData[1].data}
              limit={4}
              link="/product"
            />
          </div>
        </div>
      </div>

      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <section className="cyber-newsletter">
              <Newsletter />
            </section>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row mt-4">
          <div className="col-12">
            <h2>Framed Acrylic Photo Cutout</h2>
            <Products title="Cutout" data={shopData[2].data} limit={4} />
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-12 d-none">
            <h2>Framed Acrylic Photo Nameplate</h2>
            <Products title="Nameplate" data={shopData[3].data} limit={4} />
          </div>
        </div>
      </div>

      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
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
                      <span style={{ color: "var(--mare-blue)" }}>
                        faq@mareenterprise
                      </span>
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
      </div>
    </div>
  );
}

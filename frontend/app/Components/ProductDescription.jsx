"use client";

import "bootstrap-icons/font/bootstrap-icons.css";

export default function ProductDescription({ orientation = "portrait" }) {
  const productContent = {
    portrait: {
      title: "Luxury Acrylic Portrait Photo Frame - Museum-Quality Wall Art",
      material: "Premium Cast Acrylic",
      finish: "Crystal Clear, High-Gloss",
      shape: "Rectangular",
      sizes: "24×36, 20×30, 20×24, 18×22, 16×18, 12×16, 10×12, 8×10 inches",
      intro:
        "Exquisite Craftsmanship. Timeless Memories. Elevate your most cherished moments.",
      description:
        "Transform your treasured photographs into sophisticated statement pieces. Designed to preserve life’s finest memories with elegance and refinement.",
    },
    landscape: {
      title: "Luxury Acrylic Landscape Photo Frame - Museum-Quality Wall Art",
      material: "Premium Cast Acrylic",
      finish: "Crystal Clear, High-Gloss",
      shape: "Rectangular",
      sizes: "24×36, 20×30, 20×24, 18×22, 16×18, 12×16, 10×12, 8×10 inches",
      intro:
        "Exquisite Craftsmanship. Timeless Memories. Elevate your most cherished moments.",
      description:
        "Transform your treasured photographs into sophisticated statement pieces. Designed to preserve life’s finest memories with elegance and refinement.",
    },
    circle: {
      title: "Luxury Acrylic Round Frame Collection",
      material: "Premium Cast Acrylic",
      finish: "Crystal Clear, High-Gloss",
      shape: "Round",
      sizes: "22×22, 18×18, 15×15, 12×12 inches",
      intro:
        "Where Elegance Meets Emotion. Preserve life’s most beautiful moments.",
      description:
        "Transform your cherished memories into timeless works of art. Designed to capture emotion and display it with refined sophistication.",
    },
    square: {
      title: "Luxury Acrylic Square Frame Collection",
      material: "Premium Cast Acrylic",
      finish: "Crystal Clear, High-Gloss",
      shape: "Square",
      sizes: "22×22, 18×18, 15×15, 12×12 inches",
      intro:
        "Where Elegance Meets Emotion. Preserve life’s most beautiful moments.",
      description:
        "Transform your cherished memories into timeless works of art. Designed to capture emotion and display it with refined sophistication.",
    },
    heart: {
      title: "Luxury Acrylic Heart Frame Collection",
      material: "Premium Cast Acrylic",
      finish: "Crystal Clear, High-Gloss",
      shape: "Heart",
      sizes: "22×22, 18×18, 15×15, 12×12 inches",
      intro:
        "Where Elegance Meets Emotion. Preserve life’s most beautiful moments.",
      description:
        "Transform your cherished memories into timeless works of art. Designed to capture emotion and display it with refined sophistication.",
    },
  };

  const data = productContent[orientation] || productContent.portrait;

  const highlights = [
    "Premium Cast Acrylic",
    "Crystal Clear High Gloss Finish",
    "Ultra HD Printing",
    "Scratch Resistant Surface",
    "Easy Wall Mount Installation",
  ];

  const features = [
    {
      title: "Museum-Grade Acrylic",
      desc: "Meticulously crafted from superior cast acrylic, offering exceptional optical clarity and a glass-like brilliance while being durable and shatter-resistant.",
      icon: "bi-gem",
    },
    {
      title: "Ultra HD Printing",
      desc: "Experience gallery-quality visuals with remarkable depth, vibrant color accuracy, and fade-resistant longevity.",
      icon: "bi-image",
    },
    {
      title: "Scratch-Resistant Finish",
      desc: "Engineered with a premium protective surface that resists scratches and maintains a polished appearance over time.",
      icon: "bi-shield-check",
    },
    {
      title: "Crystal-Clear Brilliance",
      desc: "A sleek frameless aesthetic that enhances every detail and complements modern luxury interiors.",
      icon: "bi-stars",
    },
  ];

  const whyChooseUs = [
    "Direct Manufacturer",
    "12+ Years Experience",
    "Premium Quality Materials",
    "Precision Cutting & Engraving",
    "Fast Turnaround Time",
    "Best Pricing",
  ];

  return (
    <section
      style={{
        marginTop: "32px",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "24px",
        padding: "clamp(18px, 3vw, 32px)",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          border: "1px solid #e5e7eb",
          padding: "clamp(18px, 3vw, 28px)",
          boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: "800",
            color: "#0f172a",
            lineHeight: 1.2,
            marginBottom: "10px",
          }}
        >
          {data.title}
        </h2>

        <p
          style={{
            fontSize: "clamp(15px, 2vw, 18px)",
            color: "#334155",
            lineHeight: 1.8,
            marginBottom: "10px",
          }}
        >
          {data.intro}
        </p>

        <p
          style={{
            fontSize: "15px",
            color: "#64748b",
            lineHeight: 1.8,
            marginBottom: "22px",
          }}
        >
          {data.description}
        </p>

        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "grid",
            gap: "12px",
          }}
        >
          {highlights.map((item, index) => (
            <li
              key={index}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                fontSize: "clamp(15px, 2vw, 17px)",
                color: "#1e293b",
                lineHeight: 1.6,
              }}
            >
              <i
                className="bi bi-check-circle-fill"
                style={{
                  color: "#16a34a",
                  fontSize: "18px",
                  marginTop: "3px",
                  flexShrink: 0,
                }}
              ></i>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div
        style={{
          marginTop: "24px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
        }}
      >
        <div style={infoCardStyle}>
          <div style={infoLabelStyle}>Material</div>
          <div style={infoValueStyle}>{data.material}</div>
        </div>

        <div style={infoCardStyle}>
          <div style={infoLabelStyle}>Finish</div>
          <div style={infoValueStyle}>{data.finish}</div>
        </div>

        <div style={infoCardStyle}>
          <div style={infoLabelStyle}>Shape</div>
          <div style={infoValueStyle}>{data.shape}</div>
        </div>

        <div style={infoCardStyle}>
          <div style={infoLabelStyle}>Available Sizes</div>
          <div style={infoValueStyle}>{data.sizes}</div>
        </div>
      </div>

      <div style={{ marginTop: "28px" }}>
        <h3
          style={{
            fontSize: "24px",
            fontWeight: "800",
            color: "#0f172a",
            marginBottom: "16px",
          }}
        >
          Key Features
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "16px",
          }}
        >
          {features.map((item, index) => (
            <div key={index} style={featureCardStyle}>
              <div style={featureIconWrapStyle}>
                <i className={`bi ${item.icon}`}></i>
              </div>
              <h4
                style={{
                  fontSize: "17px",
                  fontWeight: "700",
                  color: "#0f172a",
                  marginBottom: "8px",
                }}
              >
                {item.title}
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "#64748b",
                  lineHeight: 1.7,
                }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          marginTop: "28px",
          background: "linear-gradient(135deg, #eff6ff, #f8fbff)",
          border: "1px solid #dbeafe",
          borderRadius: "20px",
          padding: "22px",
        }}
      >
        <h3
          style={{
            fontSize: "24px",
            fontWeight: "800",
            color: "#0f172a",
            marginBottom: "14px",
          }}
        >
          Why Choose MARE Prints
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
          }}
        >
          {whyChooseUs.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "#ffffff",
                border: "1px solid #dbeafe",
                borderRadius: "14px",
                padding: "14px 16px",
                color: "#1e3a8a",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              <i
                className="bi bi-check-circle-fill"
                style={{ color: "#2563eb", fontSize: "16px", flexShrink: 0 }}
              ></i>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          marginTop: "28px",
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "20px",
          padding: "22px",
        }}
      >
        <h3
          style={{
            fontSize: "24px",
            fontWeight: "800",
            color: "#0f172a",
            marginBottom: "16px",
          }}
        >
          Shipping Information
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px",
          }}
        >
          <div style={shippingCardStyle}>
            <strong style={shippingTitleStyle}>Processing Time</strong>
            <p style={shippingTextStyle}>2–5 business days</p>
          </div>

          <div style={shippingCardStyle}>
            <strong style={shippingTitleStyle}>Chennai Delivery</strong>
            <p style={shippingTextStyle}>3–5 days</p>
          </div>

          <div style={shippingCardStyle}>
            <strong style={shippingTitleStyle}>Tamil Nadu</strong>
            <p style={shippingTextStyle}>5–7 days</p>
          </div>

          <div style={shippingCardStyle}>
            <strong style={shippingTitleStyle}>Rest of India</strong>
            <p style={shippingTextStyle}>5–10 days</p>
          </div>
        </div>
      </div>
    </section>
  );
}

const infoCardStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "18px",
  padding: "18px",
  boxShadow: "0 4px 14px rgba(15,23,42,0.03)",
};

const infoLabelStyle = {
  fontSize: "13px",
  color: "#64748b",
  marginBottom: "6px",
  fontWeight: "600",
};

const infoValueStyle = {
  fontSize: "15px",
  color: "#0f172a",
  fontWeight: "700",
  lineHeight: 1.7,
};

const featureCardStyle = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "18px",
  padding: "20px",
  boxShadow: "0 4px 14px rgba(15,23,42,0.04)",
};

const featureIconWrapStyle = {
  width: "46px",
  height: "46px",
  borderRadius: "12px",
  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#ffffff",
  fontSize: "18px",
  marginBottom: "12px",
};

const shippingCardStyle = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "18px",
};

const shippingTitleStyle = {
  display: "block",
  fontSize: "15px",
  color: "#0f172a",
  marginBottom: "8px",
};

const shippingTextStyle = {
  margin: 0,
  fontSize: "14px",
  color: "#64748b",
  lineHeight: 1.7,
};
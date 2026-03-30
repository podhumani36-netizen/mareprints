"use client";

import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import styles from "../assest/style/Products.module.css";
import { shopData } from "../data/shopdata";
import { useCart } from "../context/CartContext";
import { useState, useEffect } from "react";

const Products = ({
  limit = null,
  title = "",
  link = "",
  data = null,
  type = null,
}) => {
  const { addToCart } = useCart();
  const [addedItems, setAddedItems] = useState({});
  const [toasts, setToasts] = useState([]);

  const getDisplayData = () => {
    let result = [];

    if (data && Array.isArray(data)) {
      result = data;
    } else if (type) {
      result = shopData.filter((item) => item.type === type);
    } else {
      result = shopData;
    }

    return limit ? result.slice(0, limit) : result;
  };

  const displayData = getDisplayData();

  const toastColors = {
    success: "#10b981",
    info: "#3b82f6",
    warning: "#f59e0b",
    error: "#ef4444",
  };

  const addToast = (type, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleAddToCart = (item, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(item);

    setAddedItems((prev) => ({ ...prev, [item.id]: true }));
    addToast("success", `✨ ${item.name} added to cart! 🛒`);

    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  const handleCustomize = (item, e) => {
    e.preventDefault();
    e.stopPropagation();
    localStorage.setItem("selectedProduct", JSON.stringify(item));
    addToast("info", `🎨 Starting customization for ${item.name}`);

    setTimeout(() => {
      window.location.href = `${link}/${item.id}`;
    }, 800);
  };

  const ToastContainer = () => {
    useEffect(() => {
      const style = document.createElement("style");
      style.innerHTML = `
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3) translateX(100%);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.05) translateX(-10px);
          }
          70% {
            transform: scale(0.95) translateX(5px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateX(0);
          }
        }

        @keyframes fadeOut {
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `;
      document.head.appendChild(style);

      return () => {
        document.head.removeChild(style);
      };
    }, []);

    return (
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              minWidth: "320px",
              maxWidth: "380px",
              animation:
                "bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards",
              pointerEvents: "all",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                padding: "16px 20px",
                boxShadow:
                  "0 20px 40px rgba(0,0,0,0.15), 0 5px 15px rgba(0,0,0,0.1)",
                border: "1px solid rgba(0,0,0,0.05)",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                gap: "15px",
                borderLeft: `6px solid ${toastColors[toast.type]}`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "100px",
                  height: "100%",
                  background: `linear-gradient(90deg, transparent, ${toastColors[toast.type]}15)`,
                  pointerEvents: "none",
                }}
              />

              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: toastColors[toast.type],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 10px 20px -5px ${toastColors[toast.type]}80`,
                  animation: "pulse 2s infinite",
                  flexShrink: 0,
                }}
              >
                {toast.type === "success" && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {toast.type === "info" && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="white"
                      strokeWidth="2"
                      fill="none"
                    />
                    <path
                      d="M12 8V12M12 16H12.01"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {toast.type === "warning" && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 9V13M12 17H12.01M5.31171 20H18.6883C20.457 20 21.5816 18.0831 20.6841 16.541L14.0457 5.07926C13.1495 3.53979 10.8505 3.53979 9.95428 5.07926L3.31586 16.541C2.41841 18.0831 3.543 20 5.31171 20Z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                )}
                {toast.type === "error" && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="white"
                      strokeWidth="2"
                      fill="none"
                    />
                    <path
                      d="M15 9L9 15M9 9L15 15"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    margin: 0,
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "#1e293b",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    textTransform: "capitalize",
                  }}
                >
                  {toast.type === "success" && "🎉 Success!"}
                  {toast.type === "info" && "ℹ️ Information"}
                  {toast.type === "warning" && "⚠️ Warning"}
                  {toast.type === "error" && "❌ Error"}
                </div>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "13px",
                    color: "#64748b",
                    lineHeight: "1.5",
                  }}
                >
                  {toast.message}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeToast(toast.id);
                }}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#f1f5f9",
                  color: "#64748b",
                  fontSize: "16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                  position: "relative",
                  zIndex: 2,
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#e2e8f0";
                  e.currentTarget.style.transform = "rotate(90deg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f1f5f9";
                  e.currentTarget.style.transform = "rotate(0deg)";
                }}
              >
                ✕
              </button>

              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  height: "4px",
                  background: toastColors[toast.type],
                  animation: "progress 5s linear forwards",
                  opacity: 0.3,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.animationPlayState = "paused";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.animationPlayState = "running";
                }}
              />
            </div>
          </div>
        ))}

        <style>{`
          @media (max-width: 768px) {
            div[style*="position: fixed"] {
              top: 10px;
              right: 10px;
              left: 10px;
            }

            div[style*="min-width: 320px"] {
              min-width: auto;
              width: 100%;
            }
          }
        `}</style>
      </div>
    );
  };

  if (displayData.length === 0) {
    return null;
  }

  return (
    <section className="container py-2">
      <ToastContainer />
      <div className="row g-4">
        {displayData.map((item) => (
          <div key={item.id} className="col-12 col-md-6 col-lg-3">
            <Link
              href={`${link}/${item.id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                className={`card ${styles.cardWrapper}`}
                style={{
                  "--theme-color": item.themeColor,
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  height: "100%",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-10px)";
                  e.currentTarget.style.boxShadow =
                    "0 20px 40px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div className={`${styles.diamondBg} ${styles.topDiamond}`} />
                <div
                  className={`${styles.diamondBg} ${styles.bottomDiamond}`}
                />

                <div className={styles.contentOverlay}>
                  <div className={styles.imageContainer}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className={`${styles.productImage} img-fluid`}
                      style={{
                        transition: "transform 0.3s ease",
                        width: "100%",
                        height: "auto",
                        borderRadius: "8px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    />
                  </div>

                  <div className="mt-4">
                    <div className={styles.textGroup}>
                      <span className={styles.typeLabel}>
                        <i className="bi bi-tag-fill me-1"></i>
                        {item.type} · {item.color || "Standard"}
                      </span>
                      <h3 className={styles.productName}>{item.name}</h3>
                      <p className={styles.productMaterial}>
                        {item.description || item.material}
                      </p>
                      {item.price && (
                        <p className={styles.productPrice}>₹{item.price}</p>
                      )}
                    </div>

                    <div className="d-flex justify-content-between align-items-center gap-2 mt-3">
                      <button
                        className={styles.customizeButton}
                        onClick={(e) => handleCustomize(item, e)}
                        style={{
                          background: "#000",
                          color: "white",
                          border: "none",
                          borderRadius: "50px",
                          padding: "8px 16px",
                          fontSize: "14px",
                          fontWeight: "600",
                          transition: "all 0.3s ease",
                          flex: 1,
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow =
                            "0 10px 20px -5px rgba(16,185,129,0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <i className="bi bi-pencil-square me-1"></i>
                        Customize
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Products;

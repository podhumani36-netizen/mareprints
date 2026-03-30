"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useCart } from "../../context/CartContext";

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [removingItemId, setRemovingItemId] = useState(null);
  const [toasts, setToasts] = useState([]);

  // New color scheme
  const primaryColor = "rgb(44, 127, 184)";
  const primaryGradient = `linear-gradient(135deg, ${primaryColor} 0%, rgba(34, 98, 142, 1) 100%)`;
  const primaryLight = "rgba(44, 127, 184, 0.1)";
  const primaryMedium = "rgba(44, 127, 184, 0.5)";

  const PROMO_CODES = {
    FRAME10: 0.1,
    FRAME20: 0.2,
    WELCOME15: 0.15,
    FREESHIP: { type: "freeshipping", value: 0 },
  };

  // Toast functions with bounce animation
  const addToast = (type, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [
      ...prev,
      { id, type, message, animation: "bounceIn" },
    ]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((toast) =>
          toast.id === id ? { ...toast, animation: "fadeOut" } : toast,
        ),
      );

      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 300);
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id ? { ...toast, animation: "fadeOut" } : toast,
      ),
    );

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 300);
  };

  const handleQuantityChange = (id, newQuantity) => {
    updateQuantity(id, parseInt(newQuantity));
    addToast("info", "📦 Quantity updated successfully");
  };

  const handleRemoveItem = (id, itemName) => {
    setRemovingItemId(id);
    setTimeout(() => {
      removeFromCart(id);
      setRemovingItemId(null);
      addToast("warning", `🗑️ ${itemName} removed from cart`);
    }, 300);
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      addToast("error", "⚠️ Please enter a promo code");
      return;
    }

    setIsApplyingPromo(true);
    setPromoError("");

    setTimeout(() => {
      const code = promoCode.toUpperCase().trim();

      if (PROMO_CODES[code]) {
        const promoValue = PROMO_CODES[code];
        if (
          typeof promoValue === "object" &&
          promoValue.type === "freeshipping"
        ) {
          setDiscount("freeshipping");
          setPromoError("");
          addToast("success", "🎉 Free shipping applied successfully! 🚚");
        } else {
          const discountAmount = calculateCartTotal() * promoValue;
          setDiscount(discountAmount);
          setPromoError("");
          addToast(
            "success",
            `✨ Promo code ${code} applied! You saved ₹${discountAmount.toFixed(2)} 💰`,
          );
        }
        setPromoCode("");
      } else {
        setPromoError("Invalid promo code");
        addToast("error", "❌ Invalid promo code. Please try again.");
        setDiscount(0);
      }
      setIsApplyingPromo(false);
    }, 1000);
  };

  const handleClearCart = () => {
    clearCart();
    setShowClearModal(false);
    addToast("warning", "🧹 Cart cleared successfully");
  };

  const calculateItemPrice = (item) => {
    let price = parseFloat(item.price);
    const sizeOptions = ["12x9", "16x12", "18x12", "21x15", "30x20", "35x23"];

    if (item.acrylicSize) {
      const sizeIndex = sizeOptions.indexOf(item.acrylicSize);
      if (sizeIndex > 2) price += (sizeIndex - 2) * 10;
    }
    if (item.acrylicThickness === "5mm") price += 15;

    return price * (item.quantity || 1);
  };

  const calculateCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + calculateItemPrice(item),
      0,
    );
  };

  const getSizeUpcharge = (item) => {
    const sizeOptions = ["12x9", "16x12", "18x12", "21x15", "30x20", "35x23"];
    if (!item.acrylicSize) return 0;
    const sizeIndex = sizeOptions.indexOf(item.acrylicSize);
    return sizeIndex > 2 ? (sizeIndex - 2) * 10 : 0;
  };

  const finalTotal =
    calculateCartTotal() - (typeof discount === "number" ? discount : 0);
  const shipping = discount === "freeshipping" || finalTotal > 8500 ? 0 : 7.99;
  const grandTotal = finalTotal + shipping;

  const ToastContainer = () => (
    <div
      style={{
        position: "fixed",
        top: "190px",
        right: "20px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            minWidth: "350px",
            maxWidth: "400px",
            animation:
              toast.animation === "bounceIn"
                ? "bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards"
                : "fadeOut 0.3s ease forwards",
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
              borderLeft: `6px solid ${
                toast.type === "success"
                  ? primaryColor
                  : toast.type === "info"
                    ? "#3b82f6"
                    : toast.type === "warning"
                      ? "#f59e0b"
                      : "#ef4444"
              }`,
            }}
          >
            {/* Background Pattern */}
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "100px",
                height: "100%",
                background: `linear-gradient(90deg, transparent, ${
                  toast.type === "success"
                    ? "rgba(44, 127, 184, 0.05)"
                    : toast.type === "info"
                      ? "rgba(59,130,246,0.05)"
                      : toast.type === "warning"
                        ? "rgba(245,158,11,0.05)"
                        : "rgba(239,68,68,0.05)"
                })`,
                pointerEvents: "none",
              }}
            />

            {/* Icon Container */}
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: `${
                  toast.type === "success"
                    ? primaryColor
                    : toast.type === "info"
                      ? "#3b82f6"
                      : toast.type === "warning"
                        ? "#f59e0b"
                        : "#ef4444"
                }`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 10px 20px -5px ${
                  toast.type === "success"
                    ? "rgba(44, 127, 184, 0.3)"
                    : toast.type === "info"
                      ? "rgba(59,130,246,0.3)"
                      : toast.type === "warning"
                        ? "rgba(245,158,11,0.3)"
                        : "rgba(239,68,68,0.3)"
                }`,
                animation: "pulse 2s infinite",
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

            {/* Content */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  margin: 0,
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#1e293b",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {toast.type === "success" && "Order Update"}
                {toast.type === "info" && "ℹInformation"}
                {toast.type === "warning" && "Attention"}
                {toast.type === "error" && "Error"}
              </div>
              <p
                style={{
                  margin: "4px 0 0 0",
                  fontSize: "14px",
                  color: "#64748b",
                  lineHeight: "1.5",
                }}
              >
                {toast.message}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                border: "none",
                background: "#f1f5f9",
                color: "#64748b",
                fontSize: "18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
                position: "relative",
                zIndex: 2,
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

            {/* Progress Bar */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                height: "4px",
                background: `${
                  toast.type === "success"
                    ? primaryColor
                    : toast.type === "info"
                      ? "#3b82f6"
                      : toast.type === "warning"
                        ? "#f59e0b"
                        : "#ef4444"
                }`,
                animation: "progress 5s linear forwards",
                opacity: 0.3,
              }}
            />
          </div>
        </div>
      ))}

      <style jsx>{`
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
          0%,
          100% {
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
      `}</style>
    </div>
  );

  const EmptyCartView = () => (
    <div className="container py-5">
      <ToastContainer />
      <div className="text-center py-5">
        <div
          className="mb-4"
          style={{ animation: "float 3s ease-in-out infinite" }}
        >
          <i
            className="bi bi-cart-x"
            style={{ fontSize: "5rem", color: "#94a3b8" }}
          ></i>
        </div>
        <h2
          className="display-6 mb-3"
          style={{ color: "#1e293b", fontWeight: "700" }}
        >
          Your Cart is Empty
        </h2>
        <p className="text-muted lead mb-4" style={{ color: "#64748b" }}>
          Looks like you haven't added any frames to your collection yet.
        </p>
        <Link
          href="/shop"
          className="btn btn-lg px-5 py-3 shadow-sm"
          style={{
            background: primaryGradient,
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontWeight: "600",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05) translateY(-2px)";
            e.currentTarget.style.boxShadow = `0 20px 30px -10px ${primaryColor}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1) translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <i className="bi bi-shop me-2"></i>
          Start Shopping
        </Link>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );

  if (cartItems.length === 0) {
    return <EmptyCartView />;
  }

  return (
    <div className="container py-5">
      <ToastContainer />

      {/* Clear Cart Modal */}
      {showClearModal && (
        <div
          className="modal show d-block"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1050,
            backdropFilter: "blur(4px)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content border-0"
              style={{ borderRadius: "20px", overflow: "hidden" }}
            >
              <div
                style={{
                  background: primaryGradient,
                  padding: "20px 24px",
                  color: "white",
                }}
              >
                <h5 className="modal-title" style={{ fontWeight: "700" }}>
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Clear Cart
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowClearModal(false)}
                  style={{ position: "absolute", top: "20px", right: "20px" }}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="text-center mb-3">
                  <i
                    className="bi bi-cart-x"
                    style={{ fontSize: "4rem", color: primaryColor }}
                  ></i>
                </div>
                <p
                  className="text-center mb-2 fs-5"
                  style={{ color: "#1e293b", fontWeight: "600" }}
                >
                  Are you sure you want to remove all items?
                </p>
                <p className="text-center mb-0" style={{ color: "#64748b" }}>
                  This action will remove all {cartItems.length} items from your
                  cart.
                </p>
                <div
                  style={{
                    background: "#fef3c7",
                    border: "1px solid #fcd34d",
                    borderRadius: "12px",
                    padding: "12px",
                    marginTop: "20px",
                    color: "#92400e",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <i className="bi bi-info-circle-fill"></i>
                  This action cannot be undone.
                </div>
              </div>
              <div className="modal-footer border-0 p-4">
                <button
                  className="btn px-4"
                  onClick={() => setShowClearModal(false)}
                  style={{
                    background: "#f1f5f9",
                    color: "#64748b",
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px 24px",
                    fontWeight: "600",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#e2e8f0")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#f1f5f9")
                  }
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Cancel
                </button>
                <button
                  className="btn px-4"
                  onClick={handleClearCart}
                  style={{
                    background: primaryGradient,
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px 24px",
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = `0 10px 20px -5px ${primaryColor}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <i className="bi bi-trash3 me-2"></i>
                  Clear All Items
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2
            className="display-6 mb-0"
            style={{ color: "#1e293b", fontWeight: "700" }}
          >
            Shopping Cart
          </h2>
          <p className="text-muted mb-0" style={{ color: "#64748b" }}>
            Review and manage your items
          </p>
        </div>
        <span
          className="rounded-pill px-4 py-3 fs-6"
          style={{
            background: primaryGradient,
            color: "white",
            fontWeight: "600",
          }}
        >
          {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="vstack gap-3">
            {cartItems.map((item, index) => (
              <div
                key={item.id}
                className="card border-0"
                style={{
                  borderRadius: "20px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                  animation: "slideInUp 0.5s ease forwards",
                  animationDelay: `${index * 0.1}s`,
                  opacity: removingItemId === item.id ? 0 : 1,
                  transition: "all 0.3s ease",
                  border: "1px solid #f1f5f9",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = `0 20px 40px ${primaryLight}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 30px rgba(0,0,0,0.05)";
                }}
              >
                <div className="card-body p-4">
                  <div className="row align-items-center">
                    <div className="col-md-2">
                      <div className="position-relative">
                        <img
                          src={item.uploadedImage || item.image}
                          alt={item.name}
                          className="img-fluid rounded-3"
                          style={{
                            maxHeight: "80px",
                            width: "100%",
                            objectFit: "cover",
                            borderRadius: "12px",
                          }}
                        />
                        {item.uploadedImage && (
                          <span
                            className="position-absolute top-0 start-0 badge"
                            style={{
                              background: primaryColor,
                              color: "white",
                              borderRadius: "8px",
                            }}
                          >
                            <i className="bi bi-camera"></i>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <h5
                        className="mb-1"
                        style={{ color: "#1e293b", fontWeight: "600" }}
                      >
                        {item.name}
                      </h5>
                      <div className="d-flex flex-wrap gap-2 mb-2">
                        <span
                          className="badge"
                          style={{
                            background: "#f1f5f9",
                            color: "#64748b",
                            padding: "6px 12px",
                          }}
                        >
                          <i className="bi bi-brush me-1"></i>
                          {item.type}
                        </span>
                        <span
                          className="badge"
                          style={{
                            background: "#f1f5f9",
                            color: "#64748b",
                            padding: "6px 12px",
                          }}
                        >
                          <i className="bi bi-palette me-1"></i>
                          {item.color}
                        </span>
                        <span
                          className="badge"
                          style={{
                            background: "#f1f5f9",
                            color: "#64748b",
                            padding: "6px 12px",
                          }}
                        >
                          <i className="bi bi-rulers me-1"></i>
                          {item.size}
                        </span>
                      </div>

                      <div className="d-flex flex-wrap gap-2">
                        {item.acrylicSize && (
                          <small
                            style={{ color: primaryColor, fontWeight: "500" }}
                          >
                            <i className="bi bi-arrows-angle-expand me-1"></i>
                            {item.acrylicSize}
                          </small>
                        )}
                        {item.acrylicThickness && (
                          <small
                            style={{ color: primaryColor, fontWeight: "500" }}
                          >
                            <i className="bi bi-layers me-1"></i>
                            {item.acrylicThickness}
                          </small>
                        )}
                      </div>

                      {(item.acrylicSize !== "12x9" ||
                        item.acrylicThickness === "5mm") && (
                        <div className="mt-2">
                          <small style={{ color: "#64748b" }}>
                            Base: ₹{parseFloat(item.price).toFixed(2)}
                            {getSizeUpcharge(item) > 0 && (
                              <> + Size: ₹{getSizeUpcharge(item).toFixed(2)}</>
                            )}
                            {item.acrylicThickness === "5mm" && (
                              <> + Thickness: ₹15.00</>
                            )}
                          </small>
                        </div>
                      )}
                    </div>

                    <div className="col-md-4">
                      <div className="d-flex flex-column align-items-end">
                        <h4
                          style={{
                            color: primaryColor,
                            fontWeight: "700",
                            marginBottom: "8px",
                          }}
                        >
                          ₹{calculateItemPrice(item).toFixed(2)}
                        </h4>

                        <div className="d-flex align-items-center gap-2">
                          <select
                            className="form-select form-select-sm"
                            style={{
                              width: "80px",
                              borderRadius: "10px",
                              border: "1px solid #e2e8f0",
                              padding: "8px",
                            }}
                            value={item.quantity || 1}
                            onChange={(e) =>
                              handleQuantityChange(item.id, e.target.value)
                            }
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                              <option key={num} value={num}>
                                {num}
                              </option>
                            ))}
                          </select>

                          <button
                            className="btn btn-sm"
                            onClick={() => handleRemoveItem(item.id, item.name)}
                            style={{
                              background: "#fee2e2",
                              color: "#ef4444",
                              border: "none",
                              borderRadius: "10px",
                              padding: "8px 12px",
                              transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#fecaca";
                              e.currentTarget.style.transform = "scale(1.05)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#fee2e2";
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                          >
                            <i className="bi bi-trash3"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="d-flex justify-content-between align-items-center mt-4">
            <Link
              href="/shop"
              className="btn"
              style={{
                background: "transparent",
                color: primaryColor,
                border: `2px solid ${primaryColor}`,
                borderRadius: "12px",
                padding: "12px 24px",
                fontWeight: "600",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = primaryColor;
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = primaryColor;
              }}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Continue Shopping
            </Link>
            <button
              className="btn"
              onClick={() => setShowClearModal(true)}
              style={{
                background: "transparent",
                color: "#ef4444",
                border: "2px solid #ef4444",
                borderRadius: "12px",
                padding: "12px 24px",
                fontWeight: "600",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#ef4444";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#ef4444";
              }}
            >
              <i className="bi bi-cart-x me-2"></i>
              Clear Cart
            </button>
          </div>
        </div>

        <div className="col-lg-4">
          <div
            className="card border-0"
            style={{
              position: "sticky",
              top: "20px",
              borderRadius: "20px",
              boxShadow: `0 20px 40px ${primaryLight}`,
              border: "1px solid #f1f5f9",
            }}
          >
            <div className="card-body p-4">
              <h5
                className="card-title mb-4"
                style={{ color: "#1e293b", fontWeight: "700" }}
              >
                <i
                  className="bi bi-receipt me-2"
                  style={{ color: primaryColor }}
                ></i>
                Order Summary
              </h5>

              <div className="vstack gap-2 mb-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="d-flex justify-content-between small"
                  >
                    <span
                      className="text-truncate"
                      style={{ maxWidth: "200px", color: "#64748b" }}
                    >
                      {item.name} x{item.quantity || 1}
                      {(item.acrylicSize !== "12x9" ||
                        item.acrylicThickness === "5mm") && (
                        <i
                          className="bi bi-gear-fill ms-1"
                          style={{ color: primaryColor }}
                        ></i>
                      )}
                    </span>
                    <span style={{ color: "#1e293b", fontWeight: "600" }}>
                      ₹{calculateItemPrice(item).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <hr style={{ borderColor: "#e2e8f0" }} />

              <div className="vstack gap-2 mb-4">
                <div className="d-flex justify-content-between">
                  <span style={{ color: "#64748b" }}>Subtotal:</span>
                  <span style={{ color: "#1e293b", fontWeight: "600" }}>
                    ₹{calculateCartTotal().toFixed(2)}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span style={{ color: "#64748b" }}>Shipping:</span>
                  {shipping === 0 ? (
                    <span style={{ color: primaryColor, fontWeight: "600" }}>
                      Free
                    </span>
                  ) : (
                    <span style={{ color: "#1e293b", fontWeight: "600" }}>
                      ₹{shipping.toFixed(2)}
                    </span>
                  )}
                </div>
                {typeof discount === "number" && discount > 0 && (
                  <div className="d-flex justify-content-between">
                    <span style={{ color: "#64748b" }}>
                      Discount ({promoCode}):
                    </span>
                    <span style={{ color: primaryColor, fontWeight: "600" }}>
                      -₹{discount.toFixed(2)}
                    </span>
                  </div>
                )}
                {discount === "freeshipping" && (
                  <div className="d-flex justify-content-between">
                    <span style={{ color: "#64748b" }}>Discount:</span>
                    <span style={{ color: primaryColor, fontWeight: "600" }}>
                      Free Shipping
                    </span>
                  </div>
                )}
              </div>

              <hr style={{ borderColor: "#e2e8f0" }} />

              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5
                  className="mb-0"
                  style={{ color: "#1e293b", fontWeight: "700" }}
                >
                  Total
                </h5>
                <div className="text-end">
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: "800",
                      color: primaryColor,
                    }}
                  >
                    ₹{grandTotal.toFixed(2)}
                  </div>
                  <small style={{ color: "#64748b" }}>
                    Including ₹ {(grandTotal * 0.1).toFixed(2)} tax
                  </small>
                </div>
              </div>

              <div className="mb-4">
                <label
                  className="form-label fw-semibold"
                  style={{ color: "#1e293b" }}
                >
                  <i
                    className="bi bi-ticket-perforated me-2"
                    style={{ color: primaryColor }}
                  ></i>
                  Have a promo code?
                </label>
                <div className="input-group">
                  <input
                    type="text"
                    className={`form-control ${promoError ? "is-invalid" : ""}`}
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === "Enter" && handleApplyPromo()}
                    style={{
                      borderRadius: "12px 0 0 12px",
                      border: "1px solid #e2e8f0",
                      padding: "12px",
                    }}
                  />
                  <button
                    className="btn"
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={isApplyingPromo || !promoCode}
                    style={{
                      background: primaryGradient,
                      color: "white",
                      border: "none",
                      borderRadius: "0 12px 12px 0",
                      padding: "0 20px",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) =>
                      !isApplyingPromo &&
                      (e.currentTarget.style.opacity = "0.9")
                    }
                    onMouseLeave={(e) =>
                      !isApplyingPromo && (e.currentTarget.style.opacity = "1")
                    }
                  >
                    {isApplyingPromo ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      "Apply"
                    )}
                  </button>
                  {promoError && (
                    <div className="invalid-feedback d-block">{promoError}</div>
                  )}
                </div>
                <div className="mt-2">
                  <small style={{ color: "#94a3b8" }}>
                    Try: FRAME10 (10% off), FRAME20 (20% off), WELCOME15 (15%
                    off), FREESHIP
                  </small>
                </div>
              </div>

              <button
                className="btn w-100 py-3 mb-3 fw-semibold"
                style={{
                  background: primaryGradient,
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: "700",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 20px 30px -10px ${primaryColor}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <i className="bi bi-lock-fill me-2"></i>
                Proceed to Checkout
              </button>

              <div className="text-center">
                <small className="d-block mb-2" style={{ color: "#94a3b8" }}>
                  Secure payment options
                </small>
                <div className="d-flex justify-content-center gap-3">
                  <i
                    className="bi bi-credit-card-2-front fs-3"
                    style={{ color: "#94a3b8" }}
                  ></i>
                  <i
                    className="bi bi-paypal fs-3"
                    style={{ color: "#94a3b8" }}
                  ></i>
                  <i
                    className="bi bi-apple fs-3"
                    style={{ color: "#94a3b8" }}
                  ></i>
                  <i
                    className="bi bi-google fs-3"
                    style={{ color: "#94a3b8" }}
                  ></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

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
      `}</style>
    </div>
  );
};

export default CartPage;

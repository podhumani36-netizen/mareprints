"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "../../../assest/style/ProductClient.module.css";
import RazorpayPayment from "../../../Components/payment/Razorpay";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const WALL_MOCKUP =
  "https://res.cloudinary.com/dsprfys3x/image/upload/v1773637296/wmremove-transformed_f1xtnt.jpg";

// Heart SVG path in 300×280 coordinate space
const HEART_PATH =
  "M150,270 C85,215 12,160 12,94 C12,50 48,12 94,12 C118,12 140,24 150,42 C160,24 182,12 206,12 C252,12 288,50 288,94 C288,160 215,215 150,270 Z";

const HEART_W = 300;
const HEART_H = 280;

const SIZE_OPTIONS = ["8x8", "12x12", "16x16", "20x20"];
const BASE_PRICE = 1;

// ── Design templates ──────────────────────────────────────────────────────────
// Each template defines photo count, grid CSS, and per-slot cell styles
const DESIGNS = [
  {
    id: 1,
    label: "1 Photo",
    count: 1,
    gridCols: "1fr",
    gridRows: "1fr",
    slots: [{}],
  },
  {
    id: 2,
    label: "2 Photos",
    count: 2,
    gridCols: "1fr 1fr",
    gridRows: "1fr",
    slots: [{}, {}],
  },
  {
    id: 3,
    label: "3 Photos",
    count: 3,
    gridCols: "1fr 1fr",
    gridRows: "1fr 1fr",
    slots: [
      { gridColumn: "1 / span 2", gridRow: "1" },
      { gridColumn: "1", gridRow: "2" },
      { gridColumn: "2", gridRow: "2" },
    ],
  },
  {
    id: 4,
    label: "4 Photos",
    count: 4,
    gridCols: "1fr 1fr",
    gridRows: "1fr 1fr",
    slots: [{}, {}, {}, {}],
  },
  {
    id: 5,
    label: "5 Photos",
    count: 5,
    gridCols: "1fr 1fr",
    gridRows: "1fr 1fr 1fr",
    slots: [
      { gridColumn: "1", gridRow: "1" },
      { gridColumn: "2", gridRow: "1" },
      { gridColumn: "1 / span 2", gridRow: "2" },
      { gridColumn: "1", gridRow: "3" },
      { gridColumn: "2", gridRow: "3" },
    ],
  },
];

// Slot bounding boxes in 300×280 space (for canvas export)
const SLOT_GEOMETRY = {
  1: [{ x: 0, y: 0, w: 300, h: 280 }],
  2: [
    { x: 0, y: 0, w: 150, h: 280 },
    { x: 150, y: 0, w: 150, h: 280 },
  ],
  3: [
    { x: 0, y: 0, w: 300, h: 140 },
    { x: 0, y: 140, w: 150, h: 140 },
    { x: 150, y: 140, w: 150, h: 140 },
  ],
  4: [
    { x: 0, y: 0, w: 150, h: 140 },
    { x: 150, y: 0, w: 150, h: 140 },
    { x: 0, y: 140, w: 150, h: 140 },
    { x: 150, y: 140, w: 150, h: 140 },
  ],
  5: [
    { x: 0, y: 0, w: 150, h: 93 },
    { x: 150, y: 0, w: 150, h: 93 },
    { x: 0, y: 93, w: 300, h: 94 },
    { x: 0, y: 187, w: 150, h: 93 },
    { x: 150, y: 187, w: 150, h: 93 },
  ],
};

function coverRect(imgW, imgH, boxW, boxH) {
  const scale = Math.max(boxW / imgW, boxH / imgH);
  const dw = imgW * scale;
  const dh = imgH * scale;
  return { dw, dh, dx: (boxW - dw) / 2, dy: (boxH - dh) / 2 };
}

export default function ProductClientHeartFrame({ product }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDesign, setSelectedDesign] = useState(DESIGNS[0]);
  const [images, setImages] = useState(Array(5).fill(null));
  const [imageZooms, setImageZooms] = useState(Array(5).fill(1));
  const [imageOffsets, setImageOffsets] = useState(Array(5).fill(null).map(() => ({ x: 0, y: 0 })));
  const [activeEditSlot, setActiveEditSlot] = useState(null);
  const [isImageDragging, setIsImageDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("12x12");
  const [thickness, setThickness] = useState("5mm");
  const [isPaymentReady, setIsPaymentReady] = useState(false);
  const [mailPreviewImage, setMailPreviewImage] = useState("");
  const [showToast, setShowToast] = useState({ visible: false, type: "", title: "", message: "" });
  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", alternatePhone: "",
    address: "", city: "", state: "", pincode: "", paymentMethod: "razorpay",
  });
  const [formErrors, setFormErrors] = useState({});

  const fileInputRef = useRef(null);
  const activeSlotRef = useRef(0);
  const thicknessOptions = ["3mm", "5mm", "8mm"];

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js").catch(() => {});
  }, []);

  useEffect(() => {
    setOrderId(`#ORD${Math.floor(Math.random() * 9000 + 1000)}`);
  }, []);

  // Auth guard + pre-fill form with logged-in user data
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      if (!isLoggedIn) {
        router.push("/login");
        return;
      }
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const user = JSON.parse(stored);
          setFormData((prev) => ({
            ...prev,
            fullName: prev.fullName || `${user.first_name || ""} ${user.last_name || ""}`.trim(),
            email: prev.email || user.email || "",
            phone: prev.phone || user.phone || "",
          }));
        } catch (_) {}
      }
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isImageDragging || activeEditSlot === null) return;
      setImageOffsets((prev) => {
        const next = [...prev];
        next[activeEditSlot] = { x: e.clientX - dragStart.x, y: e.clientY - dragStart.y };
        return next;
      });
    };
    const handleTouchMove = (e) => {
      if (!isImageDragging || activeEditSlot === null || !e.touches?.length) return;
      const touch = e.touches[0];
      setImageOffsets((prev) => {
        const next = [...prev];
        next[activeEditSlot] = { x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y };
        return next;
      });
    };
    const stopDragging = () => setIsImageDragging(false);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopDragging);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", stopDragging);
    window.addEventListener("touchcancel", stopDragging);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDragging);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", stopDragging);
      window.removeEventListener("touchcancel", stopDragging);
    };
  }, [isImageDragging, dragStart, activeEditSlot]);

  const showNotification = (message, type = "info", title = "") => {
    const titles = { success: "Success", error: "Error", warning: "Warning", info: "Info" };
    setShowToast({ visible: true, type, title: title || titles[type], message });
    setTimeout(() => setShowToast({ visible: false, type: "", title: "", message: "" }), 3000);
  };

  const openSuccessModal = () => {
    if (typeof window !== "undefined" && window.bootstrap) {
      const el = document.getElementById("heartSuccessModal");
      if (el) new window.bootstrap.Modal(el).show();
    }
  };

  const calculatePrice = useCallback(() => {
    let price = BASE_PRICE;
    const idx = SIZE_OPTIONS.indexOf(size);
    if (idx > 0) price += idx * 1;
    if (thickness === "5mm") price += 150;
    if (thickness === "8mm") price += 300;
    price += (selectedDesign.count - 1) * 100;
    return price * quantity;
  }, [size, thickness, quantity, selectedDesign]);

  // ── Canvas preview for email ──────────────────────────────────────────────
  const generateMailPreviewImage = async () => {
    try {
      const SCALE = 3;
      const cW = HEART_W * SCALE;
      const cH = HEART_H * SCALE;
      const canvas = document.createElement("canvas");
      canvas.width = cW;
      canvas.height = cH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return "";

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Build scaled heart path
      const scaledPath = HEART_PATH.replace(/(-?\d*\.?\d+),(-?\d*\.?\d+)/g, (_, x, y) =>
        `${parseFloat(x) * SCALE},${parseFloat(y) * SCALE}`
      );

      // Draw each slot image clipped to heart × slot rect
      const geoms = SLOT_GEOMETRY[selectedDesign.count];
      for (let i = 0; i < selectedDesign.count; i++) {
        const imgSrc = images[i];
        if (!imgSrc) continue;
        const geo = geoms[i];
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imgSrc;
        await new Promise((res) => { img.onload = res; img.onerror = res; });
        const slotZoom = imageZooms[i] ?? 1;
        const slotOffset = imageOffsets[i] ?? { x: 0, y: 0 };
        const base = coverRect(img.width, img.height, geo.w * SCALE, geo.h * SCALE);
        const dw = base.dw * slotZoom;
        const dh = base.dh * slotZoom;
        const centerX = geo.x * SCALE + (geo.w * SCALE) / 2;
        const centerY = geo.y * SCALE + (geo.h * SCALE) / 2;
        const slotScaleX = (geo.w * SCALE) / geo.w;
        const slotScaleY = (geo.h * SCALE) / geo.h;
        const dx = centerX - dw / 2 + slotOffset.x * slotScaleX;
        const dy = centerY - dh / 2 + slotOffset.y * slotScaleY;

        ctx.save();
        const hp = new Path2D(scaledPath);
        ctx.clip(hp);
        ctx.beginPath();
        ctx.rect(geo.x * SCALE, geo.y * SCALE, geo.w * SCALE, geo.h * SCALE);
        ctx.clip();
        ctx.fillStyle = "#f0f0f0";
        ctx.fillRect(geo.x * SCALE, geo.y * SCALE, geo.w * SCALE, geo.h * SCALE);
        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.restore();
      }

      // Gold border overlay
      const hp = new Path2D(scaledPath);
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 5 * SCALE;
      ctx.stroke(hp);

      return canvas.toDataURL("image/png");
    } catch (err) {
      console.error("Preview capture failed:", err);
      return "";
    }
  };

  // ── File handling ─────────────────────────────────────────────────────────
  const processFile = (file, slotIndex) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImages((prev) => {
        const next = [...prev];
        next[slotIndex] = e.target.result;
        return next;
      });
      setImageZooms((prev) => { const next = [...prev]; next[slotIndex] = 1; return next; });
      setImageOffsets((prev) => { const next = [...prev]; next[slotIndex] = { x: 0, y: 0 }; return next; });
      setActiveEditSlot(slotIndex);
      setIsProcessing(false);
      setIsPaymentReady(false);
      showNotification(`Photo ${slotIndex + 1} uploaded!`, "success");
    };
    reader.onerror = () => { setIsProcessing(false); showNotification("Failed to read file.", "error"); };
    reader.readAsDataURL(file);
  };

  const handleSlotClick = (slotIndex) => {
    if (images[slotIndex]) {
      setActiveEditSlot(slotIndex);
      return;
    }
    activeSlotRef.current = slotIndex;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleSlotImageMouseDown = (e, slotIndex) => {
    e.preventDefault();
    setActiveEditSlot(slotIndex);
    setIsImageDragging(true);
    setDragStart({
      x: e.clientX - imageOffsets[slotIndex].x,
      y: e.clientY - imageOffsets[slotIndex].y,
    });
  };

  const handleSlotImageTouchStart = (e, slotIndex) => {
    if (!e.touches?.length) return;
    const touch = e.touches[0];
    setActiveEditSlot(slotIndex);
    setIsImageDragging(true);
    setDragStart({
      x: touch.clientX - imageOffsets[slotIndex].x,
      y: touch.clientY - imageOffsets[slotIndex].y,
    });
  };

  const handleZoomIn = (slotIndex) => {
    setImageZooms((prev) => { const next = [...prev]; next[slotIndex] = Math.min((next[slotIndex] ?? 1) + 0.1, 3); return next; });
    setIsPaymentReady(false);
  };

  const handleZoomOut = (slotIndex) => {
    setImageZooms((prev) => { const next = [...prev]; next[slotIndex] = Math.max((next[slotIndex] ?? 1) - 0.1, 0.5); return next; });
    setIsPaymentReady(false);
  };

  const handleResetSlotTransform = (slotIndex) => {
    setImageZooms((prev) => { const next = [...prev]; next[slotIndex] = 1; return next; });
    setImageOffsets((prev) => { const next = [...prev]; next[slotIndex] = { x: 0, y: 0 }; return next; });
    setIsPaymentReady(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { showNotification("File size must be less than 50MB", "error"); return; }
    if (!file.type.startsWith("image/")) { showNotification("Please upload an image file", "error"); return; }
    processFile(file, activeSlotRef.current);
  };

  const handleRemoveSlot = (slotIndex, e) => {
    e.stopPropagation();
    setImages((prev) => { const next = [...prev]; next[slotIndex] = null; return next; });
    setImageZooms((prev) => { const next = [...prev]; next[slotIndex] = 1; return next; });
    setImageOffsets((prev) => { const next = [...prev]; next[slotIndex] = { x: 0, y: 0 }; return next; });
    if (activeEditSlot === slotIndex) setActiveEditSlot(null);
    setIsPaymentReady(false);
    showNotification(`Photo ${slotIndex + 1} removed`, "warning");
  };

  // ── Design selection ──────────────────────────────────────────────────────
  const handleDesignChange = (design) => {
    setSelectedDesign(design);
    setImages(Array(5).fill(null));
    setImageZooms(Array(5).fill(1));
    setImageOffsets(Array(5).fill(null).map(() => ({ x: 0, y: 0 })));
    setActiveEditSlot(null);
    setIsPaymentReady(false);
  };

  // ── Form ─────────────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === "phone" || name === "alternatePhone") v = value.replace(/\D/g, "").slice(0, 10);
    if (name === "pincode") v = value.replace(/\D/g, "").slice(0, 6);
    setFormData((prev) => ({ ...prev, [name]: v }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
    if (name !== "paymentMethod") setIsPaymentReady(false);
  };

  const validateForm = () => {
    const e = {};
    if (!formData.fullName.trim()) e.fullName = "Full name is required";
    if (!formData.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Invalid email";
    if (!formData.phone.trim()) e.phone = "Phone is required";
    else if (!/^\d{10}$/.test(formData.phone)) e.phone = "Must be 10 digits";
    if (formData.alternatePhone && !/^\d{10}$/.test(formData.alternatePhone)) e.alternatePhone = "Must be 10 digits";
    if (!formData.address.trim()) e.address = "Address is required";
    if (!formData.city.trim()) e.city = "City is required";
    if (!formData.state.trim()) e.state = "State is required";
    if (!formData.pincode.trim()) e.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(formData.pincode)) e.pincode = "Must be 6 digits";
    return e;
  };

  const validateBeforePayment = async () => {
    const uploadedCount = images.slice(0, selectedDesign.count).filter(Boolean).length;
    if (uploadedCount < selectedDesign.count) {
      showNotification(`Please upload all ${selectedDesign.count} photos`, "warning");
      return false;
    }
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showNotification("Please fill all required fields correctly", "error");
      return false;
    }
    setFormErrors({});
    const preview = await generateMailPreviewImage();
    setMailPreviewImage(preview);
    setIsPaymentReady(true);
    showNotification("Details verified. Click Pay Now.", "success");
    return true;
  };

  const handleSubmitOrder = async (e) => { e.preventDefault(); await validateBeforePayment(); };
  const handlePaymentSuccess = (paymentData) => {
    if (typeof window !== "undefined") {
      const existing = localStorage.getItem("mareprints_orders");
      const orders = existing ? JSON.parse(existing) : [];
      orders.unshift({
        id: Date.now(),
        order: orderId,
        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        status: "Confirmed",
        productName: `Heart Frame (${selectedDesign.label})`,
        size,
        thickness,
        quantity,
        amount: calculatePrice(),
        payment_id: paymentData?.razorpay_payment_id || "",
      });
      localStorage.setItem("mareprints_orders", JSON.stringify(orders));
    }
    showNotification("Payment successful!", "success");
    openSuccessModal();
    setIsPaymentReady(false);
  };
  const handlePaymentError = () => showNotification("Payment failed. Please try again.", "error");

  const goToStep = (step) => {
    if (step === 2) {
      const uploadedCount = images.slice(0, selectedDesign.count).filter(Boolean).length;
      if (uploadedCount === 0) { showNotification("Please upload at least one photo first", "warning"); return; }
    }
    setCurrentStep(step);
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const inputStyle = {
    borderRadius: "0px", border: "1px solid #dbe3ee", background: "#ffffff",
    boxShadow: "none", padding: "12px 14px", fontSize: "15px",
  };
  const labelStyle = { fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "8px", display: "block" };
  const sectionCardStyle = {
    background: "#ffffff", border: "1px solid #e2e8f0",
    borderRadius: "24px", padding: "24px", boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
  };

  const renderFieldError = (field) =>
    formErrors[field] ? (
      <div style={{ marginTop: "6px", fontSize: "13px", color: "#dc2626", fontWeight: 600 }}>
        {formErrors[field]}
      </div>
    ) : null;

  const SelectField = ({ value, onChange, options }) => (
    <div style={{ position: "relative", width: "100%" }}>
      <select value={value} onChange={onChange}
        style={{ ...inputStyle, width: "100%", paddingRight: "40px", appearance: "none", WebkitAppearance: "none", cursor: "pointer" }}>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <i className="bi bi-chevron-down"
        style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#475569", fontSize: "14px", zIndex: 5 }} />
    </div>
  );

  // ── Heart frame preview ───────────────────────────────────────────────────
  const renderHeartPreview = (showWall = false) => {
    const slotCells = selectedDesign.slots;
    const displayImages = images.slice(0, selectedDesign.count);

    return (
      <div style={{
        position: "relative", width: "100%", minHeight: "500px",
        borderRadius: "24px", overflow: "hidden",
        background: showWall ? undefined : "linear-gradient(180deg, #fff0f3 0%, #f8fafc 100%)",
        backgroundImage: showWall ? `url(${WALL_MOCKUP})` : undefined,
        backgroundSize: showWall ? "cover" : undefined,
        backgroundPosition: showWall ? "center" : undefined,
        border: "1px solid #e2e8f0",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {showWall && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.15)", pointerEvents: "none" }} />
        )}

        {/* Heart wrapper */}
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Drop shadow */}
          <div style={{
            position: "absolute",
            width: `${HEART_W}px`, height: `${HEART_H}px`,
            clipPath: `path("${HEART_PATH}")`,
            background: "linear-gradient(145deg, #c9a227, #8b6914)",
            transform: "translate(6px, 8px)",
            opacity: 0.4,
            zIndex: 0,
          }} />

          {/* Clipped heart content — CSS grid of photo slots */}
          <div
            style={{
              position: "relative",
              width: `${HEART_W}px`,
              height: `${HEART_H}px`,
              clipPath: `path("${HEART_PATH}")`,
              display: "grid",
              gridTemplateColumns: selectedDesign.gridCols,
              gridTemplateRows: selectedDesign.gridRows,
              zIndex: 1,
              background: "#1a1a1a",
            }}
          >
            {slotCells.map((cellStyle, i) => {
              const slotZoom = imageZooms[i] ?? 1;
              const slotOffset = imageOffsets[i] ?? { x: 0, y: 0 };
              const isActive = activeEditSlot === i;
              return (
                <div
                  key={i}
                  onClick={() => handleSlotClick(i)}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    cursor: displayImages[i] ? (isImageDragging && isActive ? "grabbing" : "grab") : "pointer",
                    touchAction: "none",
                    ...cellStyle,
                    border: isActive ? "2px solid rgba(201,162,39,0.8)" : displayImages[i] ? "1px solid rgba(201,162,39,0.3)" : "none",
                  }}
                  onMouseDown={displayImages[i] ? (e) => handleSlotImageMouseDown(e, i) : undefined}
                  onTouchStart={displayImages[i] ? (e) => handleSlotImageTouchStart(e, i) : undefined}
                >
                  {displayImages[i] ? (
                    <>
                      <img
                        src={displayImages[i]}
                        alt={`Photo ${i + 1}`}
                        draggable={false}
                        style={{
                          position: "absolute",
                          top: "50%", left: "50%",
                          width: "100%", height: "100%",
                          objectFit: "cover",
                          display: "block",
                          transform: `translate(calc(-50% + ${slotOffset.x}px), calc(-50% + ${slotOffset.y}px)) scale(${slotZoom})`,
                          transformOrigin: "center center",
                          transition: isImageDragging && isActive ? "none" : "transform 0.18s ease",
                          userSelect: "none",
                          pointerEvents: "none",
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => handleRemoveSlot(i, e)}
                        style={{
                          position: "absolute", top: "4px", right: "4px",
                          width: "22px", height: "22px",
                          borderRadius: "50%",
                          background: "rgba(220,38,38,0.85)",
                          border: "none", color: "white",
                          fontSize: "11px", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          zIndex: 10, lineHeight: 1,
                        }}
                      >
                        <i className="bi bi-x" />
                      </button>
                      {!isActive && (
                        <div style={{
                          position: "absolute", bottom: "3px", left: "50%", transform: "translateX(-50%)",
                          fontSize: "8px", color: "rgba(255,255,255,0.7)", fontWeight: 500,
                          background: "rgba(0,0,0,0.45)", borderRadius: "4px", padding: "1px 5px",
                          pointerEvents: "none", whiteSpace: "nowrap",
                        }}>
                          tap to edit
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{
                      position: "absolute", inset: 0,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                      gap: "4px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1.5px dashed rgba(201,162,39,0.6)",
                    }}>
                      <i className="bi bi-plus-circle" style={{ fontSize: "18px", color: "#c9a227" }} />
                      <span style={{ fontSize: "9px", color: "rgba(201,162,39,0.9)", fontWeight: 600, textAlign: "center", lineHeight: 1.2 }}>
                        Photo {i + 1}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Gold border SVG overlay */}
          <svg
            viewBox={`0 0 ${HEART_W} ${HEART_H}`}
            width={HEART_W}
            height={HEART_H}
            style={{ position: "absolute", top: 0, left: 0, zIndex: 3, pointerEvents: "none" }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f5d060" />
                <stop offset="50%" stopColor="#c9a227" />
                <stop offset="100%" stopColor="#8b6914" />
              </linearGradient>
            </defs>
            <path d={HEART_PATH} fill="none" stroke="url(#goldGrad)" strokeWidth="5" />
            <path d={HEART_PATH} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"
              transform={`scale(0.96) translate(6,5.6)`} />
          </svg>
        </div>

        {/* Pills */}
        <div style={{
          position: "absolute", bottom: "18px", left: "50%", transform: "translateX(-50%)",
          display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center",
        }}>
          {[`${size} inches`, `Thickness: ${thickness}`, selectedDesign.label].map((label) => (
            <span key={label} style={{
              background: "rgba(255,255,255,0.92)", padding: "6px 12px",
              borderRadius: "999px", fontWeight: 500, fontSize: "12px",
              color: "#0f172a", border: "1px solid #e2e8f0",
            }}>
              {label}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // ── Zoom controls for active slot ────────────────────────────────────────
  const renderZoomControls = () => {
    if (activeEditSlot === null || !images[activeEditSlot]) return null;
    const slotZoom = imageZooms[activeEditSlot] ?? 1;
    return (
      <div style={{
        marginTop: "14px", background: "#ffffff",
        border: "1px solid #e2e8f0", borderRadius: "16px",
        padding: "14px 16px",
        boxShadow: "0 4px 12px rgba(15,23,42,0.06)",
      }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "10px" }}>
          <i className="bi bi-sliders me-2" style={{ color: "#c9a227" }} />
          Editing Photo {activeEditSlot + 1} — drag to move, use controls to zoom
        </div>
        <div className="d-flex gap-2 flex-wrap align-items-center justify-content-between">
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <button type="button" className="btn btn-light"
              onClick={() => handleZoomOut(activeEditSlot)}
              style={{ width: "34px", height: "34px", borderRadius: "8px", border: "1px solid #dbe3ee", fontSize: "13px" }}>
              <i className="bi bi-dash-lg" />
            </button>
            <div style={{
              minWidth: "60px", textAlign: "center", fontWeight: 500, fontSize: "13px",
              color: "#0f172a", background: "#f8fafc", border: "1px solid #e2e8f0",
              borderRadius: "12px", padding: "8px 12px",
            }}>
              {Math.round(slotZoom * 100)}%
            </div>
            <button type="button" className="btn btn-light"
              onClick={() => handleZoomIn(activeEditSlot)}
              style={{ width: "34px", height: "34px", borderRadius: "8px", border: "1px solid #dbe3ee", fontSize: "13px" }}>
              <i className="bi bi-plus-lg" />
            </button>
          </div>
          <button type="button" className="btn btn-outline-dark"
            onClick={() => handleResetSlotTransform(activeEditSlot)}
            style={{ borderRadius: "12px", padding: "8px 14px", fontSize: "13px" }}>
            Reset Position
          </button>
        </div>
        <div className="mt-3">
          <input type="range" min="0.5" max="3" step="0.05"
            value={slotZoom}
            onChange={(e) => {
              const val = Number(e.target.value);
              setImageZooms((prev) => { const next = [...prev]; next[activeEditSlot] = val; return next; });
              setIsPaymentReady(false);
            }}
            style={{ width: "100%", cursor: "pointer", accentColor: "#c9a227" }}
          />
        </div>
      </div>
    );
  };

  // ── Step indicator ────────────────────────────────────────────────────────
  const renderStepIndicator = () => (
    <div className={styles.stepIndicator}>
      <div className="container">
        <div className={styles.stepWrapper}>
          {[1, 2].map((step) => (
            <div key={step} className={styles.stepItem}>
              <button
                className={`${styles.stepButton} ${currentStep === step ? styles.active : ""} ${currentStep > step ? styles.completed : ""}`}
                onClick={() => goToStep(step)}
                type="button"
              >
                <span className={styles.stepNumber}>
                  {currentStep > step ? <i className="bi bi-check-lg" /> : step}
                </span>
                <span className={styles.stepLabel}>{step === 1 ? "Choose Design & Upload" : "Customize & Payment"}</span>
              </button>
              {step < 2 && (
                <div className={`${styles.stepConnector} ${currentStep > step ? styles.completed : ""}`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Step 1: Design selection + photo upload ───────────────────────────────
  const renderStep1 = () => (
    <div className={styles.stepContainer}>
      <div className="container">
        <div className="row g-4">
          {/* Left: design picker + heart preview */}
          <div className="col-sm-12 col-lg-8">
            {/* Design template selector */}
            <div style={{ ...sectionCardStyle, marginBottom: "20px" }}>
              <h4 style={{ fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>Choose Your Design</h4>
              <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "16px" }}>
                Select how many photos you want in your heart frame
              </p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {DESIGNS.map((design) => (
                  <button
                    key={design.id}
                    type="button"
                    onClick={() => handleDesignChange(design)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: "12px",
                      border: selectedDesign.id === design.id ? "2px solid #c9a227" : "2px solid #e2e8f0",
                      background: selectedDesign.id === design.id ? "#fffbeb" : "#ffffff",
                      color: selectedDesign.id === design.id ? "#92400e" : "#475569",
                      fontWeight: selectedDesign.id === design.id ? 700 : 500,
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <i className="bi bi-heart-fill me-2"
                      style={{ color: selectedDesign.id === design.id ? "#c9a227" : "#94a3b8" }} />
                    {design.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Heart preview with upload slots */}
            <div className={styles.uploadCard}>
              <div style={{ padding: "16px" }}>
                <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "12px", textAlign: "center" }}>
                  Click any slot in the heart to upload a photo
                </p>
                {renderHeartPreview(false)}
                {renderZoomControls()}
                <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "10px", textAlign: "center" }}>
                  {images.slice(0, selectedDesign.count).filter(Boolean).length} / {selectedDesign.count} photos uploaded
                </p>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="d-none"
            />
          </div>

          {/* Right: guide + next */}
          <div className="col-sm-12 col-lg-4">
            <div className={styles.guideCard}>
              <h4 className={styles.guideTitle}>
                <i className="bi bi-info-circle me-2" />
                Photo Guide
              </h4>
              <ul className={styles.guideList}>
                <li><i className="bi bi-check-circle-fill" /> Select a design (1–5 photos)</li>
                <li><i className="bi bi-check-circle-fill" /> Click each slot to upload a photo</li>
                <li><i className="bi bi-check-circle-fill" /> Photos fill their slot automatically</li>
                <li><i className="bi bi-check-circle-fill" /> Click the ✕ button to replace a photo</li>
                <li className={styles.warning}>
                  <i className="bi bi-exclamation-triangle-fill" /> Use minimum 300 DPI for best quality
                </li>
              </ul>
              {isProcessing && (
                <div style={{ textAlign: "center", padding: "12px", color: "#c9a227", fontWeight: 600 }}>
                  <i className="bi bi-hourglass-split me-2" />Uploading...
                </div>
              )}
              <button
                className={styles.nextButton}
                onClick={() => goToStep(2)}
                disabled={images.slice(0, selectedDesign.count).filter(Boolean).length === 0}
                type="button"
              >
                Continue to Customize & Payment
                <i className="bi bi-arrow-right ms-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Step 2: Customize + Payment ───────────────────────────────────────────
  const renderStep2 = () => {
    const totalAmount = calculatePrice();
    return (
      <div className={styles.stepContainer}
        style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 55%, #f1f5f9 100%)" }}>
        <div className="container">
          <div className="row g-4 align-items-start">

            {/* Left: preview + options */}
            <div className="col-lg-7">
              <div style={sectionCardStyle}>
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
                  <div>
                    <h3 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "#0f172a" }}>Live Preview</h3>
                    <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#64748b" }}>
                      {selectedDesign.label} · Heart Acrylic Frame
                    </p>
                  </div>
                  <button type="button" className="btn btn-outline-dark"
                    onClick={() => goToStep(1)} style={{ borderRadius: "12px" }}>
                    <i className="bi bi-arrow-left me-2" />Back
                  </button>
                </div>

                {renderHeartPreview(true)}
                {renderZoomControls()}

                <div style={{ ...sectionCardStyle, marginTop: "20px" }}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label style={labelStyle}>Size</label>
                      <SelectField value={size}
                        onChange={(e) => { setSize(e.target.value); setIsPaymentReady(false); }}
                        options={SIZE_OPTIONS} />
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Thickness</label>
                      <SelectField value={thickness}
                        onChange={(e) => { setThickness(e.target.value); setIsPaymentReady(false); }}
                        options={thicknessOptions} />
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Quantity</label>
                      <input type="number" min="1" value={quantity}
                        onChange={(e) => { setQuantity(Math.max(1, Number(e.target.value) || 1)); setIsPaymentReady(false); }}
                        style={{ ...inputStyle, width: "100%" }} />
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Order ID</label>
                      <input type="text" value={orderId} readOnly
                        style={{ ...inputStyle, width: "100%", color: "#64748b" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: summary + form */}
            <div className="col-lg-5">
              <form onSubmit={handleSubmitOrder}>
                {/* Order summary */}
                <div style={{ ...sectionCardStyle, marginBottom: "20px" }}>
                  <h4 style={{ marginBottom: "18px", fontWeight: 800, color: "#0f172a" }}>Order Summary</h4>
                  <div style={{ display: "grid", gap: "10px", fontSize: "15px", color: "#334155" }}>
                    {[
                      ["Product", "Heart Acrylic Frame"],
                      ["Design", selectedDesign.label],
                      ["Size", size],
                      ["Thickness", thickness],
                      ["Quantity", quantity],
                      ["Total Amount", `₹${totalAmount}`],
                    ].map(([label, val]) => (
                      <div key={label} className="d-flex justify-content-between">
                        <span>{label}</span><strong>{val}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer details */}
                <div style={{ ...sectionCardStyle, marginBottom: "20px" }}>
                  <h4 style={{ marginBottom: "18px", fontWeight: 800, color: "#0f172a" }}>Customer Details</h4>
                  <div className="row g-3">
                    <div className="col-12">
                      <label style={labelStyle}>Full Name</label>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} style={{ ...inputStyle, width: "100%" }} />
                      {renderFieldError("fullName")}
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Email</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} style={{ ...inputStyle, width: "100%" }} />
                      {renderFieldError("email")}
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Phone</label>
                      <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} style={{ ...inputStyle, width: "100%" }} />
                      {renderFieldError("phone")}
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Alternate Phone</label>
                      <input type="text" name="alternatePhone" value={formData.alternatePhone} onChange={handleInputChange} style={{ ...inputStyle, width: "100%" }} />
                      {renderFieldError("alternatePhone")}
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Pincode</label>
                      <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} style={{ ...inputStyle, width: "100%" }} />
                      {renderFieldError("pincode")}
                    </div>
                    <div className="col-12">
                      <label style={labelStyle}>Address</label>
                      <textarea name="address" value={formData.address} onChange={handleInputChange} rows="3"
                        style={{ ...inputStyle, width: "100%", resize: "none" }} />
                      {renderFieldError("address")}
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>City</label>
                      <input type="text" name="city" value={formData.city} onChange={handleInputChange} style={{ ...inputStyle, width: "100%" }} />
                      {renderFieldError("city")}
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>State</label>
                      <input type="text" name="state" value={formData.state} onChange={handleInputChange} style={{ ...inputStyle, width: "100%" }} />
                      {renderFieldError("state")}
                    </div>
                  </div>
                </div>

                {/* Payment */}
                <div style={sectionCardStyle}>
                  {!isPaymentReady ? (
                    <button type="submit" className="btn btn-dark w-100"
                      style={{ borderRadius: "14px", padding: "14px 18px", fontWeight: 700, fontSize: "16px" }}>
                      Verify Details & Pay Now
                    </button>
                  ) : (
                    <RazorpayPayment
                      amount={totalAmount}
                      customerDetails={{
                        ...formData,
                        name: formData.fullName,
                        orderId,
                        productType: "heart_frame",
                        productName: `Heart Frame (${selectedDesign.label})`,
                        orientation: "heart_frame",
                        design: selectedDesign.label,
                        size,
                        thickness,
                        quantity,
                        amount: totalAmount,
                      }}
                      previewImage={mailPreviewImage}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <>
      {renderStepIndicator()}
      {currentStep === 1 ? renderStep1() : renderStep2()}

      {/* Toast */}
      {showToast.visible && (
        <div style={{
          position: "fixed", top: "20px", right: "20px", zIndex: 9999,
          minWidth: "280px", maxWidth: "380px", background: "#fff",
          borderRadius: "16px", boxShadow: "0 18px 40px rgba(15,23,42,0.16)",
          border: "1px solid #e2e8f0", overflow: "hidden",
        }}>
          <div style={{
            padding: "14px 16px",
            borderLeft: `4px solid ${showToast.type === "success" ? "#16a34a" : showToast.type === "error" ? "#dc2626" : showToast.type === "warning" ? "#f59e0b" : "#2563eb"}`,
          }}>
            <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>{showToast.title}</div>
            <div style={{ fontSize: "14px", color: "#475569" }}>{showToast.message}</div>
          </div>
        </div>
      )}

      {/* Success modal */}
      <div className="modal fade" id="heartSuccessModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius: "24px" }}>
            <div className="modal-body text-center p-5">
              <div style={{
                width: "72px", height: "72px", margin: "0 auto 18px",
                borderRadius: "999px", display: "grid", placeItems: "center",
                background: "#fffbeb", color: "#c9a227", fontSize: "32px",
              }}>
                <i className="bi bi-heart-fill" />
              </div>
              <h3 style={{ fontWeight: 800, color: "#0f172a", marginBottom: "10px" }}>Payment Successful!</h3>
              <p style={{ color: "#64748b", marginBottom: "20px" }}>
                Your heart acrylic frame is being crafted with care. We'll ship it soon!
              </p>
              <button type="button" className="btn btn-dark" data-bs-dismiss="modal"
                style={{ borderRadius: "14px", padding: "12px 24px" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "../../../assest/style/ProductClient.module.css";
import RazorpayPayment from "../../../Components/payment/Razorpay";
import { FRAME_SLOTS, FRAME_SLOT_MAP } from "../../../data/collageFrameSlots";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const WALL_MOCKUP =
  "https://res.cloudinary.com/dsprfys3x/image/upload/q_auto/f_auto/v1776247395/BackRound.jpg_kiljam.jpg";

const FRAMES = [
  { file: "tree-family-1.png",                          label: "Family Tree" },
  { file: "tree-family-2.png",                          label: "Family Tree II" },
  { file: "floral-round.png",                           label: "Floral Round" },
  { file: "leaf-tree-rounded.png",                      label: "Leaf Tree" },
  { file: "swirl-tree.png",                             label: "Swirl Tree" },
  { file: "birds-tree.png",                             label: "Birds & Tree" },
  { file: "full-tree-collage.png",                      label: "Full Tree Collage" },
  { file: "family-home-grid.png",                       label: "Family Home" },
  { file: "family-script-grid.png",                     label: "Family Script" },
  { file: "family-wide-2.png",                          label: "Family Wide" },
  { file: "gift-lasts-forever.png",                     label: "Gift Forever" },
  { file: "heart-family.png",                           label: "Heart Family" },
  { file: "vertical-family-grid.png",                   label: "Vertical Grid" },
  { file: "family-center-gridfamily-center-grid.png",   label: "Family Center" },
  { file: "family-wide-1..png",                         label: "Family Wide I" },
  { file: "bottom-stand-grid.png",                      label: "Stand Grid" },
];

/** Returns the slot array for a given frame file, or [] if unknown. */
function getSlotsForFrame(file) {
  const key = FRAME_SLOT_MAP[file];
  return key && FRAME_SLOTS[key] ? FRAME_SLOTS[key] : [];
}

// ── Canvas helper: clip path with optional rounded corners ─────────────────────
// x, y, w, h in pixels; r = radius in pixels (0 = sharp).
function clipRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (r <= 0) {
    ctx.rect(x, y, w, h);
  } else {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y,     x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x,     y + h, x,     y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x,     y,     x + r, y);
  }
  ctx.closePath();
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function ProductClientPNGFrame({ product }) {
  const router = useRouter();

  // ── Step navigation ────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1);

  // ── Frame & slot state ─────────────────────────────────────────────────────
  const [selectedFrame, setSelectedFrame] = useState(null);  // { file, label }
  const [slots,         setSlots]         = useState([]);    // predefined slot defs
  const [slotImages,    setSlotImages]    = useState([]);    // data-URLs, one per slot
  const [activeSlot,    setActiveSlot]    = useState(0);

  // ── Frame natural dimensions (loaded on frame select) ─────────────────────
  // Used to set an EXPLICIT pixel height on the composite container so that
  // percentage top/height on absolutely-positioned slot children resolve correctly.
  const [frameNatural, setFrameNatural] = useState({ w: 300, h: 300 });

  // ── Upload helpers ─────────────────────────────────────────────────────────
  const [isDragging,   setIsDragging]   = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // ── Order / payment ────────────────────────────────────────────────────────
  const [orderId,          setOrderId]          = useState("");
  const [quantity,         setQuantity]         = useState(1);
  const [isPaymentReady,   setIsPaymentReady]   = useState(false);
  const [mailPreviewImage, setMailPreviewImage] = useState("");
  const [showToast, setShowToast] = useState({
    visible: false, type: "", title: "", message: "",
  });

  // ── Refs ───────────────────────────────────────────────────────────────────
  const fileInputRef = useRef(null);

  // ── Product config ─────────────────────────────────────────────────────────
  const sizeOptions     = product?.sizeOptions     || ["8x10","11x14","16x20","20x24"];
  const frameDimensions = product?.frameDimensions || {
    "8x10":  { width: 180, height: 220 },
    "11x14": { width: 220, height: 280 },
    "16x20": { width: 280, height: 340 },
    "20x24": { width: 320, height: 380 },
  };
  const basePrice   = product?.basePrice   || 1299;
  const defaultSize = product?.defaultSize || sizeOptions[0];

  // ── Customize ──────────────────────────────────────────────────────────────
  const [size,      setSize]      = useState(defaultSize);
  const [thickness, setThickness] = useState("3mm");
  const [pincode,   setPincode]   = useState("");
  const [deliveryStatus,        setDeliveryStatus]        = useState({ message: "", type: "", isChecking: false });
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");
  const [formData,  setFormData]  = useState({
    fullName: "", email: "", phone: "", alternatePhone: "",
    address: "", city: "", state: "", pincode: "", paymentMethod: "razorpay",
  });
  const [formErrors, setFormErrors] = useState({});

  // ── Bootstrap JS ───────────────────────────────────────────────────────────
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js").catch(() => {});
  }, []);

  // ── Order ID ───────────────────────────────────────────────────────────────
  useEffect(() => {
    setOrderId(`#ORD${Math.floor(Math.random() * 9000 + 1000)}`);
  }, []);

  // ── Auth guard + pre-fill ──────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("isLoggedIn") !== "true") {
      router.push("/login"); return;
    }
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setFormData((p) => ({
        ...p,
        fullName: p.fullName || `${user.first_name||""} ${user.last_name||""}`.trim(),
        email:    p.email    || user.email || "",
        phone:    p.phone    || user.phone || "",
      }));
    } catch (_) {}
  }, []);

  // ── Load predefined slots whenever a frame is selected ─────────────────────
  useEffect(() => {
    if (!selectedFrame) return;
    const newSlots = getSlotsForFrame(selectedFrame.file);
    setSlots(newSlots);
    setSlotImages(new Array(newSlots.length).fill(null));
    setActiveSlot(0);
    setIsPaymentReady(false);
  }, [selectedFrame]);

  // ── Measure the frame PNG's natural dimensions on selection ───────────────
  // We need an explicit pixel height on the composite container so CSS can
  // correctly resolve percentage top/height on absolutely-positioned slots.
  useEffect(() => {
    if (!selectedFrame) return;
    const img = new Image();
    img.onload  = () => setFrameNatural({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => setFrameNatural({ w: 300, h: 300 });
    img.src = `/frames/${selectedFrame.file}`;
  }, [selectedFrame]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const showNotification = (message, type = "info", title = "") => {
    const titles = { success: "Success", error: "Error", warning: "Warning" };
    setShowToast({ visible: true, type, title: title || titles[type] || "Info", message });
    setTimeout(() => setShowToast({ visible: false, type: "", title: "", message: "" }), 3000);
  };

  const openSuccessModal = () => {
    if (typeof window !== "undefined" && window.bootstrap) {
      const el = document.getElementById("pngFrameSuccessModal");
      if (el) new window.bootstrap.Modal(el).show();
    }
  };

  const calculatePrice = useCallback(() => {
    let price = basePrice;
    const idx = sizeOptions.indexOf(size);
    if (idx > 0) price += idx * 150;
    if (thickness === "5mm") price += 150;
    if (thickness === "8mm") price += 300;
    return price * quantity;
  }, [basePrice, sizeOptions, size, thickness, quantity]);

  // ── Canvas export ──────────────────────────────────────────────────────────
  // Draws all slot photos at their exact positions then overlays the frame PNG.
  const generateMailPreviewImage = async () => {
    try {
      if (!selectedFrame || !slotImages.some(Boolean)) return "";

      const frameImg = new Image();
      frameImg.src = `/frames/${selectedFrame.file}`;
      await new Promise((res) => { frameImg.onload = res; frameImg.onerror = res; });

      const W = frameImg.naturalWidth  || 600;
      const H = frameImg.naturalHeight || 600;

      const cvs = document.createElement("canvas");
      cvs.width = W; cvs.height = H;
      const ctx = cvs.getContext("2d");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // White background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);

      // Draw each filled slot photo (object-fit: cover + optional rounded clip)
      for (let i = 0; i < slots.length; i++) {
        if (!slotImages[i]) continue;
        const slot = slots[i];

        // Convert percentage coords → pixels
        const sx = (slot.left   / 100) * W;
        const sy = (slot.top    / 100) * H;
        const sw = (slot.width  / 100) * W;
        const sh = (slot.height / 100) * H;
        // Radius as % of the slot's smaller dimension
        const sr = ((slot.r || 0) / 100) * Math.min(sw, sh);

        const photo = new Image();
        photo.src = slotImages[i];
        await new Promise((res) => { photo.onload = res; photo.onerror = res; });

        ctx.save();
        clipRoundedRect(ctx, sx, sy, sw, sh, sr);
        ctx.clip();

        // object-fit: cover
        const imgR  = photo.width / photo.height;
        const slotR = sw / sh;
        let dx, dy, dw, dh;
        if (imgR > slotR) {
          dh = sh; dw = dh * imgR;
          dx = sx - (dw - sw) / 2; dy = sy;
        } else {
          dw = sw; dh = dw / imgR;
          dx = sx; dy = sy - (dh - sh) / 2;
        }
        ctx.drawImage(photo, dx, dy, dw, dh);
        ctx.restore();
      }

      // Frame overlay on top
      ctx.drawImage(frameImg, 0, 0, W, H);
      return cvs.toDataURL("image/png");
    } catch (err) {
      console.error("Export failed:", err);
      return "";
    }
  };

  // ── File handling ──────────────────────────────────────────────────────────
  const processFile = (file, slotIdx) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { showNotification("File too large (max 50 MB)", "error"); return; }
    if (!file.type.startsWith("image/")) { showNotification("Please upload an image file", "error"); return; }
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      setSlotImages((prev) => { const n = [...prev]; n[slotIdx] = e.target.result; return n; });
      setIsProcessing(false);
      setIsPaymentReady(false);
      showNotification(`Photo ${slotIdx + 1} uploaded!`, "success");
    };
    reader.onerror = () => { setIsProcessing(false); showNotification("Failed to read file", "error"); };
    reader.readAsDataURL(file);
  };

  const handleSlotClick = (slotIdx) => {
    setActiveSlot(slotIdx);
    setTimeout(() => fileInputRef.current?.click(), 0);
  };

  const handleRemoveSlotImage = (slotIdx, e) => {
    e?.stopPropagation();
    setSlotImages((prev) => { const n = [...prev]; n[slotIdx] = null; return n; });
    setIsPaymentReady(false);
    showNotification(`Photo ${slotIdx + 1} removed`, "warning");
  };

  const handleFileUpload = (e) => {
    processFile(e.target.files?.[0], activeSlot);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = ()    => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    processFile(e.dataTransfer.files?.[0], activeSlot);
  };

  // ── Form ───────────────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === "phone" || name === "alternatePhone") v = value.replace(/\D/g, "").slice(0, 10);
    if (name === "pincode") v = value.replace(/\D/g, "").slice(0, 6);
    setFormData((p) => ({ ...p, [name]: v }));
    if (formErrors[name]) setFormErrors((p) => ({ ...p, [name]: "" }));
    if (name !== "paymentMethod") setIsPaymentReady(false);
  };

  const validateForm = () => {
    const e = {};
    if (!formData.fullName.trim()) e.fullName = "Full name is required";
    if (!formData.email.trim())    e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Invalid email format";
    if (!formData.phone.trim())    e.phone    = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone)) e.phone = "Phone must be 10 digits";
    if (formData.alternatePhone?.trim() && !/^\d{10}$/.test(formData.alternatePhone))
      e.alternatePhone = "Must be 10 digits";
    if (!formData.address.trim()) e.address = "Address is required";
    if (!formData.city.trim())    e.city    = "City is required";
    if (!formData.state.trim())   e.state   = "State is required";
    if (!formData.pincode.trim()) e.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(formData.pincode)) e.pincode = "Pincode must be 6 digits";
    return e;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors); setIsPaymentReady(false);
      showNotification("Please fill all required fields correctly", "error"); return;
    }
    setFormErrors({});
    const preview = await generateMailPreviewImage();
    setMailPreviewImage(preview);
    setIsPaymentReady(true);
    showNotification("Details verified. Click Pay Now.", "success");
  };

  const handlePaymentSuccess = (paymentData) => {
    if (typeof window !== "undefined") {
      const existing = localStorage.getItem("mareprints_orders");
      const orders   = existing ? JSON.parse(existing) : [];
      orders.unshift({
        id: Date.now(), order: orderId,
        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        status: "Confirmed",
        productName: `${selectedFrame?.label || "Framed"} Print (${size})`,
        size, thickness, quantity, amount: calculatePrice(),
        payment_id: paymentData?.razorpay_payment_id || "",
      });
      localStorage.setItem("mareprints_orders", JSON.stringify(orders));
    }
    showNotification("Payment successful! Thank you for your order.", "success");
    openSuccessModal(); setIsPaymentReady(false);
  };

  const handlePaymentError = () => showNotification("Payment failed. Please try again.", "error");

  const goToStep = (step) => {
    if (step === 2 && !selectedFrame)            { showNotification("Please select a frame first", "warning"); return; }
    if (step === 3 && !slotImages.some(Boolean)) { showNotification("Please upload at least one photo", "warning"); return; }
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Shared styles ──────────────────────────────────────────────────────────
  const inputStyle = {
    borderRadius: "0px", minHeight: "10px", border: "1px solid #dbe3ee",
    background: "#ffffff", boxShadow: "none", padding: "12px 14px", fontSize: "15px",
  };
  const labelStyle = { fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "8px", display: "block" };
  const cardStyle  = { background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "24px", padding: "24px", boxShadow: "0 10px 30px rgba(15,23,42,0.05)" };
  const renderFieldError = (field) =>
    formErrors[field] ? <div style={{ marginTop: 6, fontSize: 13, color: "#dc2626", fontWeight: 600 }}>{formErrors[field]}</div> : null;

  // ── Frame composite preview ────────────────────────────────────────────────
  // The container is given EXPLICIT pixel dimensions derived from the frame
  // PNG's natural size (measured by the useEffect above). This ensures CSS
  // correctly resolves percentage top/height on absolutely-positioned slot
  // children — when a container has height:auto (content-derived) those
  // percentages can collapse to 0. Explicit px height removes all ambiguity.
  const renderComposite = ({ interactive = false, wallBg = false } = {}) => {
    if (!selectedFrame) return null;

    // Scale frame to a fixed display width while preserving natural aspect ratio.
    const DISPLAY_W = 300;
    const DISPLAY_H = Math.round(DISPLAY_W * frameNatural.h / frameNatural.w);

    const frameBlock = (
      <div style={{
        position: "relative",
        width:  `${DISPLAY_W}px`,
        height: `${DISPLAY_H}px`,          // ← explicit height: % children resolve correctly
        flexShrink: 0,
        boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
      }}>
        {/* Frame PNG — sits at z-index 1 (background layer).
            Photo slots are placed on top (z-index 2) so they cover the
            white/opaque placeholder areas in the frame artwork. */}
        <img
          src={`/frames/${selectedFrame.file}`}
          alt={selectedFrame.label}
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "fill", display: "block",
            zIndex: 1, pointerEvents: "none",
          }}
        />

        {/* Slot photos — on top of the frame so they fill the frame openings */}
        {slots.map((slot, i) => (
          <div
            key={slot.id}
            onClick={interactive ? () => handleSlotClick(i) : undefined}
            style={{
              position:     "absolute",
              left:         `${slot.left}%`,
              top:          `${slot.top}%`,
              width:        `${slot.width}%`,
              height:       `${slot.height}%`,
              borderRadius: `${slot.r || 0}%`,
              overflow:     "hidden",
              cursor:       interactive ? "pointer" : "default",
              background:   slotImages[i] ? "transparent" : "#dce7f3",
              outline:      interactive && activeSlot === i ? "2px solid #0ea5e9" : "none",
              outlineOffset: "-2px",
              zIndex:       2,
              transition:   "outline-color 0.15s",
            }}
          >
            {slotImages[i] ? (
              <>
                <img
                  src={slotImages[i]}
                  alt={`Slot ${i + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
                {interactive && (
                  <button
                    type="button"
                    onClick={(e) => handleRemoveSlotImage(i, e)}
                    title="Remove photo"
                    style={{
                      position: "absolute", top: 3, right: 3,
                      width: 16, height: 16, borderRadius: "50%",
                      border: "none", background: "rgba(0,0,0,0.65)",
                      color: "#fff", fontSize: 8, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      padding: 0, zIndex: 20, lineHeight: 1,
                    }}
                  >✕</button>
                )}
              </>
            ) : interactive ? (
              <div style={{
                width: "100%", height: "100%",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 2, color: "#475569", userSelect: "none",
              }}>
                <i className="bi bi-plus-circle" style={{ fontSize: 13 }} />
                <span style={{ fontSize: 7, fontWeight: 700, lineHeight: 1.2, textAlign: "center" }}>
                  {i + 1}
                </span>
              </div>
            ) : null}
          </div>
        ))}

      </div>
    );

    return (
      <div style={{
        position: "relative",
        width: "100%",
        minHeight: wallBg ? "460px" : "380px",
        borderRadius: "28px",
        overflow: "hidden",
        border: "1px solid #e2e8f0",
        background: wallBg ? undefined : "#f8fafc",
        backgroundImage: wallBg ? `url(${WALL_MOCKUP})` : undefined,
        backgroundSize: wallBg ? "cover" : undefined,
        backgroundPosition: wallBg ? "center" : undefined,
        // Flex centering — matches ProductClientCollageFrame's approach
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 12px 48px",
      }}>
        {wallBg && (
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom,rgba(255,255,255,0.08),rgba(15,23,42,0.05))",
            pointerEvents: "none",
          }} />
        )}

        {frameBlock}

        {/* Info pills */}
        <div style={{
          position: "absolute", bottom: 14, left: "50%",
          transform: "translateX(-50%)",
          display: "flex", gap: 8, flexWrap: "wrap",
          justifyContent: "center", width: "100%", padding: "0 12px",
        }}>
          {[
            selectedFrame.label,
            `${slotImages.filter(Boolean).length}/${slots.length} photos`,
            `${size} • ${thickness}`,
          ].map((txt) => (
            <span key={txt} style={{
              background: "rgba(255,255,255,0.95)", padding: "7px 13px",
              borderRadius: "999px", fontWeight: 500, fontSize: "11px",
              color: "#0f172a", border: "1px solid #e2e8f0",
            }}>{txt}</span>
          ))}
        </div>
      </div>
    );
  };

  // ── Step indicator ─────────────────────────────────────────────────────────
  const renderStepIndicator = () => (
    <div className={styles.stepIndicator}>
      <div className="container">
        <div className={styles.stepWrapper} style={{ maxWidth: "900px" }}>
          {[
            { step: 1, label: "Choose Frame" },
            { step: 2, label: "Upload Photos" },
            { step: 3, label: "Customize & Pay" },
          ].map(({ step, label }, idx, arr) => (
            <div key={step} className={styles.stepItem}>
              <button
                className={`${styles.stepButton} ${currentStep === step ? styles.active : ""} ${currentStep > step ? styles.completed : ""}`}
                onClick={() => goToStep(step)}
                disabled={(step === 2 && !selectedFrame) || (step === 3 && !slotImages.some(Boolean))}
                type="button"
              >
                <span className={styles.stepNumber}>
                  {currentStep > step ? <i className="bi bi-check-lg" /> : step}
                </span>
                <span className={styles.stepLabel}>{label}</span>
              </button>
              {idx < arr.length - 1 && (
                <div className={`${styles.stepConnector} ${currentStep > step ? styles.completed : ""}`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Step 1: Frame gallery ──────────────────────────────────────────────────
  const renderStep1 = () => (
    <div className={styles.stepContainer}>
      <div className="container">
        <div style={cardStyle}>
          <h3 style={{ fontWeight: 800, color: "#0f172a", marginBottom: 6, fontSize: 24 }}>
            Choose Your Frame
          </h3>
          <p style={{ color: "#64748b", marginBottom: 24, fontSize: 14 }}>
            Each frame has its own set of photo slots. Select one to see how many photos it holds.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))", gap: 14 }}>
            {FRAMES.map((frame) => {
              const active     = selectedFrame?.file === frame.file;
              const slotCount  = getSlotsForFrame(frame.file).length;
              return (
                <div
                  key={frame.file}
                  onClick={() => setSelectedFrame(frame)}
                  style={{
                    cursor: "pointer", borderRadius: 16, overflow: "hidden",
                    border: active ? "3px solid #0f172a" : "3px solid transparent",
                    boxShadow: active ? "0 0 0 2px #0f172a" : "0 4px 12px rgba(0,0,0,0.08)",
                    background: "#f8fafc", transition: "all 0.2s",
                    transform: active ? "scale(1.03)" : "scale(1)",
                  }}
                >
                  <div style={{ position: "relative", width: "100%", paddingBottom: "100%", background: "#f1f5f9" }}>
                    <img
                      src={`/frames/${frame.file}`}
                      alt={frame.label}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", padding: 8 }}
                    />
                    {active && (
                      <div style={{
                        position: "absolute", top: 6, right: 6,
                        width: 22, height: 22, borderRadius: "50%",
                        background: "#0f172a", color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
                      }}>
                        <i className="bi bi-check-lg" />
                      </div>
                    )}
                    {/* Slot count badge */}
                    <div style={{
                      position: "absolute", bottom: 5, left: 5,
                      background: active ? "#0f172a" : "rgba(0,0,0,0.55)",
                      color: "#fff", borderRadius: 8,
                      fontSize: 10, fontWeight: 700, padding: "2px 6px",
                    }}>
                      {slotCount} slot{slotCount !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div style={{
                    padding: "8px 10px", textAlign: "center",
                    fontWeight: 600, fontSize: 12,
                    color: active ? "#0f172a" : "#475569",
                    background: active ? "#f0f9ff" : "#fff",
                    borderTop: "1px solid #f1f5f9",
                  }}>
                    {frame.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected-frame summary */}
          {selectedFrame && (
            <div style={{
              marginTop: 20, padding: "12px 16px",
              background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 12,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <img
                src={`/frames/${selectedFrame.file}`}
                alt={selectedFrame.label}
                style={{ width: 48, height: 48, objectFit: "contain", background: "#fff", borderRadius: 8, padding: 4, border: "1px solid #e2e8f0", flexShrink: 0 }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#166534" }}>
                  <i className="bi bi-check-circle-fill me-2" />
                  {selectedFrame.label} selected — {slots.length} photo slot{slots.length !== 1 ? "s" : ""}
                </div>
                <div style={{ fontSize: 13, color: "#4ade80", marginTop: 2 }}>
                  You&apos;ll upload up to {slots.length} individual photo{slots.length !== 1 ? "s" : ""} in the next step.
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
            <button
              className={styles.nextButton}
              onClick={() => goToStep(2)}
              disabled={!selectedFrame}
              type="button"
            >
              Continue — {slots.length} slot{slots.length !== 1 ? "s" : ""} ready
              <i className="bi bi-arrow-right ms-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Step 2: Upload photos into each slot ───────────────────────────────────
  const renderStep2 = () => (
    <div className={styles.stepContainer}>
      <div className="container">
        <div className="row g-4">
          {/* Left: composite preview + slot buttons */}
          <div className="col-sm-12 col-lg-8">
            <div className={styles.uploadCard}>
              <div
                className={`${styles.uploadZone} ${isDragging ? styles.dragging : ""}`}
                style={{ minHeight: 420, padding: 20, display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#475569" }}>
                  {isDragging
                    ? `Drop to fill Slot ${activeSlot + 1}`
                    : "Click a slot on the frame below, or use the buttons to pick which slot to fill"}
                </p>
                {renderComposite({ interactive: true, wallBg: false })}
                {isProcessing && (
                  <p style={{ margin: 0, fontWeight: 600, color: "#0f172a" }}>Processing…</p>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="d-none" />
            </div>

            {/* Slot status pills */}
            <div style={{ marginTop: 14, padding: "14px 18px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16 }}>
              <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
                Photo slots — click to select &amp; upload
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {slots.map((slot, i) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => handleSlotClick(i)}
                    style={{
                      padding: "5px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                      background: slotImages[i] ? "#dcfce7" : activeSlot === i ? "#0f172a" : "#f1f5f9",
                      color:      slotImages[i] ? "#16a34a" : activeSlot === i ? "#fff"    : "#475569",
                      border: `1px solid ${slotImages[i] ? "#86efac" : activeSlot === i ? "#0f172a" : "#e2e8f0"}`,
                      transition: "all 0.18s",
                    }}
                  >
                    {slotImages[i] ? `✓ Slot ${i + 1}` : `Slot ${i + 1}`}
                  </button>
                ))}
              </div>

              {/* Progress bar */}
              <div style={{ marginTop: 12, height: 5, background: "#e2e8f0", borderRadius: 99, overflow: "hidden" }}>
                <div style={{
                  height: "100%", background: "#16a34a", borderRadius: 99,
                  width: `${(slotImages.filter(Boolean).length / Math.max(slots.length, 1)) * 100}%`,
                  transition: "width 0.3s",
                }} />
              </div>
              <p style={{ margin: "5px 0 0", fontSize: 12, color: "#64748b" }}>
                {slotImages.filter(Boolean).length} of {slots.length} slots filled
              </p>
            </div>

            <div style={{ marginTop: 8, textAlign: "right" }}>
              <button
                type="button"
                onClick={() => goToStep(1)}
                style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
              >
                <i className="bi bi-arrow-left me-1" />Change frame
              </button>
            </div>
          </div>

          {/* Right: upload guide */}
          <div className="col-sm-12 col-lg-4">
            <div className={styles.guideCard}>
              <h4 className={styles.guideTitle}>
                <i className="bi bi-info-circle me-2" />Upload Guide
              </h4>
              <ul className={styles.guideList}>
                <li><i className="bi bi-check-circle-fill" /> Click any numbered slot on the frame to upload a photo into it</li>
                <li><i className="bi bi-check-circle-fill" /> Or click a slot button below the frame</li>
                <li><i className="bi bi-check-circle-fill" /> Drag &amp; drop a photo onto the frame to fill the active slot</li>
                <li><i className="bi bi-check-circle-fill" /> Click ✕ on a filled slot to replace it</li>
                <li><i className="bi bi-check-circle-fill" /> High-resolution images recommended</li>
                <li className={styles.warning}><i className="bi bi-exclamation-triangle-fill" /> At least 1 photo required to continue</li>
              </ul>

              <div style={{ marginTop: 14, padding: 14, background: "#eff6ff", borderRadius: 12, border: "1px solid #bfdbfe" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#1e40af", marginBottom: 4 }}>
                  {selectedFrame?.label}
                </div>
                <div style={{ fontSize: 13, color: "#1e40af" }}>
                  {slotImages.filter(Boolean).length} / {slots.length} photos uploaded
                </div>
              </div>

              <button
                className={styles.nextButton}
                onClick={() => goToStep(3)}
                disabled={!slotImages.some(Boolean)}
                type="button"
                style={{ marginTop: 20 }}
              >
                Continue to Customize &amp; Payment
                <i className="bi bi-arrow-right ms-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Step 3: Customize & Pay ────────────────────────────────────────────────
  const renderStep3 = () => {
    const total = calculatePrice();
    const thicknessInfo = {
      "3mm": { desc: "Slim",     icon: "bi-layers",      color: "#10b981" },
      "5mm": { desc: "Standard", icon: "bi-layers-fill",  color: "#2563eb" },
      "8mm": { desc: "Premium",  icon: "bi-stack",        color: "#7c3aed" },
    };
    const fieldStyle = {
      borderRadius: "10px", border: "1.5px solid #e2e8f0",
      padding: "11px 14px", fontSize: "15px", width: "100%",
      background: "#fff", outline: "none",
    };
    const sectionHeader = (icon, title, subtitle) => (
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "22px" }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "12px", flexShrink: 0,
          background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <i className={`bi ${icon}`} style={{ color: "#fff", fontSize: "18px" }} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: "17px", color: "#0f172a" }}>{title}</div>
          {subtitle && <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>{subtitle}</div>}
        </div>
      </div>
    );

    return (
      <div style={{ background: "linear-gradient(180deg, #f0f7ff 0%, #f8fafc 50%, #f1f5f9 100%)", paddingBottom: "48px" }}>
        <div className="container-fluid" style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 20px 0" }}>
          <div className="row g-4 align-items-start">

            {/* Left: sticky preview */}
            <div className="col-lg-5" style={{ position: "sticky", top: "20px" }}>
              <div style={cardStyle}>
                {sectionHeader("bi-display", "Live Preview", "Review your framed print")}
                {renderComposite({ interactive: false, wallBg: true })}
                <button type="button" onClick={() => goToStep(2)}
                  style={{ width: "100%", marginTop: "16px", borderRadius: "12px", padding: "10px 16px", border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "14px", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <i className="bi bi-arrow-left" />Back to Upload
                </button>
              </div>
            </div>

            {/* Right: cards */}
            <div className="col-lg-7">

              {/* Customize Options */}
              <div style={{ ...cardStyle, marginBottom: "20px" }}>
                {sectionHeader("bi-sliders", "Customise Options", "Choose your size, thickness & quantity")}

                {/* Size pills */}
                <div style={{ marginBottom: "24px" }}>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: "#334155", marginBottom: "10px" }}>
                    <i className="bi bi-rulers me-2" style={{ color: "#2563eb" }} />Size (inches)
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {sizeOptions.map((s) => (
                      <button key={s} type="button"
                        onClick={() => { setSize(s); setIsPaymentReady(false); }}
                        style={{
                          padding: "10px 16px", borderRadius: "10px", fontWeight: 600, fontSize: "14px",
                          border: size === s ? "2px solid #2563eb" : "1.5px solid #e2e8f0",
                          background: size === s ? "#eff6ff" : "#fff",
                          color: size === s ? "#2563eb" : "#475569",
                          cursor: "pointer", transition: "all 0.18s",
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thickness cards */}
                <div style={{ marginBottom: "24px" }}>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: "#334155", marginBottom: "10px" }}>
                    <i className="bi bi-layers me-2" style={{ color: "#2563eb" }} />Thickness
                  </div>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {["3mm","5mm","8mm"].map((t) => {
                      const info = thicknessInfo[t];
                      const active = thickness === t;
                      return (
                        <button key={t} type="button"
                          onClick={() => { setThickness(t); setIsPaymentReady(false); }}
                          style={{
                            flex: "1 1 80px", padding: "12px 10px", borderRadius: "12px",
                            border: active ? `2px solid ${info.color}` : "1.5px solid #e2e8f0",
                            background: active ? "#f8fafc" : "#fff",
                            cursor: "pointer", transition: "all 0.18s", textAlign: "center",
                          }}>
                          <i className={`bi ${info.icon}`} style={{ fontSize: "18px", color: active ? info.color : "#94a3b8", display: "block", marginBottom: "4px" }} />
                          <div style={{ fontWeight: 700, fontSize: "13px", color: active ? "#0f172a" : "#475569" }}>{t}</div>
                          <div style={{ fontSize: "11px", color: active ? info.color : "#94a3b8", fontWeight: 500 }}>{info.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quantity stepper */}
                <div>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: "#334155", marginBottom: "10px" }}>
                    <i className="bi bi-hash me-2" style={{ color: "#2563eb" }} />Quantity
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button type="button"
                      onClick={() => { setQuantity(Math.max(1, quantity - 1)); setIsPaymentReady(false); }}
                      style={{ width: "40px", height: "40px", borderRadius: "10px", border: "1.5px solid #e2e8f0", background: "#fff", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="bi bi-dash" />
                    </button>
                    <div style={{ minWidth: "60px", textAlign: "center", fontWeight: 700, fontSize: "18px", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff", borderRadius: "10px", padding: "8px 16px" }}>
                      {quantity}
                    </div>
                    <button type="button"
                      onClick={() => { setQuantity(quantity + 1); setIsPaymentReady(false); }}
                      style={{ width: "40px", height: "40px", borderRadius: "10px", border: "1.5px solid #e2e8f0", background: "#fff", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="bi bi-plus" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Dark Order Summary */}
              <div style={{ background: "linear-gradient(145deg, #0f172a, #1e293b)", borderRadius: "24px", padding: "24px", marginBottom: "20px", boxShadow: "0 20px 50px rgba(15,23,42,0.25)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className="bi bi-receipt" style={{ color: "#60a5fa", fontSize: "18px" }} />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: "17px", color: "#fff" }}>Order Summary</div>
                </div>
                <div style={{ display: "grid", gap: "12px" }}>
                  {[
                    ["Order ID",  orderId],
                    ["Frame",     selectedFrame?.label || "—"],
                    ["Photos",    `${slotImages.filter(Boolean).length}/${slots.length} filled`],
                    ["Size",      `${size} inches`],
                    ["Thickness", thickness],
                    ["Quantity",  quantity],
                  ].map(([label, val]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <span style={{ fontSize: "14px", color: "#94a3b8" }}>{label}</span>
                      <span style={{ fontSize: "14px", fontWeight: 600, color: "#e2e8f0" }}>{val}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>Total Amount</span>
                  <span style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff", fontWeight: 800, fontSize: "18px", borderRadius: "999px", padding: "8px 20px" }}>
                    ₹{total}
                  </span>
                </div>
              </div>

              {/* Delivery check */}
              <div style={{ ...cardStyle, marginBottom: "20px" }}>
                {sectionHeader("bi-geo-alt", "Check Delivery", "Verify we deliver to your location")}
                <div className="d-flex gap-2">
                  <input type="text" value={pincode} placeholder="6-digit pincode"
                    onChange={(e) => { setPincode(e.target.value.replace(/\D/g,"").slice(0,6)); setDeliveryStatus({ message:"", type:"", isChecking:false }); }}
                    style={{ ...fieldStyle, flex: 1 }} />
                  <button type="button"
                    style={{ borderRadius: "12px", whiteSpace: "nowrap", padding: "12px 18px", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}
                    onClick={() => {
                      if (pincode.length !== 6) { showNotification("Enter a valid 6-digit pincode","warning"); return; }
                      setDeliveryStatus({ message:"", type:"", isChecking:true });
                      setTimeout(() => {
                        const ok = ["110001","400001","700001","560001","600001"].includes(pincode);
                        if (ok) {
                          setDeliveryStatus({ type:"success", message:"Delivery available!", isChecking:false });
                          setEstimatedDeliveryDate("3-5 business days");
                          showNotification("We deliver to this location","success");
                        } else {
                          setDeliveryStatus({ type:"error", message:"We don't deliver here yet.", isChecking:false });
                          setEstimatedDeliveryDate("");
                          showNotification("We don't deliver to this location yet","error");
                        }
                      }, 1000);
                    }}>
                    {deliveryStatus.isChecking ? "Checking…" : "Check"}
                  </button>
                </div>
                {deliveryStatus.message && (
                  <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: deliveryStatus.type === "success" ? "#16a34a" : "#dc2626" }}>
                    {deliveryStatus.message}
                    {estimatedDeliveryDate && <span style={{ marginLeft: 6, color: "#64748b" }}>&bull; {estimatedDeliveryDate}</span>}
                  </div>
                )}
              </div>

              {/* Contact & Delivery */}
              <div style={cardStyle}>
                {sectionHeader("bi-truck", "Contact & Delivery", "Enter your shipping details")}
                <div className="row g-3">
                  <div className="col-12">
                    <label style={labelStyle}><i className="bi bi-person me-2" style={{ color: "#2563eb" }} />Full Name *</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} style={fieldStyle} />
                    {renderFieldError("fullName")}
                  </div>
                  <div className="col-md-6">
                    <label style={labelStyle}><i className="bi bi-envelope me-2" style={{ color: "#2563eb" }} />Email *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} style={fieldStyle} />
                    {renderFieldError("email")}
                  </div>
                  <div className="col-md-6">
                    <label style={labelStyle}><i className="bi bi-telephone me-2" style={{ color: "#2563eb" }} />Phone *</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} style={fieldStyle} />
                    {renderFieldError("phone")}
                  </div>
                  <div className="col-md-6">
                    <label style={labelStyle}><i className="bi bi-telephone me-2" style={{ color: "#2563eb" }} />Alternate Phone</label>
                    <input type="text" name="alternatePhone" value={formData.alternatePhone} onChange={handleInputChange} style={fieldStyle} />
                    {renderFieldError("alternatePhone")}
                  </div>
                  <div className="col-md-6">
                    <label style={labelStyle}><i className="bi bi-mailbox me-2" style={{ color: "#2563eb" }} />Pincode *</label>
                    <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} style={fieldStyle} />
                    {renderFieldError("pincode")}
                  </div>
                  <div className="col-12">
                    <label style={labelStyle}><i className="bi bi-geo-alt me-2" style={{ color: "#2563eb" }} />Address *</label>
                    <textarea name="address" value={formData.address} onChange={handleInputChange} rows="3" style={{ ...fieldStyle, resize: "none" }} />
                    {renderFieldError("address")}
                  </div>
                  <div className="col-md-6">
                    <label style={labelStyle}><i className="bi bi-building me-2" style={{ color: "#2563eb" }} />City *</label>
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} style={fieldStyle} />
                    {renderFieldError("city")}
                  </div>
                  <div className="col-md-6">
                    <label style={labelStyle}><i className="bi bi-map me-2" style={{ color: "#2563eb" }} />State *</label>
                    <input type="text" name="state" value={formData.state} onChange={handleInputChange} style={fieldStyle} />
                    {renderFieldError("state")}
                  </div>
                </div>

                <div style={{ marginTop: "24px" }}>
                  {!isPaymentReady ? (
                    <button type="button"
                      onClick={() => handleSubmitOrder({ preventDefault: () => {} })}
                      style={{
                        width: "100%", borderRadius: "14px", padding: "15px 18px",
                        fontWeight: 700, fontSize: "16px",
                        background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                        color: "#fff", border: "none", cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
                      }}>
                      <i className="bi bi-shield-check me-2" />Verify Details &amp; Pay Now
                    </button>
                  ) : (
                    <RazorpayPayment
                      amount={total}
                      customerDetails={{
                        ...formData,
                        name: formData.fullName, orderId,
                        productType: "png_frame",
                        productName: `${selectedFrame?.label || "Framed"} Print`,
                        frameName:   selectedFrame?.label || "",
                        size, thickness, quantity, amount: total,
                        slotsCount:  slots.length,
                        slotsFilled: slotImages.filter(Boolean).length,
                      }}
                      previewImages={[mailPreviewImage]}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      buttonText={`Pay Now ₹${total}`}
                      themeColor="#2563eb"
                    />
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <>
      {renderStepIndicator()}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      {/* Toast */}
      {showToast.visible && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          minWidth: 280, maxWidth: 380,
          background: "#fff", borderRadius: 16,
          boxShadow: "0 18px 40px rgba(15,23,42,0.16)",
          border: "1px solid #e2e8f0", overflow: "hidden",
        }}>
          <div style={{
            padding: "14px 16px",
            borderLeft: `4px solid ${showToast.type === "success" ? "#16a34a" : showToast.type === "error" ? "#dc2626" : showToast.type === "warning" ? "#f59e0b" : "#2563eb"}`,
          }}>
            <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>{showToast.title}</div>
            <div style={{ fontSize: 14, color: "#475569" }}>{showToast.message}</div>
          </div>
        </div>
      )}

      {/* Success modal */}
      <div className="modal fade" id="pngFrameSuccessModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius: 24 }}>
            <div className="modal-body text-center p-5">
              <div style={{ width: 72, height: 72, margin: "0 auto 18px", borderRadius: "999px", display: "grid", placeItems: "center", background: "#dcfce7", color: "#16a34a", fontSize: 32 }}>
                <i className="bi bi-check2" />
              </div>
              <h3 style={{ fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>Payment Successful</h3>
              <p style={{ color: "#64748b", marginBottom: 20 }}>Your framed photo print order has been received.</p>
              <button type="button" className="btn btn-dark" data-bs-dismiss="modal" style={{ borderRadius: 14, padding: "12px 24px" }}>Close</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

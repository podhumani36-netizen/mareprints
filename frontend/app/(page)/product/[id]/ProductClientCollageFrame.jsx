"use client";

import { useState, useRef, useEffect } from "react";
import styles from "../../../assest/style/ProductClient.module.css";
import RazorpayPayment from "../../../Components/payment/Razorpay";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const WALL_MOCKUP =
  "https://res.cloudinary.com/dsprfys3x/image/upload/v1773637296/wmremove-transformed_f1xtnt.jpg";

// 6 photo slots: 3×2 grid (matches reference image grid collage frames)
const SLOT_CONFIG = [
  { id: 0, row: 0, col: 0, label: "Photo 1" },
  { id: 1, row: 0, col: 1, label: "Photo 2" },
  { id: 2, row: 0, col: 2, label: "Photo 3" },
  { id: 3, row: 1, col: 0, label: "Photo 4" },
  { id: 4, row: 1, col: 1, label: "Photo 5" },
  { id: 5, row: 1, col: 2, label: "Photo 6" },
];

const SIZE_OPTIONS = ["12x8", "16x12", "20x16", "24x18"];
const BASE_PRICE = 1499;

export default function ProductClientCollageFrame({ product }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState(Array(6).fill(null));
  const [activeSlot, setActiveSlot] = useState(0);
  const [frameColor, setFrameColor] = useState("#1a1a1a");
  const [size, setSize] = useState("16x12");
  const [thickness, setThickness] = useState("5mm");
  const [quantity, setQuantity] = useState(1);
  const [orderId, setOrderId] = useState("");
  const [isPaymentReady, setIsPaymentReady] = useState(false);
  const [mailPreviewImage, setMailPreviewImage] = useState("");
  const [showToast, setShowToast] = useState({
    visible: false, type: "", title: "", message: "",
  });
  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", alternatePhone: "",
    address: "", city: "", state: "", pincode: "", paymentMethod: "razorpay",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js").catch(() => {});
    setOrderId(`#ORD${Math.floor(Math.random() * 9000 + 1000)}`);
  }, []);

  const showNotification = (msg, type = "info", title = "") => {
    const titles = { success: "Success", error: "Error", warning: "Warning" };
    setShowToast({ visible: true, type, title: title || titles[type] || "Info", message: msg });
    setTimeout(() => setShowToast({ visible: false, type: "", title: "", message: "" }), 3000);
  };

  const openSuccessModal = () => {
    if (typeof window !== "undefined" && window.bootstrap) {
      const el = document.getElementById("collageSuccessModal");
      if (el) new window.bootstrap.Modal(el).show();
    }
  };

  const calculatePrice = () => {
    let price = BASE_PRICE;
    const idx = SIZE_OPTIONS.indexOf(size);
    if (idx > 0) price += idx * 200;
    if (thickness === "5mm") price += 150;
    if (thickness === "8mm") price += 300;
    return price * quantity;
  };

  const processFile = (file, slotId) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { showNotification("File too large (max 50MB)", "error"); return; }
    if (!file.type.startsWith("image/")) { showNotification("Please upload an image file", "error"); return; }
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImages((prev) => { const n = [...prev]; n[slotId] = e.target.result; return n; });
      setIsProcessing(false);
      setIsPaymentReady(false);
      showNotification(`${SLOT_CONFIG[slotId].label} uploaded!`, "success");
    };
    reader.onerror = () => { setIsProcessing(false); showNotification("Failed to read file", "error"); };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e) => {
    processFile(e.target.files?.[0], activeSlot);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSlotClick = (slotId) => {
    setActiveSlot(slotId);
    setTimeout(() => fileInputRef.current?.click(), 0);
  };

  const handleRemoveSlotImage = (slotId, e) => {
    e.stopPropagation();
    setImages((prev) => { const n = [...prev]; n[slotId] = null; return n; });
    setIsPaymentReady(false);
    showNotification(`${SLOT_CONFIG[slotId].label} removed`, "warning");
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    processFile(e.dataTransfer.files?.[0], activeSlot);
  };

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
    if (formData.alternatePhone && !/^\d{10}$/.test(formData.alternatePhone))
      e.alternatePhone = "Must be 10 digits";
    if (!formData.address.trim()) e.address = "Address is required";
    if (!formData.city.trim()) e.city = "City is required";
    if (!formData.state.trim()) e.state = "State is required";
    if (!formData.pincode.trim()) e.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(formData.pincode)) e.pincode = "Must be 6 digits";
    return e;
  };

  // Canvas export: 1800×1200 (3×2 grid, 600×600 per slot)
  const generateMailPreviewImage = async () => {
    try {
      const COLS = 3, ROWS = 2;
      const GAP = 12, BORDER = 20;
      const SLOT_W = 560, SLOT_H = 560;
      const W = COLS * SLOT_W + (COLS - 1) * GAP + BORDER * 2;
      const H = ROWS * SLOT_H + (ROWS - 1) * GAP + BORDER * 2;
      const canvas = document.createElement("canvas");
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext("2d");

      // Frame background
      ctx.fillStyle = frameColor;
      ctx.fillRect(0, 0, W, H);

      for (const slot of SLOT_CONFIG) {
        const sx = BORDER + slot.col * (SLOT_W + GAP);
        const sy = BORDER + slot.row * (SLOT_H + GAP);
        if (!images[slot.id]) {
          ctx.fillStyle = "#e2e8f0";
          ctx.fillRect(sx, sy, SLOT_W, SLOT_H);
          continue;
        }
        const img = new Image();
        img.src = images[slot.id];
        await new Promise((res) => { img.onload = res; img.onerror = res; });
        ctx.save();
        ctx.beginPath(); ctx.rect(sx, sy, SLOT_W, SLOT_H); ctx.clip();
        const ir = img.width / img.height;
        const sr = SLOT_W / SLOT_H;
        let dx, dy, dw, dh;
        if (ir > sr) { dh = SLOT_H; dw = dh * ir; dx = sx - (dw - SLOT_W) / 2; dy = sy; }
        else { dw = SLOT_W; dh = dw / ir; dx = sx; dy = sy - (dh - SLOT_H) / 2; }
        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.restore();
      }
      return canvas.toDataURL("image/png");
    } catch (err) {
      console.error("Export failed:", err);
      return "";
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!images.some(Boolean)) { showNotification("Please upload at least one photo", "warning"); return; }
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showNotification("Please fill all required fields", "error");
      return;
    }
    setFormErrors({});
    const preview = await generateMailPreviewImage();
    setMailPreviewImage(preview);
    setIsPaymentReady(true);
    showNotification("Details verified! Click Pay Now.", "success");
  };

  const handlePaymentSuccess = () => { showNotification("Payment successful!", "success"); openSuccessModal(); setIsPaymentReady(false); };
  const handlePaymentError = () => showNotification("Payment failed. Please try again.", "error");

  const goToStep = (step) => {
    if (step === 2 && !images.some(Boolean)) { showNotification("Please upload at least one photo first", "warning"); return; }
    setCurrentStep(step);
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const inputStyle = { borderRadius: "0px", minHeight: "10px", border: "1px solid #dbe3ee", background: "#ffffff", boxShadow: "none", padding: "12px 14px", fontSize: "15px" };
  const labelStyle = { fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "8px", display: "block" };
  const sectionCardStyle = { background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "24px", padding: "24px", boxShadow: "0 10px 30px rgba(15,23,42,0.05)" };
  const renderFieldError = (field) => formErrors[field] ? (
    <div style={{ marginTop: "6px", fontSize: "13px", color: "#dc2626", fontWeight: 600 }}>{formErrors[field]}</div>
  ) : null;

  // ── Collage Preview ───────────────────────────────────────────────────────
  const renderCollagePreview = (useWall = false) => (
    <div style={{
      position: "relative", width: "100%", minHeight: "460px",
      borderRadius: "28px", overflow: "hidden",
      background: useWall ? undefined : "#f8fafc",
      backgroundImage: useWall ? `url(${WALL_MOCKUP})` : undefined,
      backgroundSize: useWall ? "cover" : undefined,
      backgroundPosition: useWall ? "center" : undefined,
      border: "1px solid #e2e8f0",
    }}>
      {useWall && <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />}

      {/* Collage frame container */}
      <div style={{
        position: "absolute", left: "50%", top: "48%",
        transform: "translate(-50%, -50%)",
        padding: "10px",
        background: frameColor,
        borderRadius: "4px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
        display: "inline-block",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 130px)",
          gridTemplateRows: "repeat(2, 115px)",
          gap: "6px",
        }}>
          {SLOT_CONFIG.map((slot) => (
            <div
              key={slot.id}
              onClick={() => handleSlotClick(slot.id)}
              style={{
                width: 130, height: 115,
                overflow: "hidden",
                cursor: "pointer",
                background: images[slot.id] ? "transparent" : "#cbd5e1",
                outline: activeSlot === slot.id ? "2px solid #0ea5e9" : "2px solid transparent",
                transition: "outline-color 0.15s",
                position: "relative",
              }}
            >
              {images[slot.id] ? (
                <>
                  <img src={images[slot.id]} alt={slot.label}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }} />
                  <button onClick={(e) => handleRemoveSlotImage(slot.id, e)}
                    style={{ position: "absolute", top: 3, right: 3, width: 18, height: 18, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.65)", color: "#fff", fontSize: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, zIndex: 10 }}>
                    ✕
                  </button>
                </>
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, color: "#64748b", userSelect: "none" }}>
                  <i className="bi bi-plus-circle" style={{ fontSize: 16 }} />
                  <span style={{ fontSize: 8, fontWeight: 600, textAlign: "center", lineHeight: 1.2 }}>{slot.label}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Info pills */}
      <div style={{ position: "absolute", bottom: "14px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        {[`${size} inches`, `${images.filter(Boolean).length}/6 photos`].map((label) => (
          <span key={label} style={{ background: "rgba(255,255,255,0.95)", padding: "7px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 500, color: "#0f172a", border: "1px solid #e2e8f0" }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );

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
                disabled={step > 1 && !images.some(Boolean)}
                type="button"
              >
                <span className={styles.stepNumber}>{currentStep > step ? <i className="bi bi-check-lg" /> : step}</span>
                <span className={styles.stepLabel}>{step === 1 ? "Upload Photos" : "Customize & Payment"}</span>
              </button>
              {step < 2 && <div className={`${styles.stepConnector} ${currentStep > step ? styles.completed : ""}`} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Step 1: Upload ────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <div className={styles.stepContainer}>
      <div className="container">
        <div className="row g-4">
          <div className="col-sm-12 col-lg-8">
            <div className={styles.uploadCard}>
              <div
                className={`${styles.uploadZone} ${isDragging ? styles.dragging : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{ minHeight: 460, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: 24 }}
              >
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#475569" }}>
                  {isDragging ? `Drop to add to ${SLOT_CONFIG[activeSlot].label}` : "Click a slot to upload — 6 photos, one per slot"}
                </p>
                {renderCollagePreview(false)}
                {isProcessing && <p style={{ fontWeight: 600, color: "#0f172a" }}>Processing...</p>}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="d-none" />
            </div>

            {/* Slot buttons */}
            <div className={`${styles.uploadCard} mt-4`} style={{ padding: "14px 20px" }}>
              <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
                Select a slot then browse or drag & drop a photo
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {SLOT_CONFIG.map((slot) => (
                  <button key={slot.id} type="button" onClick={() => handleSlotClick(slot.id)}
                    style={{
                      padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                      background: images[slot.id] ? "#dcfce7" : activeSlot === slot.id ? "#0f172a" : "#f1f5f9",
                      color: images[slot.id] ? "#16a34a" : activeSlot === slot.id ? "#fff" : "#475569",
                      border: `1px solid ${images[slot.id] ? "#86efac" : activeSlot === slot.id ? "#0f172a" : "#e2e8f0"}`,
                      transition: "all 0.2s",
                    }}>
                    {images[slot.id] ? `✓ ${slot.label}` : slot.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="col-sm-12 col-lg-4">
            <div className={styles.guideCard}>
              <h4 className={styles.guideTitle}><i className="bi bi-info-circle me-2" />Upload Guide</h4>
              <ul className={styles.guideList}>
                <li><i className="bi bi-check-circle-fill" /> 6 individual photo slots (3×2 grid)</li>
                <li><i className="bi bi-check-circle-fill" /> Click any slot to upload its photo</li>
                <li><i className="bi bi-check-circle-fill" /> Formats: JPG, PNG, GIF (max 50MB)</li>
                <li><i className="bi bi-check-circle-fill" /> Square photos fill slots best</li>
                <li className={styles.warning}><i className="bi bi-exclamation-triangle-fill" /> At least 1 photo required</li>
              </ul>
              {/* Progress */}
              <div style={{ marginTop: 14, padding: 14, background: "#eff6ff", borderRadius: 12, border: "1px solid #bfdbfe" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#1e40af", marginBottom: 6 }}>Upload Progress</div>
                <div style={{ fontSize: 13, color: "#1e40af", marginBottom: 8 }}>{images.filter(Boolean).length} of 6 photos uploaded</div>
                <div style={{ height: 6, background: "#bfdbfe", borderRadius: 99 }}>
                  <div style={{ height: "100%", background: "#2563eb", borderRadius: 99, width: `${(images.filter(Boolean).length / 6) * 100}%`, transition: "width 0.3s" }} />
                </div>
              </div>
              <button className={styles.nextButton} onClick={() => goToStep(2)}
                disabled={!images.some(Boolean)} type="button" style={{ marginTop: 22 }}>
                Continue to Customize & Payment
                <i className="bi bi-arrow-right ms-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Step 2 ────────────────────────────────────────────────────────────────
  const renderStep2 = () => {
    const total = calculatePrice();
    return (
      <div className={styles.stepContainer} style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 55%, #f1f5f9 100%)" }}>
        <div className="container">
          <div className="row g-4 align-items-start">
            <div className="col-lg-7">
              <div style={sectionCardStyle}>
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
                  <div>
                    <h3 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#0f172a" }}>Live Preview</h3>
                    <p style={{ margin: "6px 0 0", fontSize: 14, color: "#64748b" }}>Review your collage frame</p>
                  </div>
                  <button type="button" className="btn btn-outline-dark" onClick={() => goToStep(1)} style={{ borderRadius: 12 }}>
                    <i className="bi bi-arrow-left me-2" />Back
                  </button>
                </div>
                {renderCollagePreview(true)}

                <div style={{ ...sectionCardStyle, marginTop: 20 }}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label style={labelStyle}>Size (inches)</label>
                      <select value={size} onChange={(e) => { setSize(e.target.value); setIsPaymentReady(false); }}
                        style={{ ...inputStyle, width: "100%", appearance: "none", cursor: "pointer" }}>
                        {SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Thickness</label>
                      <select value={thickness} onChange={(e) => { setThickness(e.target.value); setIsPaymentReady(false); }}
                        style={{ ...inputStyle, width: "100%", appearance: "none", cursor: "pointer" }}>
                        {["3mm", "5mm", "8mm"].map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Frame Color</label>
                      <select value={frameColor} onChange={(e) => { setFrameColor(e.target.value); setIsPaymentReady(false); }}
                        style={{ ...inputStyle, width: "100%", appearance: "none", cursor: "pointer" }}>
                        {[
                          { v: "#1a1a1a", l: "Matte Black" },
                          { v: "#1a1a2e", l: "Dark Navy" },
                          { v: "#2d1b00", l: "Dark Walnut" },
                          { v: "#ffffff", l: "White" },
                          { v: "#c0c0c0", l: "Silver" },
                          { v: "#8b6914", l: "Gold" },
                        ].map(({ v, l }) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Quantity</label>
                      <input type="number" min="1" value={quantity}
                        onChange={(e) => { setQuantity(Math.max(1, Number(e.target.value) || 1)); setIsPaymentReady(false); }}
                        style={{ ...inputStyle, width: "100%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <form onSubmit={handleSubmitOrder}>
                <div style={{ ...sectionCardStyle, marginBottom: 20 }}>
                  <h4 style={{ marginBottom: 18, fontWeight: 800, color: "#0f172a" }}>Order Summary</h4>
                  <div style={{ display: "grid", gap: 10, fontSize: 15, color: "#334155" }}>
                    {[
                      ["Product", "Photo Collage Frame"],
                      ["Photos", `${images.filter(Boolean).length}/6 uploaded`],
                      ["Size", size + " inches"],
                      ["Thickness", thickness],
                      ["Quantity", quantity],
                      ["Total", `₹${total}`],
                    ].map(([label, val]) => (
                      <div key={label} className="d-flex justify-content-between">
                        <span>{label}</span><strong>{val}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ ...sectionCardStyle, marginBottom: 20 }}>
                  <h4 style={{ marginBottom: 18, fontWeight: 800, color: "#0f172a" }}>Customer Details</h4>
                  <div className="row g-3">
                    <div className="col-12">
                      <label style={labelStyle}>Full Name *</label>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} style={{ ...inputStyle, width: "100%" }} />
                      {renderFieldError("fullName")}
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Email *</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} style={{ ...inputStyle, width: "100%" }} />
                      {renderFieldError("email")}
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Phone *</label>
                      <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} style={{ ...inputStyle, width: "100%" }} />
                      {renderFieldError("phone")}
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Alternate Phone</label>
                      <input type="text" name="alternatePhone" value={formData.alternatePhone} onChange={handleInputChange} style={{ ...inputStyle, width: "100%" }} />
                      {renderFieldError("alternatePhone")}
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Pincode *</label>
                      <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} style={{ ...inputStyle, width: "100%" }} />
                      {renderFieldError("pincode")}
                    </div>
                    <div className="col-12">
                      <label style={labelStyle}>Address *</label>
                      <textarea name="address" value={formData.address} onChange={handleInputChange} rows="3"
                        style={{ ...inputStyle, width: "100%", resize: "none" }} />
                      {renderFieldError("address")}
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>City *</label>
                      <input type="text" name="city" value={formData.city} onChange={handleInputChange} style={{ ...inputStyle, width: "100%" }} />
                      {renderFieldError("city")}
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>State *</label>
                      <input type="text" name="state" value={formData.state} onChange={handleInputChange} style={{ ...inputStyle, width: "100%" }} />
                      {renderFieldError("state")}
                    </div>
                    <div className="col-12">
                      <label style={labelStyle}>Order ID</label>
                      <input type="text" value={orderId} readOnly style={{ ...inputStyle, width: "100%", color: "#64748b" }} />
                    </div>
                  </div>
                </div>

                <div style={sectionCardStyle}>
                  {!isPaymentReady ? (
                    <button type="submit" className="btn btn-dark w-100"
                      style={{ borderRadius: 14, padding: "14px 18px", fontWeight: 700, fontSize: 16 }}>
                      Verify Details & Pay Now
                    </button>
                  ) : (
                    <RazorpayPayment
                      amount={total}
                      customerDetails={formData}
                      previewImage={mailPreviewImage}
                      productDetails={{ orientation: "collage_frame", size, thickness, quantity, orderId, frameColor, photosCount: images.filter(Boolean).length }}
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

      {showToast.visible && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, minWidth: 280, maxWidth: 380, background: "#fff", borderRadius: 16, boxShadow: "0 18px 40px rgba(15,23,42,0.16)", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderLeft: `4px solid ${showToast.type === "success" ? "#16a34a" : showToast.type === "error" ? "#dc2626" : showToast.type === "warning" ? "#f59e0b" : "#2563eb"}` }}>
            <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>{showToast.title}</div>
            <div style={{ fontSize: 14, color: "#475569" }}>{showToast.message}</div>
          </div>
        </div>
      )}

      <div className="modal fade" id="collageSuccessModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius: 24 }}>
            <div className="modal-body text-center p-5">
              <div style={{ width: 72, height: 72, margin: "0 auto 18px", borderRadius: "999px", display: "grid", placeItems: "center", background: "#dcfce7", color: "#16a34a", fontSize: 32 }}>
                <i className="bi bi-check2" />
              </div>
              <h3 style={{ fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>Payment Successful</h3>
              <p style={{ color: "#64748b", marginBottom: 20 }}>Your photo collage frame order has been received.</p>
              <button type="button" className="btn btn-dark" data-bs-dismiss="modal"
                style={{ borderRadius: 14, padding: "12px 24px" }}>Close</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

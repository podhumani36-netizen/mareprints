"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import styles from "../../../assest/style/ProductClient.module.css";
import RazorpayPayment from "../../../Components/payment/Razorpay";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const ROOM_WALL_BG =
  "https://res.cloudinary.com/dsprfys3x/image/upload/v1773634493/Gemini_Generated_Image_g2ds8ig2ds8ig2ds_puojbl.png";
const WALL_MOCKUP =
  "https://res.cloudinary.com/dsprfys3x/image/upload/v1773637296/wmremove-transformed_f1xtnt.jpg";

// Heart SVG path — 300 × 280 coordinate space
const HEART_PATH =
  "M150,270 C85,215 12,160 12,94 C12,50 48,12 94,12 C118,12 140,24 150,42 C160,24 182,12 206,12 C252,12 288,50 288,94 C288,160 215,215 150,270 Z";

const SIZE_OPTIONS = ["8x8", "12x12", "16x16", "20x20"];
const FRAME_DIMENSIONS = {
  "8x8":   { width: 210, height: 196 },
  "12x12": { width: 270, height: 252 },
  "16x16": { width: 300, height: 280 },
  "20x20": { width: 330, height: 308 },
};
const BASE_PRICE = 1199;
// Canvas export: 300×5 = 1500, 280×5 = 1400
const EXPORT_W = 1500;
const EXPORT_H = 1400;
const EXPORT_SCALE = 5;

function scalePath(pathStr, sx, sy) {
  return pathStr.replace(/(-?\d*\.?\d+),(-?\d*\.?\d+)/g, (_, x, y) =>
    `${parseFloat(x) * sx},${parseFloat(y) * sy}`
  );
}

export default function ProductClientHeartFrame() {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isImageDragging, setIsImageDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isPaymentReady, setIsPaymentReady] = useState(false);
  const [mailPreviewImage, setMailPreviewImage] = useState("");
  const [showToast, setShowToast] = useState({
    visible: false, type: "", title: "", message: "",
  });

  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const [size, setSize] = useState("12x12");
  const [thickness, setThickness] = useState("5mm");
  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", alternatePhone: "",
    address: "", city: "", state: "", pincode: "", paymentMethod: "razorpay",
  });
  const [formErrors, setFormErrors] = useState({});

  const thicknessOptions = ["3mm", "5mm", "8mm"];

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js").catch(() => {});
  }, []);

  useEffect(() => {
    setOrderId(`#ORD${Math.floor(Math.random() * 9000 + 1000)}`);
  }, []);

  // ── Image drag (mouse + touch) ────────────────────────────────────────────
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isImageDragging) return;
      setImageOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    };
    const handleTouchMove = (e) => {
      if (!isImageDragging || !e.touches?.length) return;
      const t = e.touches[0];
      setImageOffset({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y });
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
  }, [isImageDragging, dragStart]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const showNotification = (message, type = "info", title = "") => {
    const titles = { success: "Success", error: "Error", warning: "Warning" };
    setShowToast({ visible: true, type, title: title || titles[type] || "Info", message });
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
    if (idx > 0) price += idx * 150;
    if (thickness === "5mm") price += 150;
    if (thickness === "8mm") price += 300;
    return price * quantity;
  }, [size, thickness, quantity]);

  const generateMailPreviewImage = async () => {
    try {
      if (!uploadedImage) return "";
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = uploadedImage;
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });

      const canvas = document.createElement("canvas");
      canvas.width = EXPORT_W;
      canvas.height = EXPORT_H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return "";

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Clip to heart shape
      const scaledPath = scalePath(HEART_PATH, EXPORT_SCALE, EXPORT_SCALE);
      const heartP = new Path2D(scaledPath);
      ctx.save();
      ctx.clip(heartP);

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, EXPORT_W, EXPORT_H);

      const baseScale = Math.max(EXPORT_W / img.width, EXPORT_H / img.height);
      const finalScale = baseScale * zoom;
      const dw = img.width * finalScale;
      const dh = img.height * finalScale;
      const dims = FRAME_DIMENSIONS[size] || { width: 270, height: 252 };
      const dx = (EXPORT_W - dw) / 2 + imageOffset.x * (EXPORT_W / dims.width);
      const dy = (EXPORT_H - dh) / 2 + imageOffset.y * (EXPORT_H / dims.height);
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();

      // Heart border stroke
      ctx.strokeStyle = "#c9952a";
      ctx.lineWidth = 8;
      ctx.stroke(heartP);

      return canvas.toDataURL("image/png");
    } catch (err) {
      console.error("Preview capture failed:", err);
      return "";
    }
  };

  const processFile = (file) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result);
      setZoom(1);
      setImageOffset({ x: 0, y: 0 });
      setIsProcessing(false);
      setIsPaymentReady(false);
      showNotification("Image uploaded successfully!", "success");
    };
    reader.onerror = () => { setIsProcessing(false); showNotification("Failed to read file.", "error"); };
    reader.readAsDataURL(file);
  };

  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver  = (e) => { e.preventDefault(); e.stopPropagation(); if (!isDragging) setIsDragging(true); };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > 10 * 1024 * 1024) { showNotification("File size must be less than 10MB", "error"); return; }
      processFile(file);
    } else {
      showNotification("Please upload an image file", "error");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { showNotification("File size must be less than 10MB", "error"); return; }
    if (!file.type.startsWith("image/")) { showNotification("Please upload an image file", "error"); return; }
    processFile(file);
  };

  const handleZoomIn  = () => { setZoom((p) => Math.min(p + 0.1, 3)); setIsPaymentReady(false); };
  const handleZoomOut = () => { setZoom((p) => Math.max(p - 0.1, 1)); setIsPaymentReady(false); };

  const handleRemoveImage = () => {
    setUploadedImage(null); setZoom(1); setImageOffset({ x: 0, y: 0 });
    setCurrentStep(1); setIsPaymentReady(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    showNotification("Image removed", "warning");
  };

  const handleImageMouseDown = (e) => {
    e.preventDefault();
    if (!uploadedImage) return;
    setIsImageDragging(true);
    setDragStart({ x: e.clientX - imageOffset.x, y: e.clientY - imageOffset.y });
  };

  const handleImageTouchStart = (e) => {
    if (!uploadedImage || !e.touches?.length) return;
    const t = e.touches[0];
    setIsImageDragging(true);
    setDragStart({ x: t.clientX - imageOffset.x, y: t.clientY - imageOffset.y });
  };

  const handleImageTouchMove = (e) => {
    if (!isImageDragging || !e.touches?.length) return;
    e.preventDefault();
    const t = e.touches[0];
    setImageOffset({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y });
  };

  const handleImageTouchEnd = () => setIsImageDragging(false);

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

  const validateBeforePayment = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsPaymentReady(false);
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

  const handleSubmitOrder  = async (e) => { e.preventDefault(); await validateBeforePayment(); };
  const handlePaymentSuccess = () => { showNotification("Payment successful!", "success"); openSuccessModal(); setIsPaymentReady(false); };
  const handlePaymentError   = () => showNotification("Payment failed. Please try again.", "error");

  const goToStep = (step) => {
    if (step === 2 && !uploadedImage) { showNotification("Please upload an image first", "warning"); return; }
    setCurrentStep(step);
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const inputStyle = {
    borderRadius: "0px", minHeight: "10px", border: "1px solid #dbe3ee",
    background: "#ffffff", boxShadow: "none", padding: "12px 14px", fontSize: "15px",
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
        style={{ ...inputStyle, width: "100%", paddingRight: "40px", appearance: "none", WebkitAppearance: "none", cursor: "pointer" }}
      >
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <i className="bi bi-chevron-down"
        style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#475569", fontSize: "14px", zIndex: 5 }}
      />
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
                disabled={step > 1 && !uploadedImage}
                type="button"
              >
                <span className={styles.stepNumber}>
                  {currentStep > step ? <i className="bi bi-check-lg" /> : step}
                </span>
                <span className={styles.stepLabel}>{step === 1 ? "Upload" : "Customize & Payment"}</span>
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

  // ── Heart frame preview ───────────────────────────────────────────────────
  const renderHeartPreview = (useWall = false) => {
    const dims = FRAME_DIMENSIONS[size] || { width: 270, height: 252 };

    return (
      <div
        style={{
          position: "relative", width: "100%", minHeight: "550px",
          borderRadius: "28px", overflow: "hidden",
          background: useWall ? undefined : "linear-gradient(180deg, #fff5f7 0%, #f8fafc 100%)",
          backgroundImage: useWall ? `url(${WALL_MOCKUP})` : undefined,
          backgroundSize: useWall ? "cover" : undefined,
          backgroundPosition: useWall ? "center" : undefined,
          border: "1px solid #e2e8f0",
        }}
      >
        {useWall && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />
        )}

        {/* Heart-shaped frame */}
        <div
          style={{
            position: "absolute",
            left: "50%", top: "45%",
            width: `${dims.width}px`, height: `${dims.height}px`,
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Gold drop-shadow behind heart */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: `path("${HEART_PATH}")`,
              transform: "translate(4px, 6px)",
              background: "linear-gradient(145deg, #d4a01a, #8b6914)",
              opacity: 0.35,
              zIndex: 1,
            }}
          />

          {/* Heart photo area */}
          <div
            style={{
              position: "absolute", inset: 0, zIndex: 2,
              clipPath: `path("${HEART_PATH}")`,
              overflow: "hidden",
              background: "#f1f5f9",
              cursor: uploadedImage ? (isImageDragging ? "grabbing" : "grab") : "default",
              touchAction: "none",
            }}
            onMouseDown={uploadedImage ? handleImageMouseDown : undefined}
            onTouchStart={uploadedImage ? handleImageTouchStart : undefined}
            onTouchMove={uploadedImage ? handleImageTouchMove : undefined}
            onTouchEnd={uploadedImage ? handleImageTouchEnd : undefined}
            onTouchCancel={uploadedImage ? handleImageTouchEnd : undefined}
          >
            <img
              src={uploadedImage || ROOM_WALL_BG}
              alt="Heart frame preview"
              draggable={false}
              style={{
                position: "absolute", top: "50%", left: "50%",
                width: "100%", height: "100%", objectFit: "cover",
                transform: `translate(calc(-50% + ${imageOffset.x}px), calc(-50% + ${imageOffset.y}px)) scale(${zoom})`,
                transformOrigin: "center center",
                transition: isImageDragging ? "none" : "transform 0.18s ease",
                userSelect: "none", touchAction: "none", pointerEvents: "none",
              }}
            />
          </div>

          {/* SVG heart border overlay */}
          <svg
            width="100%" height="100%"
            viewBox="0 0 300 280"
            style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none" }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d={HEART_PATH} fill="none" stroke="#c9952a" strokeWidth="3" />
            <path d={HEART_PATH} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"
              strokeDasharray="none" transform="scale(0.97) translate(4.5, 4.2)" />
          </svg>
        </div>

        {/* Pills */}
        <div
          style={{
            position: "absolute", bottom: "22px", left: "50%", transform: "translateX(-50%)",
            display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center",
          }}
        >
          {[`${size} inches`, `Thickness: ${thickness}`].map((label) => (
            <span key={label} style={{
              background: "rgba(255,255,255,0.96)", padding: "8px 14px",
              borderRadius: "999px", fontWeight: 500, fontSize: "13px",
              color: "#0f172a", border: "1px solid #e2e8f0",
            }}>
              {label}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // ── Editor controls ───────────────────────────────────────────────────────
  const renderEditorControls = () => (
    <div style={{ marginTop: "10px", padding: "10px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", boxShadow: "0 10px 24px rgba(15,23,42,0.05)" }}>
      <div className="d-flex gap-2 flex-wrap align-items-center justify-content-between">
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <button type="button" className="btn btn-light" onClick={handleZoomOut}
            style={{ width: "34px", height: "34px", borderRadius: "8px", border: "1px solid #dbe3ee", fontSize: "13px" }}>
            <i className="bi bi-dash-lg" />
          </button>
          <div style={{ minWidth: "60px", textAlign: "center", fontWeight: 500, fontSize: "13px", color: "#0f172a", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px 12px" }}>
            {Math.round(zoom * 100)}%
          </div>
          <button type="button" className="btn btn-light" onClick={handleZoomIn}
            style={{ width: "34px", height: "34px", borderRadius: "8px", border: "1px solid #dbe3ee", fontSize: "13px" }}>
            <i className="bi bi-plus-lg" />
          </button>
        </div>
        <button type="button" className="btn btn-outline-dark"
          onClick={() => { setZoom(1); setImageOffset({ x: 0, y: 0 }); setIsPaymentReady(false); }}
          style={{ borderRadius: "12px", padding: "8px 14px", fontSize: "13px" }}>
          Reset Position
        </button>
      </div>
      <div className="mt-3">
        <input type="range" min="1" max="3" step="0.05" value={zoom}
          onChange={(e) => { setZoom(Number(e.target.value)); setIsPaymentReady(false); }}
          style={{ width: "100%", cursor: "pointer", accentColor: "#e11d48" }}
        />
      </div>
    </div>
  );

  // ── Summary preview (small, step 2 sidebar) ───────────────────────────────
  const renderSummaryPreview = () => {
    if (!uploadedImage) return null;
    return (
      <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
        <div style={{ width: "100%", maxWidth: "420px", transform: "scale(0.62)", transformOrigin: "top center", marginBottom: "-180px" }}>
          {renderHeartPreview(false)}
        </div>
      </div>
    );
  };

  // ── Step 1: Upload ────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <div className={styles.stepContainer}>
      <div className="container">
        <div className="row g-4">
          <div className="col-sm-12 col-lg-8">
            <div className={styles.uploadCard}>
              <div
                ref={dropZoneRef}
                className={`${styles.uploadZone} ${isDragging ? styles.dragging : ""}`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {uploadedImage ? (
                  <div className={styles.previewContainer}>
                    {renderHeartPreview(false)}
                    {renderEditorControls()}
                    <div className={styles.imageControls}>
                      <button className={`${styles.controlButton} ${styles.dangerButton}`}
                        onClick={handleRemoveImage} title="Remove Image" type="button">
                        <i className="bi bi-trash" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.uploadPrompt}>
                    <div className={styles.uploadIcon}>
                      <i className={`bi ${isDragging ? "bi-file-earmark-arrow-up" : "bi-heart"}`}
                        style={{ color: "#e11d48" }} />
                    </div>
                    <h3 className={styles.uploadTitle}>
                      {isDragging ? "Drop your image here" : "Upload your photo"}
                    </h3>
                    <p className={styles.uploadSubtitle}>
                      {isDragging ? "Release to upload" : "Your photo will fill the heart shape"}
                    </p>
                    <button className={styles.browseButton}
                      onClick={() => fileInputRef.current?.click()} type="button">
                      <i className="bi bi-folder2-open me-2" />
                      Browse Files
                    </button>
                    <p className={styles.uploadHint}>Supported: JPG, PNG, GIF (Max 10MB)</p>
                    {isProcessing && <p style={{ marginTop: "10px", fontWeight: 600 }}>Processing image...</p>}
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="d-none" />
              </div>
            </div>
          </div>

          <div className="col-sm-12 col-lg-4">
            <div className={styles.guideCard}>
              <h4 className={styles.guideTitle}>
                <i className="bi bi-info-circle me-2" />
                Photo Guide
              </h4>
              <ul className={styles.guideList}>
                <li><i className="bi bi-check-circle-fill" /> Upload one high-resolution photo</li>
                <li><i className="bi bi-check-circle-fill" /> Your photo fills the heart shape</li>
                <li><i className="bi bi-check-circle-fill" /> Drag to reposition after upload</li>
                <li><i className="bi bi-check-circle-fill" /> Pinch or zoom slider to adjust</li>
                <li className={styles.warning}>
                  <i className="bi bi-exclamation-triangle-fill" /> Use minimum 300 DPI for best print quality
                </li>
              </ul>
              <button className={styles.nextButton} onClick={() => goToStep(2)}
                disabled={!uploadedImage} type="button">
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
                    <h3 style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "#0f172a" }}>Live Preview</h3>
                    <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#64748b" }}>
                      Adjust and review your heart frame
                    </p>
                  </div>
                  <button type="button" className="btn btn-outline-dark"
                    onClick={() => goToStep(1)} style={{ borderRadius: "12px" }}>
                    <i className="bi bi-arrow-left me-2" />Back
                  </button>
                </div>

                {renderHeartPreview(true)}
                {renderEditorControls()}

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
                  {renderSummaryPreview()}
                  <div style={{ display: "grid", gap: "10px", marginTop: "12px", fontSize: "15px", color: "#334155" }}>
                    {[
                      ["Product", "Heart Acrylic Frame"],
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
                      customerDetails={formData}
                      previewImage={mailPreviewImage}
                      productDetails={{ orientation: "heart_frame", size, thickness, quantity, orderId, zoom, imageOffset }}
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
        <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 9999, minWidth: "280px", maxWidth: "380px", background: "#fff", borderRadius: "16px", boxShadow: "0 18px 40px rgba(15,23,42,0.16)", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderLeft: `4px solid ${showToast.type === "success" ? "#16a34a" : showToast.type === "error" ? "#dc2626" : showToast.type === "warning" ? "#f59e0b" : "#2563eb"}` }}>
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
              <div style={{ width: "72px", height: "72px", margin: "0 auto 18px", borderRadius: "999px", display: "grid", placeItems: "center", background: "#fce7f3", color: "#e11d48", fontSize: "32px" }}>
                <i className="bi bi-heart-fill" />
              </div>
              <h3 style={{ fontWeight: 800, color: "#0f172a", marginBottom: "10px" }}>Payment Successful</h3>
              <p style={{ color: "#64748b", marginBottom: "20px" }}>
                Thank you! Your heart acrylic frame is being crafted with care.
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

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "../../../assest/style/ProductClient.module.css";
import RazorpayPayment from "../../../Components/payment/Razorpay";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const WALL_MOCKUP =
  "https://res.cloudinary.com/dsprfys3x/image/upload/q_auto/f_auto/v1776247395/BackRound.jpg_kiljam.jpg";

const SLOT_COUNT = 6;
const SLOT_CONFIG = [
  { id: 0, row: 0, col: 0, label: "1" },
  { id: 1, row: 0, col: 1, label: "2" },
  { id: 2, row: 0, col: 2, label: "3" },
  { id: 3, row: 1, col: 0, label: "4" },
  { id: 4, row: 1, col: 1, label: "5" },
  { id: 5, row: 1, col: 2, label: "6" },
];

const SIZE_OPTIONS = ["12x8", "16x12", "20x16", "24x18"];
const BASE_PRICE = 1499;

const FRAME_COLORS = [
  { v: "#1a1a1a", l: "Matte Black" },
  { v: "#1a1a2e", l: "Dark Navy" },
  { v: "#4a2c0a", l: "Dark Walnut" },
  { v: "#ffffff", l: "White" },
  { v: "#b0b0b0", l: "Silver" },
  { v: "#8b6914", l: "Gold" },
];

export default function ProductClientCollageFrame({ product }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState(Array(SLOT_COUNT).fill(null));
  const [frameColor, setFrameColor] = useState("#1a1a1a");
  const [size, setSize] = useState("16x12");
  const [thickness, setThickness] = useState("5mm");
  const [quantity, setQuantity] = useState(1);
  const [orderId, setOrderId] = useState("");
  const [isPaymentReady, setIsPaymentReady] = useState(false);
  const [mailPreviewImage, setMailPreviewImage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showToast, setShowToast] = useState({ visible: false, type: "", title: "", message: "" });
  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", alternatePhone: "",
    address: "", city: "", state: "", pincode: "", paymentMethod: "razorpay",
  });
  const [formErrors, setFormErrors] = useState({});

  const fileInputRef = useRef(null);

  // ── Bootstrap + Order ID ──────────────────────────────────────────────────
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js").catch(() => {});
    setOrderId(`#ORD${Math.floor(Math.random() * 9000 + 1000)}`);
  }, []);

  // ── Auth guard + pre-fill ─────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("isLoggedIn") !== "true") { router.push("/login"); return; }
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

  // ── Helpers ───────────────────────────────────────────────────────────────
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

  const calculatePrice = useCallback(() => {
    let price = BASE_PRICE;
    const idx = SIZE_OPTIONS.indexOf(size);
    if (idx > 0) price += idx * 200;
    if (thickness === "5mm") price += 150;
    if (thickness === "8mm") price += 300;
    return price * quantity;
  }, [size, thickness, quantity]);

  const filledCount = images.filter(Boolean).length;
  const emptySlots = images.map((img, i) => (img === null ? i : -1)).filter((i) => i !== -1);

  // ── Auto-fill photos into empty slots ────────────────────────────────────
  const addFilesToSlots = useCallback(
    (files) => {
      const valid = Array.from(files).filter(
        (f) => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024
      );
      if (!valid.length) {
        showNotification("Please select valid image files (max 10 MB each)", "error");
        return;
      }
      if (!emptySlots.length) {
        showNotification("All slots filled. Remove a photo to add more.", "warning");
        return;
      }

      const toProcess = valid.slice(0, emptySlots.length);
      if (valid.length > emptySlots.length) {
        showNotification(
          `Only ${emptySlots.length} slot${emptySlots.length > 1 ? "s" : ""} available — first ${emptySlots.length} photo${emptySlots.length > 1 ? "s" : ""} used.`,
          "warning"
        );
      }

      setIsProcessing(true);
      let done = 0;

      toProcess.forEach((file, idx) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const slotId = emptySlots[idx];
          setImages((prev) => {
            const n = [...prev];
            n[slotId] = e.target.result;
            return n;
          });
          done++;
          if (done === toProcess.length) {
            setIsProcessing(false);
            setIsPaymentReady(false);
            showNotification(
              `${done} photo${done > 1 ? "s" : ""} added successfully!`,
              "success"
            );
          }
        };
        reader.onerror = () => { done++; if (done === toProcess.length) setIsProcessing(false); };
        reader.readAsDataURL(file);
      });
    },
    [emptySlots]
  );

  const handleFileInputChange = (e) => {
    addFilesToSlots(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveSlotImage = (slotId, e) => {
    e?.stopPropagation();
    setImages((prev) => { const n = [...prev]; n[slotId] = null; return n; });
    setIsPaymentReady(false);
    showNotification(`Photo ${slotId + 1} removed`, "warning");
  };

  const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = ()  => setIsDragging(false);
  const handleDrop      = (e) => { e.preventDefault(); setIsDragging(false); addFilesToSlots(e.dataTransfer.files); };

  // ── Form ──────────────────────────────────────────────────────────────────
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

  // ── Canvas export ─────────────────────────────────────────────────────────
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
        const ir = img.width / img.height, sr = SLOT_W / SLOT_H;
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
    if (Object.keys(errors).length) {
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

  const handlePaymentSuccess = (paymentData) => {
    if (typeof window !== "undefined") {
      const existing = localStorage.getItem("mareprints_orders");
      const orders = existing ? JSON.parse(existing) : [];
      const totalAmount = calculatePrice();
      orders.unshift({
        id: Date.now(),
        order: orderId,
        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        status: "Confirmed",
        productName: "Collage Frame",
        size, thickness, quantity, amount: totalAmount,
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
    if (step === 2 && !images.some(Boolean)) {
      showNotification("Please upload at least one photo first", "warning");
      return;
    }
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Shared styles ─────────────────────────────────────────────────────────
  const inputStyle = {
    borderRadius: "8px", border: "1px solid #dbe3ee", background: "#ffffff",
    boxShadow: "none",
    padding: "clamp(9px,2vw,12px) clamp(10px,2.5vw,14px)",
    fontSize: "clamp(13px,2.5vw,15px)",
    transition: "border-color 0.2s ease",
  };
  const labelStyle = { fontSize: "clamp(10px,2vw,12px)", fontWeight: 700, color: "#334155", marginBottom: "6px", display: "block" };
  const sectionCard = { background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "clamp(14px,3vw,24px)", boxShadow: "0 10px 30px rgba(15,23,42,0.05)" };
  const renderFieldError = (field) =>
    formErrors[field] ? <div style={{ marginTop: "6px", fontSize: "13px", color: "#dc2626", fontWeight: 600 }}>{formErrors[field]}</div> : null;

  // ── Collage grid (display only — no slot interaction) ─────────────────────
  const renderCollageGrid = (useWall = false) => (
    <div
      className={styles.previewArea}
      style={{
        position: "relative", width: "100%", borderRadius: "24px",
        overflow: "hidden",
        background: useWall ? undefined : "linear-gradient(180deg,#ffffff 0%,#f8fafc 100%)",
        backgroundImage: useWall ? `url(${WALL_MOCKUP})` : undefined,
        backgroundSize: useWall ? "cover" : undefined,
        backgroundPosition: useWall ? "center" : undefined,
        border: "1px solid #e2e8f0",
      }}
    >
      {useWall && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
      )}

      {/* Frame */}
      <div style={{
        position: "absolute", left: "50%", top: "48%",
        transform: "translate(-50%,-50%)",
        padding: "clamp(6px,1.5vw,14px)",
        background: frameColor,
        borderRadius: "6px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.30)",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, clamp(90px,13vw,130px))",
          gridTemplateRows: "repeat(2, clamp(80px,11.5vw,115px))",
          gap: "clamp(3px,0.8vw,6px)",
        }}>
          {SLOT_CONFIG.map((slot) => (
            <div
              key={slot.id}
              style={{
                overflow: "hidden",
                background: images[slot.id] ? "transparent" : "rgba(255,255,255,0.10)",
                position: "relative",
                borderRadius: "2px",
              }}
            >
              {images[slot.id] ? (
                <>
                  <img
                    src={images[slot.id]}
                    alt={`Photo ${slot.label}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }}
                  />
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={(e) => handleRemoveSlotImage(slot.id, e)}
                    title="Remove photo"
                    style={{
                      position: "absolute", top: 4, right: 4,
                      width: 20, height: 20,
                      borderRadius: "50%", border: "none",
                      background: "rgba(0,0,0,0.70)", color: "#fff",
                      fontSize: 9, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      padding: 0, zIndex: 10, lineHeight: 1,
                    }}
                  >
                    ✕
                  </button>
                </>
              ) : (
                <div style={{
                  width: "100%", height: "100%",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  gap: 4, color: "rgba(255,255,255,0.50)",
                  userSelect: "none",
                }}>
                  <i className="bi bi-image" style={{ fontSize: "clamp(14px,2vw,18px)" }} />
                  <span style={{ fontSize: "clamp(7px,1.2vw,10px)", fontWeight: 600 }}>{slot.label}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Info pills */}
      <div style={{
        position: "absolute", bottom: "14px", left: "50%",
        transform: "translateX(-50%)",
        display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center",
        padding: "0 12px", width: "100%",
      }}>
        {[`${size} inches`, `${filledCount} / ${SLOT_COUNT} photos`].map((lbl) => (
          <span key={lbl} style={{
            background: "rgba(255,255,255,0.95)", padding: "6px 12px",
            borderRadius: "999px", fontSize: "12px", fontWeight: 500,
            color: "#0f172a", border: "1px solid #e2e8f0",
          }}>
            {lbl}
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
                <span className={styles.stepLabel}>{step === 1 ? "Choose Frame & Upload" : "Customize & Pay"}</span>
              </button>
              {step < 2 && <div className={`${styles.stepConnector} ${currentStep > step ? styles.completed : ""}`} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Step 1: Frame + Upload ────────────────────────────────────────────────
  const renderStep1 = () => (
    <div className={styles.stepContainer}>
      <div className="container">
        <div className="row g-4">

          {/* Left: preview + upload zone */}
          <div className="col-sm-12 col-lg-8">

            {/* Frame color picker */}
            <div className={styles.uploadCard} style={{ marginBottom: 16 }}>
              <p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
                <i className="bi bi-palette me-2" />Select Frame Color
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {FRAME_COLORS.map(({ v, l }) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setFrameColor(v)}
                    title={l}
                    style={{
                      width: 36, height: 36,
                      borderRadius: "50%",
                      background: v,
                      border: frameColor === v
                        ? "3px solid #2563eb"
                        : "3px solid #e2e8f0",
                      boxShadow: frameColor === v
                        ? "0 0 0 2px #fff, 0 0 0 4px #2563eb"
                        : "0 1px 4px rgba(0,0,0,0.18)",
                      cursor: "pointer",
                      transition: "box-shadow 0.2s",
                      outline: "none",
                    }}
                  />
                ))}
                <span style={{ alignSelf: "center", fontSize: 13, color: "#64748b", fontWeight: 500 }}>
                  {FRAME_COLORS.find((c) => c.v === frameColor)?.l}
                </span>
              </div>
            </div>

            {/* Collage preview */}
            <div className={styles.uploadCard}>
              {renderCollageGrid(false)}

              {/* Drop zone / upload trigger */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  marginTop: 16,
                  border: `2px dashed ${isDragging ? "#16a34a" : filledCount === SLOT_COUNT ? "#86efac" : "#2563eb"}`,
                  borderRadius: "16px",
                  padding: "clamp(16px, 3vw, 28px)",
                  textAlign: "center",
                  background: isDragging
                    ? "rgba(22,163,74,0.04)"
                    : filledCount === SLOT_COUNT
                    ? "rgba(22,163,74,0.04)"
                    : "#f0f6ff",
                  transition: "all 0.2s",
                }}
              >
                {filledCount === SLOT_COUNT ? (
                  <div style={{ color: "#16a34a", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <i className="bi bi-check-circle-fill" style={{ fontSize: 22 }} />
                    All 6 photos uploaded!
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: 12 }}>
                      <i className={`bi ${isDragging ? "bi-file-earmark-arrow-up" : "bi-cloud-upload"}`}
                        style={{ fontSize: 32, color: "#2563eb" }} />
                    </div>
                    <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
                      {isDragging ? "Drop your photos here" : "Upload your photos"}
                    </p>
                    <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>
                      {isDragging
                        ? "Release to add photos"
                        : `${emptySlots.length} slot${emptySlots.length !== 1 ? "s" : ""} remaining — select up to ${emptySlots.length} photo${emptySlots.length !== 1 ? "s" : ""}`}
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={styles.browseButton}
                      style={{ marginBottom: 0, padding: "10px 28px" }}
                    >
                      <i className="bi bi-folder2-open me-2" />
                      Choose Photos
                    </button>
                    <p style={{ margin: "10px 0 0", fontSize: 12, color: "#94a3b8" }}>
                      JPG, PNG, GIF · max 10 MB each · multiple files allowed
                    </p>
                  </>
                )}
                {isProcessing && (
                  <p style={{ margin: "12px 0 0", fontWeight: 600, color: "#2563eb", fontSize: 14 }}>
                    <span className={styles.spinner} style={{ display: "inline-block", marginRight: 6 }} />
                    Adding photos…
                  </p>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept="image/*"
                multiple
                className="d-none"
              />
            </div>
          </div>

          {/* Right: guide + progress */}
          <div className="col-sm-12 col-lg-4">
            <div className={styles.guideCard}>
              <h4 className={styles.guideTitle}>
                <i className="bi bi-info-circle me-2" />How It Works
              </h4>
              <ul className={styles.guideList}>
                <li><i className="bi bi-1-circle-fill" style={{ color: "#2563eb" }} />Pick a frame color above</li>
                <li><i className="bi bi-2-circle-fill" style={{ color: "#2563eb" }} />Upload 1–6 photos (all at once)</li>
                <li><i className="bi bi-3-circle-fill" style={{ color: "#2563eb" }} />Photos fill the grid automatically</li>
                <li><i className="bi bi-check-circle-fill" />Use high-resolution images for best print quality</li>
                <li className={styles.warning}><i className="bi bi-exclamation-triangle-fill" />Square photos fit slots best</li>
              </ul>

              {/* Progress */}
              <div style={{ marginTop: 16, padding: "14px 16px", background: "#eff6ff", borderRadius: 12, border: "1px solid #bfdbfe" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: "#1e40af" }}>Upload Progress</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: "#1e40af" }}>{filledCount} / {SLOT_COUNT}</span>
                </div>
                <div style={{ height: 8, background: "#bfdbfe", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    background: filledCount === SLOT_COUNT
                      ? "linear-gradient(90deg,#16a34a,#22c55e)"
                      : "linear-gradient(90deg,#2563eb,#60a5fa)",
                    borderRadius: 99,
                    width: `${(filledCount / SLOT_COUNT) * 100}%`,
                    transition: "width 0.35s ease",
                  }} />
                </div>

                {/* Photo slot pills */}
                {filledCount > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                    {SLOT_CONFIG.map((slot) => (
                      <div key={slot.id} style={{
                        display: "flex", alignItems: "center", gap: 4,
                        padding: "4px 10px",
                        borderRadius: "999px",
                        fontSize: 11, fontWeight: 600,
                        background: images[slot.id] ? "#dcfce7" : "#f1f5f9",
                        color: images[slot.id] ? "#16a34a" : "#94a3b8",
                        border: `1px solid ${images[slot.id] ? "#86efac" : "#e2e8f0"}`,
                      }}>
                        {images[slot.id]
                          ? <><i className="bi bi-check-lg" />Photo {slot.label}</>
                          : <>Photo {slot.label}</>
                        }
                        {images[slot.id] && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSlotImage(slot.id)}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#16a34a", fontSize: 10, lineHeight: 1, marginLeft: 2 }}
                          >✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                className={styles.nextButton}
                onClick={() => goToStep(2)}
                disabled={!images.some(Boolean)}
                type="button"
                style={{ marginTop: 20 }}
              >
                Continue to Customize &amp; Pay
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
    const total = calculatePrice();
    return (
      <div className={styles.stepContainer} style={{ background: "linear-gradient(180deg,#ffffff 0%,#f8fafc 55%,#f1f5f9 100%)" }}>
        <div className="container">
          <div className="row g-4 align-items-start">

            {/* Left: live preview + options */}
            <div className="col-lg-7">
              <div style={sectionCard}>
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
                  <div>
                    <h3 style={{ margin: 0, fontSize: "clamp(15px,3.5vw,26px)", fontWeight: 800, color: "#0f172a" }}>
                      Live Preview
                    </h3>
                    <p style={{ margin: "4px 0 0", fontSize: "clamp(11px,2vw,13px)", color: "#64748b" }}>
                      Review your collage frame
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    style={{
                      borderRadius: "12px", padding: "8px 16px",
                      border: "1.5px solid #2563eb", color: "#2563eb",
                      background: "transparent", cursor: "pointer",
                      fontWeight: 600, fontSize: "14px",
                      display: "flex", alignItems: "center", gap: "6px",
                      transition: "all 0.2s",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#2563eb"; }}
                  >
                    <i className="bi bi-arrow-left" />Back
                  </button>
                </div>

                {/* Sticky on mobile: preview stays visible while the user
                    scrolls through the options / form below */}
                <div className={styles.step2PreviewWrapper}>
                  {renderCollageGrid(true)}
                </div>

                {/* Options */}
                <div style={{ ...sectionCard, marginTop: 20 }}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label style={labelStyle}>Frame Color</label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                        {FRAME_COLORS.map(({ v, l }) => (
                          <button
                            key={v} type="button"
                            onClick={() => { setFrameColor(v); setIsPaymentReady(false); }}
                            title={l}
                            style={{
                              width: 30, height: 30, borderRadius: "50%",
                              background: v,
                              border: frameColor === v ? "3px solid #2563eb" : "3px solid #e2e8f0",
                              boxShadow: frameColor === v ? "0 0 0 2px #fff,0 0 0 4px #2563eb" : "0 1px 4px rgba(0,0,0,0.15)",
                              cursor: "pointer", outline: "none", transition: "box-shadow 0.2s",
                            }}
                          />
                        ))}
                        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
                          {FRAME_COLORS.find((c) => c.v === frameColor)?.l}
                        </span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Size (inches)</label>
                      <select
                        value={size}
                        onChange={(e) => { setSize(e.target.value); setIsPaymentReady(false); }}
                        style={{ ...inputStyle, width: "100%", appearance: "none", cursor: "pointer" }}
                      >
                        {SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Thickness</label>
                      <select
                        value={thickness}
                        onChange={(e) => { setThickness(e.target.value); setIsPaymentReady(false); }}
                        style={{ ...inputStyle, width: "100%", appearance: "none", cursor: "pointer" }}
                      >
                        {["3mm", "5mm", "8mm"].map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Quantity</label>
                      <input
                        type="number" min="1" value={quantity}
                        onChange={(e) => { setQuantity(Math.max(1, Number(e.target.value) || 1)); setIsPaymentReady(false); }}
                        style={{ ...inputStyle, width: "100%" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: order summary + form + payment */}
            <div className="col-lg-5">
              <form onSubmit={handleSubmitOrder}>

                {/* Order summary */}
                <div style={{ ...sectionCard, marginBottom: 20 }}>
                  <h4 style={{ marginBottom: 14, fontWeight: 800, color: "#0f172a", fontSize: "clamp(13px,2.5vw,18px)" }}>
                    Order Summary
                  </h4>
                  <div style={{ display: "grid", gap: 8, fontSize: "clamp(12px,2.5vw,14px)", color: "#334155" }}>
                    {[
                      ["Product", "Photo Collage Frame"],
                      ["Photos", `${filledCount} / ${SLOT_COUNT} uploaded`],
                      ["Size", `${size} inches`],
                      ["Thickness", thickness],
                      ["Quantity", quantity],
                    ].map(([label, val]) => (
                      <div key={label} className="d-flex justify-content-between" style={{ paddingBottom: 8, borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ color: "#64748b" }}>{label}</span>
                        <strong style={{ color: "#0f172a" }}>{val}</strong>
                      </div>
                    ))}
                    <div className="d-flex justify-content-between" style={{ paddingTop: 4 }}>
                      <span style={{ fontWeight: 700, color: "#0f172a" }}>Total Amount</span>
                      <strong style={{ color: "#2563eb", fontSize: "clamp(15px,3vw,18px)" }}>₹{total}</strong>
                    </div>
                  </div>
                </div>

                {/* Customer details */}
                <div style={{ ...sectionCard, marginBottom: 20 }}>
                  <h4 style={{ marginBottom: 14, fontWeight: 800, color: "#0f172a", fontSize: "clamp(13px,2.5vw,18px)" }}>
                    Customer Details
                  </h4>
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

                {/* Payment */}
                <div style={sectionCard}>
                  {!isPaymentReady ? (
                    <button
                      type="submit"
                      style={{
                        width: "100%", borderRadius: "14px",
                        padding: "clamp(11px,2.5vw,14px) 18px", fontWeight: 700, fontSize: "clamp(13px,2.5vw,16px)",
                        background: "linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%)",
                        color: "#fff", border: "none", cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
                        transition: "all 0.25s",
                        letterSpacing: "0.01em",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "linear-gradient(135deg,#1d4ed8 0%,#1e40af 100%)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%)"; e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                      <i className="bi bi-shield-check me-2" />
                      Verify Details &amp; Pay Now
                    </button>
                  ) : (
                    <RazorpayPayment
                      amount={total}
                      customerDetails={{
                        ...formData,
                        name: formData.fullName,
                        orderId,
                        productType: "collage_frame",
                        productName: "Collage Frame",
                        orientation: "collage_frame",
                        size, thickness, quantity, amount: total,
                        frameColor,
                        photosCount: filledCount,
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
          position: "fixed", top: 16, right: 16, zIndex: 9999,
          width: "calc(100vw - 32px)", maxWidth: 380,
          background: "#fff", borderRadius: 16,
          boxShadow: "0 18px 40px rgba(15,23,42,0.16)",
          border: "1px solid #e2e8f0", overflow: "hidden",
        }}>
          <div style={{
            padding: "14px 18px",
            borderLeft: `4px solid ${
              showToast.type === "success" ? "#16a34a" :
              showToast.type === "error"   ? "#dc2626" :
              showToast.type === "warning" ? "#f59e0b" : "#2563eb"
            }`,
          }}>
            <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>{showToast.title}</div>
            <div style={{ fontSize: 14, color: "#475569" }}>{showToast.message}</div>
          </div>
        </div>
      )}

      {/* Success modal */}
      <div className="modal fade" id="collageSuccessModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius: 24 }}>
            <div className="modal-body text-center p-4 p-md-5">
              <div style={{
                width: 72, height: 72, margin: "0 auto 18px",
                borderRadius: "999px", display: "grid", placeItems: "center",
                background: "#dcfce7", color: "#16a34a", fontSize: 32,
              }}>
                <i className="bi bi-check2" />
              </div>
              <h3 style={{ fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>Payment Successful</h3>
              <p style={{ color: "#64748b", marginBottom: 20 }}>
                Your photo collage frame order has been received.
              </p>
              <button
                type="button"
                data-bs-dismiss="modal"
                style={{
                  borderRadius: 14, padding: "12px 28px",
                  background: "linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%)",
                  color: "#fff", border: "none", fontWeight: 700,
                  fontSize: 15, cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

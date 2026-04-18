"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "../../../assest/style/ProductClient.module.css";
import RazorpayPayment from "../../../Components/payment/Razorpay";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// const WALL_MOCKUP =
//   "https://res.cloudinary.com/dsprfys3x/image/upload/q_auto/f_auto/v1776247395/BackRound.jpg_kiljam.jpg";

const BACKGROUND_REMOVAL_API_KEY = "fbstz8JJ7hPbsmvkW8WcJogg";
const BACKGROUND_REMOVAL_API_URL = "https://api.remove.bg/v1.0/removebg";

export default function ProductClientCutout({ product }) {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  const [backgroundRemoved, setBackgroundRemoved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [orderId, setOrderId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isPaymentReady, setIsPaymentReady] = useState(false);
  const [mailPreviewImage, setMailPreviewImage] = useState("");

  const [showToast, setShowToast] = useState({ visible: false, type: "", title: "", message: "" });

  const fileInputRef = useRef(null);
  const dropZoneRef  = useRef(null);

  const sizeOptions      = product?.sizeOptions || ["8x10", "11x14", "16x20", "20x24", "24x36"];
  const thicknessOptions = ["3mm", "5mm", "8mm"];
  const basePrice        = product?.basePrice || 999;

  const [size,      setSize]      = useState(product?.defaultSize || "8x10");
  const [thickness, setThickness] = useState("3mm");

  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", alternatePhone: "",
    address: "", city: "", state: "", pincode: "", paymentMethod: "razorpay",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js").catch(() => {});
  }, []);

  useEffect(() => {
    setOrderId(`#ORD${Math.floor(Math.random() * 9000 + 1000)}`);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("isLoggedIn") !== "true") { router.push("/login"); return; }
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || `${user.first_name || ""} ${user.last_name || ""}`.trim(),
        email:    prev.email    || user.email || "",
        phone:    prev.phone    || user.phone || "",
      }));
    } catch (_) {}
  }, []);

  const showNotification = (message, type = "info", title = "") => {
    const titles = { success: "Success", error: "Error", warning: "Warning" };
    setShowToast({ visible: true, type, title: title || titles[type] || "Info", message });
    setTimeout(() => setShowToast({ visible: false, type: "", title: "", message: "" }), 3000);
  };

  const openSuccessModal = () => {
    if (typeof window !== "undefined" && window.bootstrap) {
      const el = document.getElementById("successModal");
      if (el) new window.bootstrap.Modal(el).show();
    }
  };

  const calculatePrice = useCallback(() => {
    let price = basePrice;
    const idx = sizeOptions.indexOf(size);
    if (idx > 0) price += idx * (product?.priceIncrement || 200);
    if (thickness === "5mm") price += 150;
    if (thickness === "8mm") price += 300;
    return (price + (product?.cutoutPremium || 199)) * quantity;
  }, [size, thickness, sizeOptions, basePrice, quantity, product]);

  // ── Background removal ─────────────────────────────────────────────────────
  const autoRemoveBackground = async (imageDataURL) => {
    setIsRemovingBackground(true);
    try {
      const blob = await fetch(imageDataURL).then((r) => r.blob());
      const bgFormData = new FormData();
      bgFormData.append("image_file", blob, "image.png");
      bgFormData.append("size", "auto");
      const response = await fetch(BACKGROUND_REMOVAL_API_URL, {
        method: "POST",
        headers: { "X-Api-Key": BACKGROUND_REMOVAL_API_KEY },
        body: bgFormData,
      });
      if (!response.ok) throw new Error("Background removal failed");
      const resultBlob = await response.blob();
      const reader = new FileReader();
      const resultDataURL = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(resultBlob);
      });
      setUploadedImage(resultDataURL);
      setBackgroundRemoved(true);
      setIsPaymentReady(false);
      setMailPreviewImage("");
      showNotification("Background removed successfully!", "success");
    } catch (error) {
      setUploadedImage(imageDataURL);
      setBackgroundRemoved(false);
      setIsPaymentReady(false);
      setMailPreviewImage("");
      showNotification("Using original image", "warning");
    } finally {
      setIsRemovingBackground(false);
    }
  };

  // ── Mail preview ───────────────────────────────────────────────────────────
  const generateMailPreviewImageFn = async () => {
    try {
      const imageToUse = uploadedImage || originalImage;
      if (!imageToUse) return "";
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageToUse;
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
      const SIZE = 1400, PAD = 60;
      const canvas = document.createElement("canvas");
      canvas.width = SIZE + PAD * 2;
      canvas.height = SIZE + PAD * 2;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#f1f5f9";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const scale = Math.min(SIZE / img.width, SIZE / img.height);
      const drawWidth  = img.width  * scale;
      const drawHeight = img.height * scale;
      const dx = PAD + (SIZE - drawWidth)  / 2;
      const dy = PAD + (SIZE - drawHeight) / 2;
      ctx.shadowColor   = "rgba(0,0,0,0.28)";
      ctx.shadowBlur    = 28;
      ctx.shadowOffsetY = 14;
      ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
      return canvas.toDataURL("image/png");
    } catch { return ""; }
  };

  // ── File handling ──────────────────────────────────────────────────────────
  const processFile = (file) => {
    if (file.size > 50 * 1024 * 1024) { showNotification("File size must be less than 50MB", "error"); return; }
    if (!file.type.startsWith("image/")) { showNotification("Please upload an image file", "error"); return; }
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target.result;
      setOriginalImage(result);
      setUploadedImage(null);
      setBackgroundRemoved(false);
      setIsPaymentReady(false);
      setMailPreviewImage("");
      setIsProcessing(false);
      autoRemoveBackground(result);
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
    if (file) processFile(file);
    else showNotification("Please drop an image file", "error");
  };
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setOriginalImage(null);
    setBackgroundRemoved(false);
    setMailPreviewImage("");
    setIsPaymentReady(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setCurrentStep(1);
    showNotification("Image removed", "warning");
  };

  // ── Form ───────────────────────────────────────────────────────────────────
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
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Invalid email format";
    if (!formData.phone.trim()) e.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone)) e.phone = "Phone must be 10 digits";
    if (formData.alternatePhone && !/^\d{10}$/.test(formData.alternatePhone))
      e.alternatePhone = "Alternate phone must be 10 digits";
    if (!formData.address.trim()) e.address = "Address is required";
    if (!formData.city.trim()) e.city = "City is required";
    if (!formData.state.trim()) e.state = "State is required";
    if (!formData.pincode.trim()) e.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(formData.pincode)) e.pincode = "Pincode must be 6 digits";
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
    const preview = await generateMailPreviewImageFn();
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
        productName: product?.name || "Cutout Print",
        size, thickness, quantity,
        amount: calculatePrice(),
        payment_id: paymentData?.razorpay_payment_id || "",
      });
      localStorage.setItem("mareprints_orders", JSON.stringify(orders));
    }
    showNotification("Payment successful! Thank you for your order.", "success");
    openSuccessModal();
    setIsPaymentReady(false);
  };

  const handlePaymentError = () => showNotification("Payment failed. Please try again.", "error");

  const goToStep = (step) => {
    if (step === 2 && !uploadedImage && !originalImage) {
      showNotification("Please upload an image first", "warning");
      return;
    }
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Shared styles ──────────────────────────────────────────────────────────
  const labelStyle = {
    fontSize: "clamp(10px,2vw,12px)", fontWeight: 700, color: "#334155",
    marginBottom: "6px", display: "block",
  };
  const inputStyle = {
    borderRadius: "10px", border: "1.5px solid #e2e8f0",
    padding: "11px 14px", fontSize: "clamp(13px,2.5vw,14px)",
    background: "#fff", boxShadow: "none", width: "100%",
    transition: "border-color 0.2s",
  };
  const sectionCardStyle = {
    background: "#ffffff", border: "1px solid #e2e8f0",
    borderRadius: "20px", padding: "clamp(14px,3vw,24px)",
    boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
  };

  const renderFieldError = (field) =>
    formErrors[field] ? (
      <div style={{ marginTop: "6px", fontSize: "13px", color: "#dc2626", fontWeight: 600 }}>
        {formErrors[field]}
      </div>
    ) : null;

  // ── Step indicator ─────────────────────────────────────────────────────────
  const renderStepIndicator = () => (
    <div className={styles.stepIndicator}>
      <div className="container">
        <div className={styles.stepWrapper}>
          {[1, 2].map((step) => (
            <div key={step} className={styles.stepItem}>
              <button
                className={`${styles.stepButton} ${currentStep === step ? styles.active : ""} ${currentStep > step ? styles.completed : ""}`}
                onClick={() => goToStep(step)}
                disabled={step > 1 && !uploadedImage && !originalImage}
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

  // ── Step 1: Upload ─────────────────────────────────────────────────────────
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
                {uploadedImage || originalImage ? (
                  <div className={styles.previewContainer}>
                    {/* Image preview */}
                    <div style={{
                      position: "relative",
                      width: "100%",
                      borderRadius: "16px",
                      overflow: "hidden",
                      background: "linear-gradient(160deg,#eef2f7,#dde4ee)",
                      minHeight: "300px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <img
                        src={uploadedImage || originalImage}
                        alt="Preview"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "400px",
                          objectFit: "contain",
                          borderRadius: "12px",
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        style={{
                          position: "absolute", top: "10px", right: "10px",
                          width: "32px", height: "32px", borderRadius: "50%",
                          background: "#ef4444", color: "#fff", border: "none",
                          fontSize: "14px", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <i className="bi bi-x-lg" />
                      </button>
                    </div>

                    {/* Background removal status */}
                    <div style={{ marginTop: "12px" }}>
                      {isRemovingBackground && (
                        <div style={{
                          padding: "12px 16px", borderRadius: "12px",
                          background: "#eff6ff", border: "1px solid #bfdbfe",
                          display: "flex", alignItems: "center", gap: "10px",
                          color: "#1d4ed8", fontWeight: 600, fontSize: "14px",
                        }}>
                          <div className="spinner-border spinner-border-sm" role="status" />
                          Removing background automatically…
                        </div>
                      )}
                      {!isRemovingBackground && backgroundRemoved && (
                        <div style={{
                          padding: "12px 16px", borderRadius: "12px",
                          background: "#f0fdf4", border: "1px solid #86efac",
                          display: "flex", alignItems: "center", gap: "8px",
                          color: "#16a34a", fontWeight: 600, fontSize: "14px",
                        }}>
                          <i className="bi bi-check-circle-fill" />
                          Background removed successfully
                        </div>
                      )}
                      {!isRemovingBackground && !backgroundRemoved && originalImage && (
                        <div style={{
                          padding: "12px 16px", borderRadius: "12px",
                          background: "#fffbeb", border: "1px solid #fde68a",
                          display: "flex", alignItems: "center", gap: "8px",
                          color: "#92400e", fontWeight: 600, fontSize: "14px",
                        }}>
                          <i className="bi bi-exclamation-circle-fill" />
                          Using original image (background removal failed)
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={styles.uploadPrompt}>
                    <div className={styles.uploadIcon}>
                      <i className={`bi ${isDragging ? "bi-file-earmark-arrow-up" : "bi-cloud-upload"}`} />
                    </div>
                    <h3 className={styles.uploadTitle}>
                      {isDragging ? "Drop your image here" : "Upload your photo"}
                    </h3>
                    <p className={styles.uploadSubtitle}>
                      {isDragging ? "Release to upload" : "Background will be removed automatically"}
                    </p>
                    <button
                      className={styles.browseButton}
                      onClick={() => fileInputRef.current?.click()}
                      type="button"
                    >
                      <i className="bi bi-folder2-open me-2" />
                      Browse Files
                    </button>
                    <p className={styles.uploadHint}>Supported: JPG, PNG, GIF (Max 50MB)</p>
                    {isProcessing && (
                      <p style={{ marginTop: "10px", fontWeight: 600 }}>Processing image…</p>
                    )}
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="d-none"
                />
              </div>
            </div>

            {/* Mobile continue button */}
            <div className="d-block d-lg-none mt-3">
              <button
                className={styles.nextButton}
                onClick={() => goToStep(2)}
                disabled={!uploadedImage && !originalImage}
                type="button"
                style={{ width: "100%" }}
              >
                Continue to Customize &amp; Payment
                <i className="bi bi-arrow-right ms-2" />
              </button>
            </div>

            <div className={`${styles.uploadCard} mt-4`}>
              <img
                src="https://res.cloudinary.com/dsprfys3x/image/upload/v1773633339/wmremove-transformed_ouhicx.png"
                alt="guide"
                className="img-fluid"
              />
            </div>
          </div>

          <div className="col-sm-12 col-lg-4">
            <div className={styles.guideCard}>
              <h4 className={styles.guideTitle}>
                <i className="bi bi-scissors me-2" />
                Cutout Print Guide
              </h4>
              <ul className={styles.guideList}>
                <li><i className="bi bi-check-circle-fill" /> Upload a clear photo with a distinct subject</li>
                <li><i className="bi bi-check-circle-fill" /> Background is auto-removed on upload</li>
                <li><i className="bi bi-check-circle-fill" /> Use high-resolution images (min 300 DPI)</li>
                <li><i className="bi bi-check-circle-fill" /> Avoid busy or patterned backgrounds</li>
                <li className={styles.warning}>
                  <i className="bi bi-exclamation-triangle-fill" /> Poor quality images affect final print
                </li>
              </ul>
              <button
                className={`${styles.nextButton} d-none d-lg-flex`}
                onClick={() => goToStep(2)}
                disabled={!uploadedImage && !originalImage}
                type="button"
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

  // ── Step 2: Customize + Payment ────────────────────────────────────────────
  const renderStep2 = () => {
    const totalAmount = calculatePrice();
    const thicknessInfo = {
      "3mm": { label: "3mm", desc: "Slim",     icon: "bi-layers",      color: "#10b981" },
      "5mm": { label: "5mm", desc: "Standard", icon: "bi-layers-fill", color: "#2563eb" },
      "8mm": { label: "8mm", desc: "Premium",  icon: "bi-stack",       color: "#7c3aed" },
    };

    return (
      <div
        className={styles.stepContainer}
        style={{ background: "linear-gradient(180deg,#f0f7ff 0%,#f8fafc 50%,#f1f5f9 100%)", paddingBottom: "48px" }}
      >
        <div className="container-fluid" style={{ maxWidth: "1400px" }}>
          <div className="row g-3 align-items-start">

            {/* Left: live preview */}
            <div className={`col-12 col-lg-5 ${styles.step2PreviewCol}`}>
              <div style={{ ...sectionCardStyle, padding: "clamp(12px,3vw,20px)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "12px",
                    background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: "18px", flexShrink: 0,
                  }}>
                    <i className="bi bi-display" />
                  </div>
                  <div>
                    <div style={{ fontSize: "clamp(14px,3vw,17px)", fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
                      Live Preview
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>Your cutout photo</div>
                  </div>
                </div>

                {/* Cutout preview area */}
                <div style={{
                  width: "100%", minHeight: "340px",
                  borderRadius: "16px",
                  // background: `url('${WALL_MOCKUP}') center/cover no-repeat`,
                  background: "#f1f5f9",
                  position: "relative",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden",
                  border: "1px solid #e2e8f0",
                }}>
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "radial-gradient(ellipse at 50% 30%, transparent 45%, rgba(0,0,0,0.22) 100%)",
                    pointerEvents: "none", zIndex: 1,
                  }} />
                  {(uploadedImage || originalImage) ? (
                    <img
                      src={uploadedImage || originalImage}
                      alt="Cutout preview"
                      style={{
                        maxWidth: "80%", maxHeight: "300px",
                        objectFit: "contain",
                        position: "relative", zIndex: 2,
                        filter: "drop-shadow(0 16px 32px rgba(0,0,0,0.35))",
                      }}
                    />
                  ) : (
                    <div style={{ color: "#94a3b8", textAlign: "center", position: "relative", zIndex: 2 }}>
                      <i className="bi bi-image" style={{ fontSize: "36px" }} />
                      <div style={{ fontSize: "13px", marginTop: "8px" }}>No image</div>
                    </div>
                  )}
                  {/* Background removed badge */}
                  {backgroundRemoved && (
                    <div style={{
                      position: "absolute", bottom: "10px", left: "50%",
                      transform: "translateX(-50%)",
                      background: "rgba(22,163,74,0.92)",
                      color: "#fff", fontWeight: 600, fontSize: "11px",
                      padding: "4px 12px", borderRadius: "999px", zIndex: 3,
                    }}>
                      <i className="bi bi-scissors me-1" />Background Removed
                    </div>
                  )}
                </div>

                {/* Status pills */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px", justifyContent: "center" }}>
                  {[size, thickness, `Qty: ${quantity}`].map((txt) => (
                    <span key={txt} style={{
                      background: "rgba(255,255,255,0.96)", backdropFilter: "blur(8px)",
                      padding: "4px 11px", borderRadius: "999px",
                      fontSize: "11px", fontWeight: 600, color: "#0f172a",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                      border: "1px solid #e2e8f0",
                    }}>{txt}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: controls + form */}
            <div className="col-12 col-lg-7">
              <div className="d-flex flex-column gap-3">

                {/* Customise Options */}
                <div style={sectionCardStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "12px",
                      background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: "18px",
                    }}>
                      <i className="bi bi-sliders" />
                    </div>
                    <div style={{ fontSize: "clamp(14px,3vw,17px)", fontWeight: 800, color: "#0f172a" }}>
                      Customise Your Print
                    </div>
                  </div>

                  {/* Size */}
                  <div style={{ marginBottom: "24px" }}>
                    <label style={{ ...labelStyle, marginBottom: "10px" }}>
                      <i className="bi bi-aspect-ratio me-1" style={{ color: "#2563eb" }} />Size (inches)
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {sizeOptions.map((opt) => {
                        const active = size === opt;
                        return (
                          <button key={opt} type="button"
                            onClick={() => { setSize(opt); setIsPaymentReady(false); }}
                            style={{
                              padding: "8px 16px", borderRadius: "10px",
                              border: active ? "2px solid #2563eb" : "1.5px solid #e2e8f0",
                              background: active ? "#2563eb" : "#f8fafc",
                              color: active ? "#fff" : "#334155",
                              fontWeight: active ? 700 : 500, fontSize: "13px",
                              cursor: "pointer", transition: "all 0.18s",
                              boxShadow: active ? "0 4px 12px rgba(37,99,235,0.25)" : "none",
                            }}
                          >{opt}</button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Thickness */}
                  <div style={{ marginBottom: "24px" }}>
                    <label style={{ ...labelStyle, marginBottom: "10px" }}>
                      <i className="bi bi-layers me-1" style={{ color: "#2563eb" }} />Thickness
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                      {thicknessOptions.map((opt) => {
                        const info = thicknessInfo[opt];
                        const active = thickness === opt;
                        return (
                          <button key={opt} type="button"
                            onClick={() => { setThickness(opt); setIsPaymentReady(false); }}
                            style={{
                              flex: "1 1 90px", padding: "12px 10px", borderRadius: "14px",
                              border: active ? `2px solid ${info.color}` : "1.5px solid #e2e8f0",
                              background: active ? `${info.color}14` : "#f8fafc",
                              color: active ? info.color : "#475569",
                              fontWeight: active ? 700 : 500, fontSize: "13px",
                              cursor: "pointer", transition: "all 0.18s", textAlign: "center",
                              boxShadow: active ? `0 0 0 3px ${info.color}22` : "none",
                            }}
                          >
                            <i className={`bi ${info.icon}`} style={{ fontSize: "18px", display: "block", marginBottom: "4px" }} />
                            <span style={{ fontSize: "15px", fontWeight: 800 }}>{info.label}</span>
                            <span style={{ display: "block", fontSize: "10px", opacity: 0.75, marginTop: "2px" }}>{info.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label style={{ ...labelStyle, marginBottom: "10px" }}>
                      <i className="bi bi-hash me-1" style={{ color: "#2563eb" }} />Quantity
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", maxWidth: "200px" }}>
                      <button type="button"
                        onClick={() => { setQuantity((p) => Math.max(1, p - 1)); setIsPaymentReady(false); }}
                        style={{
                          width: "42px", height: "42px", borderRadius: "12px",
                          border: "1.5px solid #dbe3ee", background: "#fff",
                          fontWeight: 700, fontSize: "18px", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", color: "#334155",
                        }}
                      >−</button>
                      <div style={{
                        flex: 1, height: "42px", borderRadius: "12px",
                        border: "1.5px solid #2563eb", background: "#eff6ff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 800, fontSize: "16px", color: "#1d4ed8",
                      }}>{quantity}</div>
                      <button type="button"
                        onClick={() => { setQuantity((p) => p + 1); setIsPaymentReady(false); }}
                        style={{
                          width: "42px", height: "42px", borderRadius: "12px",
                          border: "1.5px solid #dbe3ee", background: "#fff",
                          fontWeight: 700, fontSize: "18px", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", color: "#334155",
                        }}
                      >+</button>
                    </div>
                  </div>
                </div>

                {/* Order Summary + Contact */}
                <div style={{
                  ...sectionCardStyle,
                  background: "linear-gradient(145deg,#0f172a 0%,#1e293b 100%)",
                  border: "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "10px",
                      background: "rgba(255,255,255,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: "16px",
                    }}>
                      <i className="bi bi-receipt" />
                    </div>
                    <span style={{ fontSize: "16px", fontWeight: 800, color: "#fff" }}>Order Summary</span>
                  </div>
                  <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    {[
                      { icon: "bi-hash",         label: "Order ID",    value: orderId },
                      { icon: "bi-scissors",     label: "Product",     value: product?.name || "Cutout Print" },
                      { icon: "bi-rulers",       label: "Size",        value: size },
                      { icon: "bi-layers",       label: "Thickness",   value: thickness },
                      { icon: "bi-bag",          label: "Quantity",    value: quantity },
                      { icon: "bi-magic",        label: "Background",  value: backgroundRemoved ? "Removed" : "Original" },
                    ].map(({ icon, label, value }) => (
                      <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "7px", color: "#94a3b8", fontSize: "13px" }}>
                          <i className={`bi ${icon}`} />{label}
                        </span>
                        <span style={{ fontWeight: 700, color: "#f1f5f9", fontSize: "13px" }}>{value}</span>
                      </div>
                    ))}
                    <div style={{ margin: "6px 0", borderTop: "1px solid rgba(255,255,255,0.1)" }} />
                    <div style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "12px 16px", borderRadius: "14px",
                      background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                    }}>
                      <span style={{ color: "#bfdbfe", fontWeight: 600, fontSize: "13px" }}>Total Amount</span>
                      <span style={{ color: "#fff", fontWeight: 900, fontSize: "22px" }}>₹{totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Contact & Delivery */}
                <div style={sectionCardStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "12px",
                      background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: "18px",
                    }}>
                      <i className="bi bi-truck" />
                    </div>
                    <div>
                      <div style={{ fontSize: "clamp(14px,3vw,17px)", fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
                        Contact &amp; Delivery
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                        We&apos;ll use this to ship your order
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmitOrder}>
                    <div className="row g-3">
                      <div className="col-12">
                        <label style={labelStyle}><i className="bi bi-person me-1" style={{ color: "#2563eb" }} />Full Name</label>
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange}
                          className="form-control" placeholder="Enter your full name" style={inputStyle} />
                        {renderFieldError("fullName")}
                      </div>
                      <div className="col-12">
                        <label style={labelStyle}><i className="bi bi-envelope me-1" style={{ color: "#2563eb" }} />Email Address</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                          className="form-control" placeholder="Enter your email" style={inputStyle} />
                        {renderFieldError("email")}
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}><i className="bi bi-telephone me-1" style={{ color: "#2563eb" }} />Phone</label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleInputChange}
                          className="form-control" placeholder="10-digit phone" style={inputStyle} />
                        {renderFieldError("phone")}
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}><i className="bi bi-telephone-plus me-1" style={{ color: "#94a3b8" }} />Alt. Phone</label>
                        <input type="text" name="alternatePhone" value={formData.alternatePhone} onChange={handleInputChange}
                          className="form-control" placeholder="Optional" style={inputStyle} />
                        {renderFieldError("alternatePhone")}
                      </div>
                      <div className="col-12">
                        <label style={labelStyle}><i className="bi bi-geo-alt me-1" style={{ color: "#2563eb" }} />Address</label>
                        <textarea name="address" value={formData.address} onChange={handleInputChange}
                          className="form-control" placeholder="Enter your full address"
                          style={{ ...inputStyle, minHeight: "90px", resize: "vertical" }} />
                        {renderFieldError("address")}
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}><i className="bi bi-building me-1" style={{ color: "#2563eb" }} />City</label>
                        <input type="text" name="city" value={formData.city} onChange={handleInputChange}
                          className="form-control" placeholder="City" style={inputStyle} />
                        {renderFieldError("city")}
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}><i className="bi bi-map me-1" style={{ color: "#2563eb" }} />State</label>
                        <input type="text" name="state" value={formData.state} onChange={handleInputChange}
                          className="form-control" placeholder="State" style={inputStyle} />
                        {renderFieldError("state")}
                      </div>
                      <div className="col-12">
                        <label style={labelStyle}><i className="bi bi-mailbox me-1" style={{ color: "#2563eb" }} />Pincode</label>
                        <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange}
                          className="form-control" placeholder="6-digit pincode" style={inputStyle} />
                        {renderFieldError("pincode")}
                      </div>

                      <div className="col-12 mt-2">
                        {!isPaymentReady ? (
                          <button
                            type="button"
                            onClick={validateBeforePayment}
                            style={{
                              width: "100%", padding: "14px", borderRadius: "14px", border: "none",
                              background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                              color: "#fff", fontWeight: 700, fontSize: "clamp(14px,3vw,16px)",
                              cursor: "pointer", boxShadow: "0 8px 20px rgba(37,99,235,0.3)",
                              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                              transition: "opacity 0.2s",
                            }}
                          >
                            <i className="bi bi-shield-check" />
                            Verify Details
                          </button>
                        ) : (
                          <RazorpayPayment
                            amount={totalAmount}
                            buttonText={`Pay Now ₹${totalAmount}`}
                            themeColor="#2563eb"
                            previewImages={[mailPreviewImage]}
                            uploadedImages={[uploadedImage || originalImage || ""]}
                            customerDetails={{
                              orderId,
                              productType: product?.type || "cutout",
                              productName: product?.name || "Cutout Print",
                              name: formData.fullName,
                              fullName: formData.fullName,
                              email: formData.email,
                              phone: formData.phone,
                              alternatePhone: formData.alternatePhone,
                              address: formData.address,
                              city: formData.city,
                              state: formData.state,
                              pincode: formData.pincode,
                              size, thickness, quantity,
                              amount: totalAmount,
                              backgroundRemoved,
                            }}
                            onSuccess={handlePaymentSuccess}
                            onError={handlePaymentError}
                          />
                        )}
                      </div>
                    </div>
                  </form>
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

      {/* Toast */}
      {showToast.visible && (
        <div style={{
          position: "fixed", top: "20px", right: "20px", zIndex: 9999,
          minWidth: "280px", maxWidth: "360px",
          background: "#ffffff", border: "1px solid #e2e8f0",
          borderLeft: `4px solid ${
            showToast.type === "success" ? "#16a34a" :
            showToast.type === "error"   ? "#dc2626" :
            showToast.type === "warning" ? "#f59e0b" : "#2563eb"
          }`,
          borderRadius: "16px", boxShadow: "0 20px 40px rgba(15,23,42,0.12)", padding: "14px 16px",
        }}>
          <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>{showToast.title}</div>
          <div style={{ color: "#475569", fontSize: "14px" }}>{showToast.message}</div>
        </div>
      )}

      {/* Success modal */}
      <div className="modal fade" id="successModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 rounded-4 shadow">
            <div className="modal-body text-center p-4">
              <div className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                style={{ width: "72px", height: "72px", background: "rgba(25,135,84,0.12)", color: "#198754", fontSize: "32px" }}>
                <i className="bi bi-check2-circle" />
              </div>
              <h4 className="fw-bold mb-2">Payment Successful</h4>
              <p className="text-muted mb-4">
                Thank you for your order. Your payment was completed successfully.
              </p>
              <div className="bg-light rounded-4 p-3 text-start mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>Order ID</span><span>{orderId}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Amount Paid</span><span>₹{calculatePrice()}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Email</span><span>{formData.email || "-"}</span>
                </div>
              </div>
              <button type="button" className="btn btn-dark px-4 py-2 rounded-3" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

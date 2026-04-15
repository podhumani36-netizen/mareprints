"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "../../../assest/style/ProductClient.module.css";
import RazorpayPayment from "../../../Components/payment/Razorpay";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const ROOM_WALL_BG =
  "https://res.cloudinary.com/dsprfys3x/image/upload/v1773634493/Gemini_Generated_Image_g2ds8ig2ds8ig2ds_puojbl.png";

const WALL_MOCKUP =
  "https://res.cloudinary.com/dsprfys3x/image/upload/v1773637296/wmremove-transformed_f1xtnt.jpg";

export default function ProductClientBase({
  sizeOptions,
  frameDimensions,
  defaultSize,
  basePrice,
  frameRadius = "0px",
  productOrientation,
  exportWidth = 2000,
  exportHeight = 1600,
  circleClip = false,
}) {
  const router = useRouter();
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
    visible: false,
    type: "",
    title: "",
    message: "",
  });

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const [size, setSize] = useState(defaultSize);
  const [thickness, setThickness] = useState("3mm");
  const [pincode, setPincode] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState({
    message: "",
    type: "",
    isChecking: false,
  });
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    alternatePhone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "razorpay",
  });

  const [formErrors, setFormErrors] = useState({});

  const thicknessOptions = ["3mm", "5mm", "8mm"];

  // ── Bootstrap JS ──────────────────────────────────────────────────────────
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js").catch((err) =>
      console.error("Failed to load Bootstrap JS:", err)
    );
  }, []);

  // ── Order ID ──────────────────────────────────────────────────────────────
  useEffect(() => {
    setOrderId(`#ORD${Math.floor(Math.random() * 9000 + 1000)}`);
  }, []);

  // ── Auth guard + pre-fill form ────────────────────────────────────────────
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

  // ── Draw uploaded image to hidden canvas ──────────────────────────────────
  useEffect(() => {
    if (!uploadedImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = uploadedImage;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, img.width, img.height);
      showNotification("Image uploaded successfully!", "success");
    };
    img.onerror = () => {
      showNotification("Failed to load image. Please try again.", "error");
    };
  }, [uploadedImage]);

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
    setShowToast({
      visible: true,
      type,
      title: title || titles[type] || "Info",
      message,
    });
    setTimeout(
      () => setShowToast({ visible: false, type: "", title: "", message: "" }),
      3000
    );
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
    if (idx > 0) price += idx * 150;
    if (thickness === "5mm") price += 150;
    if (thickness === "8mm") price += 300;
    return price * quantity;
  }, [basePrice, sizeOptions, size, thickness, quantity]);

  const generateMailPreviewImage = async () => {
    try {
      if (!uploadedImage) return "";
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = uploadedImage;
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });

      const dims = frameDimensions[size] || { width: 200, height: 200 };
      const S = 8; // export scale: 8× on-screen CSS pixels → high-res

      const frameW  = dims.width  * S;
      const frameH  = dims.height * S;
      const depthPx = (thickness === "3mm" ? 4 : thickness === "5mm" ? 5 : 7) * S;
      const PAD     = 5 * S; // padding so drop-shadow is never clipped

      const canvas = document.createElement("canvas");
      canvas.width  = frameW + depthPx + PAD * 2;
      canvas.height = frameH + depthPx + PAD * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) return "";

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Neutral background (matches the studio/wall feel of the preview)
      ctx.fillStyle = "#f1f5f9";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const fx = PAD; // frame top-left x
      const fy = PAD; // frame top-left y

      // Corner radius: circle → half-min-dimension, rounded-rect → scaled px, rect → 0
      const radius = circleClip
        ? Math.min(frameW, frameH) / 2
        : frameRadius && frameRadius !== "0px"
        ? Math.min(parseFloat(frameRadius) * S, frameW / 2, frameH / 2)
        : 0;

      // Trace the frame shape (circle / rounded-rect / rectangle)
      const tracePath = (x, y, w, h) => {
        ctx.beginPath();
        if (circleClip) {
          ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
        } else if (radius > 0) {
          const r = radius;
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + w - r, y);
          ctx.quadraticCurveTo(x + w, y, x + w, y + r);
          ctx.lineTo(x + w, y + h - r);
          ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
          ctx.lineTo(x + r, y + h);
          ctx.quadraticCurveTo(x, y + h, x, y + h - r);
          ctx.lineTo(x, y + r);
          ctx.quadraticCurveTo(x, y, x + r, y);
        } else {
          ctx.rect(x, y, w, h);
        }
        ctx.closePath();
      };

      // 1. Depth / thickness layer — same gradient as live preview, offset bottom-right
      ctx.save();
      tracePath(fx + depthPx, fy + depthPx, frameW, frameH);
      const depthGrad = ctx.createLinearGradient(
        fx + depthPx, fy + depthPx,
        fx + depthPx + frameW, fy + depthPx + frameH
      );
      depthGrad.addColorStop(0, thickness === "3mm" ? "#d9d9d9" : thickness === "5mm" ? "#cfcfcf" : "#bdbdbd");
      depthGrad.addColorStop(1, "#8f8f8f");
      ctx.fillStyle = depthGrad;
      ctx.shadowColor   = "rgba(0,0,0,0.22)";
      ctx.shadowBlur    = 18;
      ctx.shadowOffsetY = 18;
      ctx.fill();
      ctx.restore();

      // 2. White front face (the print surface) with a soft drop-shadow
      ctx.save();
      tracePath(fx, fy, frameW, frameH);
      ctx.fillStyle     = "#ffffff";
      ctx.shadowColor   = "rgba(0,0,0,0.16)";
      ctx.shadowBlur    = 24;
      ctx.shadowOffsetY = 10;
      ctx.fill();
      ctx.restore();

      // 3. User's image clipped to the exact frame shape
      ctx.save();
      tracePath(fx, fy, frameW, frameH);
      ctx.clip();

      // objectFit: contain — same as the CSS in the live preview
      const baseScale  = Math.min(frameW / img.width, frameH / img.height);
      const finalScale = baseScale * zoom;
      const drawWidth  = img.width  * finalScale;
      const drawHeight = img.height * finalScale;
      // Offset: user dragged inside a dims.{width,height} px frame on screen → scale by S
      const dx = fx + (frameW - drawWidth)  / 2 + imageOffset.x * S;
      const dy = fy + (frameH - drawHeight) / 2 + imageOffset.y * S;

      ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
      ctx.restore();

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
    };
    reader.onerror = () => {
      setIsProcessing(false);
      showNotification("Failed to read file. Please try again.", "error");
    };
    reader.readAsDataURL(file);
  };

  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver  = (e) => { e.preventDefault(); e.stopPropagation(); if (!isDragging) setIsDragging(true); };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > 10 * 1024 * 1024) { showNotification("File size must be less than 50MB", "error"); return; }
      processFile(file);
    } else {
      showNotification("Please upload an image file", "error");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { showNotification("File size must be less than 50MB", "error"); return; }
    if (!file.type.startsWith("image/")) { showNotification("Please upload an image file", "error"); return; }
    processFile(file);
  };

  const handleZoomIn  = () => { setZoom((p) => Math.min(p + 0.1, 3)); setIsPaymentReady(false); };
  const handleZoomOut = () => { setZoom((p) => Math.max(p - 0.1, 1)); setIsPaymentReady(false); };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setZoom(1);
    setImageOffset({ x: 0, y: 0 });
    setCurrentStep(1);
    setIsPaymentReady(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    showNotification("Image removed successfully", "warning");
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

  const handlePincodeChange = (e) => {
    setPincode(e.target.value.replace(/\D/g, "").slice(0, 6));
    setDeliveryStatus({ message: "", type: "", isChecking: false });
  };

  const handleCheckDelivery = () => {
    if (pincode.length !== 6) { showNotification("Please enter a valid 6-digit pincode", "warning"); return; }
    setDeliveryStatus({ message: "", type: "", isChecking: true });
    setTimeout(() => {
      const ok = ["110001", "400001", "700001", "560001", "600001"].includes(pincode);
      if (ok) {
        setDeliveryStatus({ type: "success", message: "Delivery available to this pincode.", isChecking: false });
        setEstimatedDeliveryDate("3-5 business days");
        showNotification("We deliver to this location", "success");
      } else {
        setDeliveryStatus({ type: "error", message: "Sorry, we do not deliver to this pincode yet.", isChecking: false });
        setEstimatedDeliveryDate("");
        showNotification("We don't deliver to this location yet", "error");
      }
    }, 1000);
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
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Invalid email format";
    if (!formData.phone.trim()) e.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone)) e.phone = "Phone must be 10 digits";
    if (formData.alternatePhone.trim() && !/^\d{10}$/.test(formData.alternatePhone))
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
    const previewBase64 = await generateMailPreviewImage();
    setMailPreviewImage(previewBase64);
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
        productName: `Custom Acrylic Print (${productOrientation} ${size})`,
        size,
        thickness,
        quantity,
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
    if (step === 2 && !uploadedImage) { showNotification("Please upload an image first", "warning"); return; }
    setCurrentStep(step);
  };

  // ── Styles ────────────────────────────────────────────────────────────────

  const inputStyle = {
    borderRadius: "8px",
    minHeight: "10px",
    border: "1px solid #dbe3ee",
    background: "#ffffff",
    boxShadow: "none",
    padding: "clamp(9px, 2vw, 12px) clamp(10px, 2.5vw, 14px)",
    fontSize: "clamp(13px, 2.5vw, 15px)",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  };

  const labelStyle = {
    fontSize: "clamp(10px, 2vw, 12px)",
    fontWeight: 700,
    color: "#334155",
    marginBottom: "6px",
    display: "block",
  };

  const sectionCardStyle = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "clamp(14px, 3vw, 24px)",
    boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
  };

  // ── Sub-components ────────────────────────────────────────────────────────

  const renderFieldError = (field) =>
    formErrors[field] ? (
      <div style={{ marginTop: "6px", fontSize: "13px", color: "#dc2626", fontWeight: 600 }}>
        {formErrors[field]}
      </div>
    ) : null;

  const SelectField = ({ value, onChange, options }) => (
    <div style={{ position: "relative", width: "100%" }}>
      <select
        value={value}
        onChange={onChange}
        style={{
          ...inputStyle,
          width: "100%",
          paddingRight: "40px",
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",
          cursor: "pointer",
        }}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <i
        className="bi bi-chevron-down"
        style={{
          position: "absolute",
          right: "14px",
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          color: "#475569",
          fontSize: "14px",
          zIndex: 5,
        }}
      />
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────

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
                <span className={styles.stepLabel}>
                  {step === 1 ? "Upload" : "Customize & Payment"}
                </span>
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

  const renderEditorControls = () => (
    <div
      style={{
        marginTop: "10px",
        padding: "10px",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "20px",
        boxShadow: "0 10px 24px rgba(15,23,42,0.05)",
      }}
    >
      <div className="d-flex gap-2 flex-wrap align-items-center justify-content-between">
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <button
            type="button"
            className="btn btn-light"
            onClick={handleZoomOut}
            style={{ width: "34px", height: "34px", borderRadius: "8px", border: "1px solid #dbe3ee", fontSize: "13px" }}
          >
            <i className="bi bi-dash-lg" />
          </button>
          <div
            style={{
              minWidth: "60px",
              textAlign: "center",
              fontWeight: 500,
              fontSize: "13px",
              color: "#0f172a",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "10px 12px",
            }}
          >
            {Math.round(zoom * 100)}%
          </div>
          <button
            type="button"
            className="btn btn-light"
            onClick={handleZoomIn}
            style={{ width: "34px", height: "34px", borderRadius: "8px", border: "1px solid #dbe3ee", fontSize: "13px" }}
          >
            <i className="bi bi-plus-lg" />
          </button>
        </div>
        <button
          type="button"
          className="btn btn-outline-dark"
          onClick={() => { setZoom(1); setImageOffset({ x: 0, y: 0 }); setIsPaymentReady(false); }}
          style={{ borderRadius: "12px", padding: "8px 14px", fontSize: "13px" }}
        >
          Reset Position
        </button>
      </div>
      <div className="mt-3">
        <input
          type="range"
          min="1"
          max="3"
          step="0.05"
          value={zoom}
          onChange={(e) => { setZoom(Number(e.target.value)); setIsPaymentReady(false); }}
          style={{ width: "100%", cursor: "pointer", accentColor: "#2563eb" }}
        />
      </div>
    </div>
  );

  const renderBetterPreview = (useWall = false) => {
    const dims = frameDimensions[size] || { width: 200, height: 200 };
    const [widthInch, heightInch] = size.split("x").map(Number);
    const depth = thickness === "3mm" ? 4 : thickness === "5mm" ? 5 : 7;

    return (
      <div
        className={styles.previewArea}
        style={{
          position: "relative",
          width: "100%",
          borderRadius: "28px",
          overflow: "hidden",
          background: useWall ? "#f8fafc" : "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          backgroundImage: useWall ? `url(${WALL_MOCKUP})` : undefined,
          backgroundSize: useWall ? "cover" : undefined,
          backgroundPosition: useWall ? "center" : undefined,
          border: "1px solid #e2e8f0",
        }}
      >
        {useWall && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to bottom, rgba(255,255,255,0.10), rgba(15,23,42,0.06))",
              pointerEvents: "none",
            }}
          />
        )}

        {/* glass inner border */}
        <div
          style={{
            position: "absolute",
            inset: "24px",
            borderRadius: "24px",
            border: "1px solid rgba(255,255,255,0.55)",
            pointerEvents: "none",
          }}
        />

        {/* frame */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "45%",
            width: `${dims.width}px`,
            height: `${dims.height}px`,
            transform: "translate(-50%, -50%)",
            borderRadius: frameRadius,
            overflow: "visible",
            background: "transparent",
            maxWidth: "92%",
            maxHeight: "78%",
          }}
        >
          {/* depth shadow */}
          <div
            style={{
              position: "absolute",
              top: `${depth}px`,
              left: `${depth}px`,
              right: `-${depth}px`,
              bottom: `-${depth}px`,
              borderRadius: frameRadius,
              background:
                thickness === "3mm"
                  ? "linear-gradient(145deg, #d9d9d9, #8f8f8f)"
                  : thickness === "5mm"
                  ? "linear-gradient(145deg, #cfcfcf, #8f8f8f)"
                  : "linear-gradient(145deg, #bdbdbd, #8f8f8f)",
              boxShadow: "0 18px 35px rgba(0,0,0,0.22)",
              zIndex: 1,
            }}
          />

          {/* front face */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: frameRadius,
              background: "#ffffff",
              boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
              overflow: "hidden",
              zIndex: 2,
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                cursor: uploadedImage ? (isImageDragging ? "grabbing" : "grab") : "default",
                background: "#f1f5f9",
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
                alt="Frame preview"
                draggable={false}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  transform: `translate(calc(-50% + ${imageOffset.x}px), calc(-50% + ${imageOffset.y}px)) scale(${zoom})`,
                  transformOrigin: "center center",
                  transition: isImageDragging ? "none" : "transform 0.18s ease",
                  userSelect: "none",
                  touchAction: "none",
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>
        </div>

        {/* size/thickness pill labels */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: "28px",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            justifyContent: "center",
            padding: "0 16px",
            width: "100%",
          }}
        >
          <span
            style={{
              background: "rgba(255,255,255,0.96)",
              padding: "10px 16px",
              borderRadius: "999px",
              fontWeight: 500,
              fontSize: "13px",
              color: "#0f172a",
              border: "1px solid #e2e8f0",
            }}
          >
            {size} • {(widthInch * 2.54).toFixed(2)} x {(heightInch * 2.54).toFixed(2)} cm
          </span>
          <span
            style={{
              background: "rgba(255,255,255,0.96)",
              padding: "10px 16px",
              borderRadius: "999px",
              fontWeight: 500,
              fontSize: "13px",
              color: "#0f172a",
              border: "1px solid #e2e8f0",
            }}
          >
            Thickness: {thickness}
          </span>
        </div>
      </div>
    );
  };

  const renderSummaryPreview = () => {
    if (!uploadedImage) return null;
    return (
      <div className={styles.summaryPreviewWrapper}>
        <div className={styles.summaryPreviewScaler}>
          {renderBetterPreview(false)}
        </div>
      </div>
    );
  };

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
                    {renderBetterPreview(false)}
                    {renderEditorControls()}
                    <div className={styles.imageControls}>
                      <button
                        className={`${styles.controlButton} ${styles.dangerButton}`}
                        onClick={handleRemoveImage}
                        title="Remove Image"
                        type="button"
                      >
                        <i className="bi bi-trash" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.uploadPrompt}>
                    <div className={styles.uploadIcon}>
                      <i className={`bi ${isDragging ? "bi-file-earmark-arrow-up" : "bi-cloud-upload"}`} />
                    </div>
                    <h3 className={styles.uploadTitle}>
                      {isDragging ? "Drop your image here" : "Upload your image"}
                    </h3>
                    <p className={styles.uploadSubtitle}>
                      {isDragging ? "Release to upload" : "Drag & drop or click to browse"}
                    </p>
                    <button
                      className={styles.browseButton}
                      onClick={() => fileInputRef.current?.click()}
                      type="button"
                    >
                      <i className="bi bi-folder2-open me-2" />
                      Browse Files
                    </button>
                    <p className={styles.uploadHint}>Supported formats: JPG, PNG, GIF (Max 50MB)</p>
                    {isProcessing && (
                      <p style={{ marginTop: "10px", fontWeight: 600 }}>Processing image...</p>
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
                <i className="bi bi-info-circle me-2" />
                Print Quality Guide
              </h4>
              <img
                src="https://res.cloudinary.com/dsprfys3x/image/upload/v1773825342/Gemini_Generated_Image_g2ds8ig2ds8ig2ds_u7pv7w.png"
                alt="Print quality guide"
                className={styles.guideImage}
              />
              <ul className={styles.guideList}>
                <li><i className="bi bi-check-circle-fill" /> Upload high-resolution images</li>
                <li><i className="bi bi-check-circle-fill" /> Ensure image is sharp and clear</li>
                <li><i className="bi bi-check-circle-fill" /> Avoid screenshots or low-quality images</li>
                <li className={styles.warning}>
                  <i className="bi bi-exclamation-triangle-fill" /> Poor quality images affect final print
                </li>
              </ul>
              <button
                className={styles.nextButton}
                onClick={() => goToStep(2)}
                disabled={!uploadedImage}
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

  const renderStep2 = () => {
    const totalAmount = calculatePrice();
    return (
      <div
        className={styles.stepContainer}
        style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 55%, #f1f5f9 100%)" }}
      >
        <div className="container">
          <div className="row g-4 align-items-start">

            {/* Left: preview + options */}
            <div className="col-lg-7">
              <div style={sectionCardStyle}>
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
                  <div>
                    <h3 style={{ margin: 0, fontSize: "clamp(15px, 3.5vw, 26px)", fontWeight: 800, color: "#0f172a" }}>
                      Live Preview
                    </h3>
                    <p style={{ margin: "4px 0 0", fontSize: "clamp(11px, 2vw, 13px)", color: "#64748b" }}>
                      Adjust your image and review before payment
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    style={{
                      borderRadius: "12px",
                      padding: "8px 16px",
                      border: "1.5px solid #2563eb",
                      color: "#2563eb",
                      background: "transparent",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.2s ease",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#2563eb"; }}
                  >
                    <i className="bi bi-arrow-left" />Back
                  </button>
                </div>

                {/* Sticky on mobile: preview + zoom controls stay visible while
                    the user scrolls through the options / form below */}
                <div className={styles.step2PreviewWrapper}>
                  {renderBetterPreview(true)}
                  {renderEditorControls()}
                </div>

                <div style={{ ...sectionCardStyle, marginBottom: "20px" }}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label style={labelStyle}>Size</label>
                      <SelectField
                        value={size}
                        onChange={(e) => { setSize(e.target.value); setIsPaymentReady(false); }}
                        options={sizeOptions}
                      />
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Thickness</label>
                      <SelectField
                        value={thickness}
                        onChange={(e) => { setThickness(e.target.value); setIsPaymentReady(false); }}
                        options={thicknessOptions}
                      />
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => { setQuantity(Math.max(1, Number(e.target.value) || 1)); setIsPaymentReady(false); }}
                        style={{ ...inputStyle, width: "100%" }}
                      />
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Order ID</label>
                      <input
                        type="text"
                        value={orderId}
                        readOnly
                        style={{ ...inputStyle, width: "100%", color: "#64748b" }}
                      />
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
                  <h4 style={{ marginBottom: "14px", fontWeight: 800, color: "#0f172a", fontSize: "clamp(13px, 2.5vw, 18px)" }}>
                    Order Summary
                  </h4>
                  {renderSummaryPreview()}
                  <div style={{ display: "grid", gap: "8px", marginTop: "10px", fontSize: "clamp(12px, 2.5vw, 14px)", color: "#334155" }}>
                    {[
                      ["Size", size],
                      ["Thickness", thickness],
                      ["Quantity", quantity],
                    ].map(([label, val]) => (
                      <div key={label} className="d-flex justify-content-between" style={{ paddingBottom: "8px", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ color: "#64748b" }}>{label}</span>
                        <strong style={{ color: "#0f172a" }}>{val}</strong>
                      </div>
                    ))}
                    <div className="d-flex justify-content-between" style={{ paddingTop: "4px" }}>
                      <span style={{ fontWeight: 700, color: "#0f172a" }}>Total Amount</span>
                      <strong style={{ color: "#2563eb", fontSize: "clamp(15px, 3vw, 18px)" }}>₹{totalAmount}</strong>
                    </div>
                  </div>
                </div>

                {/* Customer details */}
                <div style={{ ...sectionCardStyle, marginBottom: "20px" }}>
                  <h4 style={{ marginBottom: "14px", fontWeight: 800, color: "#0f172a", fontSize: "clamp(13px, 2.5vw, 18px)" }}>
                    Customer Details
                  </h4>
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
                      <textarea name="address" value={formData.address} onChange={handleInputChange} rows="3" style={{ ...inputStyle, width: "100%", resize: "none" }} />
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
                    <button
                      type="submit"
                      style={{
                        width: "100%",
                        borderRadius: "14px",
                        padding: "clamp(11px, 2.5vw, 14px) 18px",
                        fontWeight: 700,
                        fontSize: "clamp(13px, 2.5vw, 16px)",
                        background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                        color: "#ffffff",
                        border: "none",
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
                        transition: "all 0.25s ease",
                        letterSpacing: "0.01em",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,99,235,0.45)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(37,99,235,0.35)"; e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                      <i className="bi bi-shield-check me-2" />
                      Verify Details &amp; Pay Now
                    </button>
                  ) : (
                    <RazorpayPayment
                      amount={totalAmount}
                      customerDetails={{
                        ...formData,
                        name: formData.fullName,
                        orderId,
                        productType: productOrientation,
                        productName: `Custom Acrylic Print (${productOrientation} ${size})`,
                        orientation: productOrientation,
                        size,
                        thickness,
                        quantity,
                        amount: totalAmount,
                        imageZoom: zoom,
                        imageOffsetX: imageOffset.x,
                        imageOffsetY: imageOffset.y,
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

      <canvas ref={canvasRef} className="d-none" />

      {/* Toast */}
      {showToast.visible && (
        <div
          style={{
            position: "fixed",
            top: "16px",
            right: "16px",
            zIndex: 9999,
            width: "calc(100vw - 32px)",
            maxWidth: "380px",
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 18px 40px rgba(15,23,42,0.16)",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "14px 18px",
              borderLeft: `4px solid ${
                showToast.type === "success" ? "#16a34a" :
                showToast.type === "error"   ? "#dc2626" :
                showToast.type === "warning" ? "#f59e0b" : "#2563eb"
              }`,
              display: "flex",
              flexDirection: "column",
              gap: "2px",
            }}
          >
            <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>{showToast.title}</div>
            <div style={{ fontSize: "14px", color: "#475569" }}>{showToast.message}</div>
          </div>
        </div>
      )}

      {/* Success modal */}
      <div className="modal fade" id="successModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius: "24px" }}>
            <div className="modal-body text-center p-4 p-md-5">
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  margin: "0 auto 18px",
                  borderRadius: "999px",
                  display: "grid",
                  placeItems: "center",
                  background: "#dcfce7",
                  color: "#16a34a",
                  fontSize: "32px",
                }}
              >
                <i className="bi bi-check2" />
              </div>
              <h3 style={{ fontWeight: 800, color: "#0f172a", marginBottom: "10px" }}>Payment Successful</h3>
              <p style={{ color: "#64748b", marginBottom: "20px" }}>
                Thank you for your order. Your print request has been received.
              </p>
              <button
                type="button"
                data-bs-dismiss="modal"
                style={{
                  borderRadius: "14px",
                  padding: "12px 28px",
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  color: "#fff",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "15px",
                  cursor: "pointer",
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

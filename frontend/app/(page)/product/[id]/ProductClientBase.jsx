"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "../../../assest/style/ProductClient.module.css";
import RazorpayPayment from "../../../Components/payment/Razorpay";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";


const WALL_MOCKUP =
  "https://res.cloudinary.com/dsprfys3x/image/upload/v1777275393/ChatGPT_Image_Apr_27__2026__12_58_10_PM_guqrsv.png";

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
  const [uploadedImages, setUploadedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageStates, setImageStates] = useState([]); // [{zoom, offset}] per image
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isImageDragging, setIsImageDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isPaymentReady, setIsPaymentReady] = useState(false);
  const [mailPreviewImages, setMailPreviewImages] = useState([]);
  const [showToast, setShowToast] = useState({
    visible: false,
    type: "",
    title: "",
    message: "",
  });

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const frameRef = useRef(null); // ref to the rendered front-face div for offset scaling

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

  // Derived values for the active image — keeps all existing rendering code unchanged
  const uploadedImage = uploadedImages[currentImageIndex] ?? null;
  const zoom = imageStates[currentImageIndex]?.zoom ?? 1;
  const imageOffset = imageStates[currentImageIndex]?.offset ?? { x: 0, y: 0 };

  const currentImageIndexRef = useRef(currentImageIndex);
  useEffect(() => { currentImageIndexRef.current = currentImageIndex; }, [currentImageIndex]);

  const setZoom = (val) => {
    setImageStates((prev) => {
      const updated = [...prev];
      const cur = updated[currentImageIndexRef.current] ?? { zoom: 1, offset: { x: 0, y: 0 } };
      updated[currentImageIndexRef.current] = { ...cur, zoom: typeof val === "function" ? val(cur.zoom) : val };
      return updated;
    });
  };

  const setImageOffset = (val) => {
    setImageStates((prev) => {
      const updated = [...prev];
      const cur = updated[currentImageIndexRef.current] ?? { zoom: 1, offset: { x: 0, y: 0 } };
      updated[currentImageIndexRef.current] = { ...cur, offset: typeof val === "function" ? val(cur.offset) : val };
      return updated;
    });
  };

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
    };
  }, [uploadedImage, currentImageIndex]);

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

  const generateMailPreviewImageFor = async (imgSrc, imgZoom, imgOffset) => {
    try {
      if (!imgSrc) return "";
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imgSrc;
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
      const finalScale = baseScale * imgZoom;
      const drawWidth  = img.width  * finalScale;
      const drawHeight = img.height * finalScale;
      // Scale offset from CSS pixels to canvas pixels using the actual rendered frame size.
      // The live preview frame is percentage-based so its CSS size may differ from dims.
      const cssFrameW = frameRef.current?.clientWidth  || dims.width;
      const cssFrameH = frameRef.current?.clientHeight || dims.height;
      const scaleX = frameW / cssFrameW;
      const scaleY = frameH / cssFrameH;
      const dx = fx + (frameW - drawWidth)  / 2 + imgOffset.x * scaleX;
      const dy = fy + (frameH - drawHeight) / 2 + imgOffset.y * scaleY;

      ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
      ctx.restore();

      return canvas.toDataURL("image/png");
    } catch (err) {
      console.error("Preview capture failed:", err);
      return "";
    }
  };

  const generateMailPreviewImage = () =>
    generateMailPreviewImageFor(uploadedImage, zoom, imageOffset);

  const generateAllMailPreviewImages = () =>
    Promise.all(
      uploadedImages.map((src, i) =>
        generateMailPreviewImageFor(
          src,
          imageStates[i]?.zoom ?? 1,
          imageStates[i]?.offset ?? { x: 0, y: 0 }
        )
      )
    );

  const processFile = (file) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setUploadedImages((prev) => {
        const newImages = [...prev, dataUrl];
        const newIndex = newImages.length - 1;
        setImageStates((prevStates) => {
          const updated = [...prevStates];
          updated[newIndex] = { zoom: 1, offset: { x: 0, y: 0 } };
          return updated;
        });
        setCurrentImageIndex(newIndex);
        return newImages;
      });
      setIsProcessing(false);
      setIsPaymentReady(false);
      showNotification("Image added!", "success");
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
    const files = Array.from(e.dataTransfer.files || []);
    if (!files.length) return;
    let hasInvalid = false;
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) { hasInvalid = true; return; }
      if (file.size > 10 * 1024 * 1024) { showNotification(`${file.name} exceeds 10MB limit`, "error"); return; }
      processFile(file);
    });
    if (hasInvalid) showNotification("Only image files are supported", "error");
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) { showNotification(`${file.name} exceeds 10MB limit`, "error"); return; }
      if (!file.type.startsWith("image/")) { showNotification("Please upload an image file", "error"); return; }
      processFile(file);
    });
    e.target.value = "";
  };

  const handleZoomIn  = () => { setZoom((p) => Math.min(p + 0.1, 3)); setIsPaymentReady(false); };
  const handleZoomOut = () => { setZoom((p) => Math.max(p - 0.1, 1)); setIsPaymentReady(false); };

  const handleRemoveImage = (indexToRemove) => {
    const idx = indexToRemove ?? currentImageIndex;
    setUploadedImages((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      const newIndex = Math.max(0, Math.min(currentImageIndexRef.current, updated.length - 1));
      setCurrentImageIndex(updated.length === 0 ? 0 : newIndex);
      if (updated.length === 0) {
        setCurrentStep(1);
        setIsPaymentReady(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
      return updated;
    });
    setImageStates((prev) => prev.filter((_, i) => i !== idx));
    setMailPreviewImages((prev) => prev.filter((_, i) => i !== idx));
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
    setMailPreviewImages([previewBase64]);
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
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    borderRadius: "24px",
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
    const [widthInch, heightInch] = size.split("x").map(Number);
    const isLandscape = widthInch > heightInch;
    const depth = thickness === "3mm" ? 3 : thickness === "5mm" ? 4 : 5;
    const shapeRadius = circleClip ? "50%" : frameRadius;
    const depthBg =
      thickness === "3mm"
        ? "linear-gradient(145deg, #d9d9d9, #8f8f8f)"
        : thickness === "5mm"
        ? "linear-gradient(145deg, #cfcfcf, #8f8f8f)"
        : "linear-gradient(145deg, #bdbdbd, #8f8f8f)";
let maxWidth = 42;
let maxHeight = 52;

// landscape
if (widthInch > heightInch) {
  maxWidth = 40;
  maxHeight = 48;
}

// portrait
if (heightInch > widthInch) {
  maxWidth = 38;
  maxHeight = 52;
}

// square
if (productOrientation === "square") {
  maxWidth = 38;
  maxHeight = 38;
}

// circle
if (productOrientation === "circle") {
  maxWidth = 36;
  maxHeight = 36;
}

// heart
if (productOrientation === "heart") {
  maxWidth = 34;
  maxHeight = 34;
}

const widthScale = maxWidth / widthInch;
const heightScale = maxHeight / heightInch;
const scale = Math.min(widthScale, heightScale);

const frameWidthPercent = widthInch * scale * 0.72;
const frameHeightPercent = heightInch * scale * 0.72;
    return (
      <div
        className={styles.previewBox}
        style={{
          background: useWall
            ? `url('${WALL_MOCKUP}') center/cover no-repeat`
            : "linear-gradient(160deg, #eef2f7 0%, #dde4ee 100%)",
        }}
      >
        {useWall && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              pointerEvents: "none",
              background: "radial-gradient(ellipse at 50% 30%, transparent 45%, rgba(0,0,0,0.18) 100%)",
            }}
          />
        )}

        {/* frame */}
        <div
  style={{
    position: "absolute",
    top: "5%",
    left: "50%",
    transform: "translateX(-50%)",
    width: `${frameWidthPercent}%`,
    height: `${frameHeightPercent}%`,
    overflow: "visible",
    zIndex: 2,
  }}
>
          {/* depth shadow */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: `translate(${depth}px, ${depth}px)`,
              borderRadius: shapeRadius,
              background: depthBg,
              boxShadow: "0 18px 35px rgba(0,0,0,0.22)",
              zIndex: 1,
            }}
          />

          {/* front face */}
          <div
            ref={frameRef}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: shapeRadius,
              background: "#ffffff",
              boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
              overflow: "hidden",
              zIndex: 2,
              cursor: uploadedImage ? (isImageDragging ? "grabbing" : "grab") : "default",
              touchAction: "none",
            }}
            onMouseDown={uploadedImage ? handleImageMouseDown : undefined}
            onTouchStart={uploadedImage ? handleImageTouchStart : undefined}
            onTouchMove={uploadedImage ? handleImageTouchMove : undefined}
            onTouchEnd={uploadedImage ? handleImageTouchEnd : undefined}
            onTouchCancel={uploadedImage ? handleImageTouchEnd : undefined}
          >
            {uploadedImage ? (
              <img
                src={uploadedImage}
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
            ) : (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
                  color: "#94a3b8",
                  gap: "8px",
                }}
              >
                <i className="bi bi-image" style={{ fontSize: "clamp(24px, 5vw, 36px)" }} />
                <span style={{ fontSize: "clamp(10px, 2vw, 13px)", fontWeight: 500 }}>
                  Upload to preview
                </span>
              </div>
            )}
          </div>
        </div>

        {/* size/thickness pill labels */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: "12px",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            justifyContent: "center",
            padding: "0 16px",
            width: "100%",
            zIndex: 3,
          }}
        >
          <span
            style={{
              background: "rgba(255,255,255,0.96)",
              padding: "6px 14px",
              borderRadius: "999px",
              fontWeight: 500,
              fontSize: "12px",
              color: "#0f172a",
              border: "1px solid #e2e8f0",
            }}
          >
            {size} • {(widthInch * 2.54).toFixed(2)} × {(heightInch * 2.54).toFixed(2)} cm
          </span>
          <span
            style={{
              background: "rgba(255,255,255,0.96)",
              padding: "6px 14px",
              borderRadius: "999px",
              fontWeight: 500,
              fontSize: "12px",
              color: "#0f172a",
              border: "1px solid #e2e8f0",
            }}
          >
            {thickness}
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
                src="https://res.cloudinary.com/dsprfys3x/image/upload/v1777025061/Size_Compare.jpg_3_gkld8u.jpg"
                alt="guide"
                className="img-fluid"
              />
            </div>
            <div className={`${styles.uploadCard} mt-4`}>
              <img
                src="https://res.cloudinary.com/dsprfys3x/image/upload/v1776521152/Acrylic_Thickness.jpg_oi0ftp.jpg"
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
                src="https://res.cloudinary.com/dsprfys3x/image/upload/q_auto/f_auto/v1776521173/Quality.jpg_zmvtat.jpg"
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

    const thicknessInfo = {
      "3mm": { label: "3mm", desc: "Slim",     icon: "bi-layers",      color: "#10b981" },
      "5mm": { label: "5mm", desc: "Standard", icon: "bi-layers-fill", color: "#2563eb" },
      "8mm": { label: "8mm", desc: "Premium",  icon: "bi-stack",       color: "#7c3aed" },
    };

    const sectionHeader = (icon, title, subtitle) => (
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "12px",
          background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: "18px", flexShrink: 0,
        }}>
          <i className={`bi ${icon}`} />
        </div>
        <div>
          <div style={{ fontSize: "clamp(14px,3vw,17px)", fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>{title}</div>
          {subtitle && <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{subtitle}</div>}
        </div>
      </div>
    );

    const fieldStyle = {
      borderRadius: "10px", border: "1.5px solid #e2e8f0",
      padding: "11px 14px", fontSize: "clamp(13px,2.5vw,14px)",
      background: "#fff", boxShadow: "none", transition: "border-color 0.2s", width: "100%",
    };

    return (
      <div
        className={styles.stepContainer}
        style={{ background: "linear-gradient(180deg, #f0f7ff 0%, #f8fafc 50%, #f1f5f9 100%)", paddingBottom: "48px" }}
      >
        <div className="container-fluid" style={{ maxWidth: "1400px" }}>
          <div className="row g-3 align-items-start">

            {/* Left: sticky live preview */}
            <div className={`col-12 col-lg-4 ${styles.step2PreviewCol}`}>
              <div style={{ ...sectionCardStyle, padding: "clamp(10px,2.5vw,20px)", maxWidth: "460px", marginLeft: "auto", marginRight: "auto" }}>
                {sectionHeader("bi-display", "Live Preview", "Drag · zoom to adjust")}
                {renderBetterPreview(true)}
                {renderEditorControls()}
                <div className={styles.mobileTotalBar}>
  <span>Total</span>
  <strong>₹{calculatePrice()}</strong>
</div>
              </div>
            </div>

            {/* Right: all controls stacked */}
            <div className="col-12 col-lg-8">
              <div className="d-flex flex-column gap-3">

                {/* Customise Options */}
                <div style={sectionCardStyle}>
                  {sectionHeader("bi-sliders", "Customise Your Print", "Choose size, thickness and quantity")}

                  {/* Size */}
                  <div style={{ marginBottom: "24px" }}>
                    <label style={{ ...labelStyle, marginBottom: "10px" }}>
                      <i className="bi bi-aspect-ratio me-1" style={{ color: "#d62839" }} />Size (inches)
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {sizeOptions.map((opt) => {
                        const active = size === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => { setSize(opt); setIsPaymentReady(false); }}
                            style={{
                              padding: "8px 16px", borderRadius: "10px",
                              border: active ? "2px solid #2563eb" : "1.5px solid #e2e8f0",
                              background: active ? "#2563eb" : "#f8fafc",
                              color: active ? "#fff" : "#334155",
                              fontWeight: active ? 700 : 500, fontSize: "clamp(12px,2.5vw,13px)",
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
                          <button
                            key={opt}
                            type="button"
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
                      <button
                        type="button"
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
                      <button
                        type="button"
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

                {/* Dark Order Summary */}
                <div style={{
                  ...sectionCardStyle,
                  background: "linear-gradient(145deg, #0f172a 0%, #1e293b 100%)",
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
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {[
                      { icon: "bi-hash",     label: "Order ID",  value: orderId },
                      { icon: "bi-rulers",   label: "Size",      value: size },
                      { icon: "bi-layers",   label: "Thickness", value: thickness },
                      { icon: "bi-bag",      label: "Quantity",  value: quantity },
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
                      background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                    }}>
                      <span style={{ color: "#bfdbfe", fontWeight: 600, fontSize: "13px" }}>Total Amount</span>
                      <span style={{ color: "#fff", fontWeight: 900, fontSize: "22px" }}>₹{totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Contact & Delivery */}
                <div style={sectionCardStyle}>
                  {sectionHeader("bi-truck", "Contact & Delivery", "We'll use this to ship your order")}
                  <form onSubmit={handleSubmitOrder}>
                    <div className="row g-3">
                      <div className="col-12">
                        <label style={labelStyle}><i className="bi bi-person me-1" style={{ color: "#2563eb" }} />Full Name</label>
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange}
                          className="form-control" placeholder="Enter your full name" style={fieldStyle} />
                        {renderFieldError("fullName")}
                      </div>
                      <div className="col-12">
                        <label style={labelStyle}><i className="bi bi-envelope me-1" style={{ color: "#2563eb" }} />Email Address</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                          className="form-control" placeholder="Enter your email" style={fieldStyle} />
                        {renderFieldError("email")}
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}><i className="bi bi-telephone me-1" style={{ color: "#2563eb" }} />Phone</label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleInputChange}
                          className="form-control" placeholder="10-digit phone" style={fieldStyle} />
                        {renderFieldError("phone")}
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}><i className="bi bi-telephone-plus me-1" style={{ color: "#94a3b8" }} />Alt. Phone</label>
                        <input type="text" name="alternatePhone" value={formData.alternatePhone} onChange={handleInputChange}
                          className="form-control" placeholder="Optional" style={fieldStyle} />
                        {renderFieldError("alternatePhone")}
                      </div>
                      <div className="col-12">
                        <label style={labelStyle}><i className="bi bi-geo-alt me-1" style={{ color: "#2563eb" }} />Address</label>
                        <textarea name="address" value={formData.address} onChange={handleInputChange}
                          className="form-control" placeholder="Enter your full address"
                          style={{ ...fieldStyle, minHeight: "90px", resize: "vertical" }} />
                        {renderFieldError("address")}
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}><i className="bi bi-building me-1" style={{ color: "#2563eb" }} />City</label>
                        <input type="text" name="city" value={formData.city} onChange={handleInputChange}
                          className="form-control" placeholder="City" style={fieldStyle} />
                        {renderFieldError("city")}
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}><i className="bi bi-map me-1" style={{ color: "#2563eb" }} />State</label>
                        <input type="text" name="state" value={formData.state} onChange={handleInputChange}
                          className="form-control" placeholder="State" style={fieldStyle} />
                        {renderFieldError("state")}
                      </div>
                      <div className="col-12">
                        <label style={labelStyle}><i className="bi bi-mailbox me-1" style={{ color: "#2563eb" }} />Pincode</label>
                        <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange}
                          className="form-control" placeholder="6-digit pincode" style={fieldStyle} />
                        {renderFieldError("pincode")}
                      </div>
                      <div className="col-12 mt-2">
                        {!isPaymentReady ? (
                          <button
                            type="button"
                            onClick={validateBeforePayment}
                            style={{
                              width: "100%", padding: "14px", borderRadius: "14px", border: "none",
                              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
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
                            previewImages={mailPreviewImages}
                            uploadedImages={uploadedImages}
                            customerDetails={{
                              ...formData,
                              name: formData.fullName,
                              orderId,
                              productType: productOrientation,
                              productName: `Custom Acrylic Print (${productOrientation} ${size})`,
                              orientation: productOrientation,
                              size, thickness, quantity,
                              amount: totalAmount,
                              imageZoom: zoom,
                              imageOffsetX: imageOffset.x,
                              imageOffsetY: imageOffset.y,
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

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "../../../assest/style/ProductClient.module.css";
import RazorpayPayment from "../../../Components/payment/Razorpay";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function ProductClient() {
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

  const [orientation, setOrientation] = useState("portrait");

  const [size, setSize] = useState("16x20");
  const [thickness, setThickness] = useState("3mm");
  const [customSize, setCustomSize] = useState({ width: "", height: "" });
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
    alternateAddress: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "razorpay",
  });

  const [formErrors, setFormErrors] = useState({});

  const sizeOptions = {
    portrait:  ["8x10", "11x14", "16x20", "20x24", "24x36", "custom"],
    landscape: ["10x8", "14x11", "20x16", "24x20", "36x24", "custom"],
    circle:    ["6x6", "8x8", "10x10", "12x12", "14x14", "custom"],
    square:    ["6x6", "8x8", "10x10", "12x12", "14x14", "custom"],
  };

  const thicknessOptions = ["3mm", "5mm", "8mm"];

  const frameDimensions = {
    "8x10":  { width: 80,  height: 100 },
    "11x14": { width: 110, height: 140 },
    "16x20": { width: 160, height: 200 },
    "20x24": { width: 200, height: 240 },
    "24x36": { width: 240, height: 360 },
    "10x8":  { width: 100, height: 80  },
    "14x11": { width: 140, height: 110 },
    "20x16": { width: 200, height: 160 },
    "24x20": { width: 240, height: 200 },
    "36x24": { width: 360, height: 240 },
    "6x6":   { width: 60,  height: 60  },
    "8x8":   { width: 80,  height: 80  },
    "10x10": { width: 100, height: 100 },
    "12x12": { width: 120, height: 120 },
    "14x14": { width: 140, height: 140 },
  };

  const basePrice = 1;

  const roomWallBackground =
    "https://res.cloudinary.com/dsprfys3x/image/upload/v1773634493/Gemini_Generated_Image_g2ds8ig2ds8ig2ds_puojbl.png";

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js")
      .then(() => console.log("Bootstrap JS loaded"))
      .catch((err) => console.error("Failed to load Bootstrap JS:", err));
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
            fullName:
              prev.fullName ||
              `${user.first_name || ""} ${user.last_name || ""}`.trim(),
            email: prev.email || user.email || "",
            phone: prev.phone || user.phone || "",
          }));
        } catch (_) {}
      }
    }
  }, []);

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

  useEffect(() => {
    if (orientation === "portrait") setSize("16x20");
    else if (orientation === "landscape") setSize("10x8");
    else setSize("10x10"); // circle / square
    setCustomSize({ width: "", height: "" });
    setZoom(1);
    setImageOffset({ x: 0, y: 0 });
    setIsPaymentReady(false);
  }, [orientation]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isImageDragging) return;
      setImageOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    };

    const handleTouchMove = (e) => {
      if (!isImageDragging || !e.touches?.length) return;
      const touch = e.touches[0];
      setImageOffset({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
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
  }, [isImageDragging, dragStart]);

  const showNotification = (message, type = "info", title = "") => {
    let notificationTitle = title;

    if (!title) {
      switch (type) {
        case "success":
          notificationTitle = "Success";
          break;
        case "error":
          notificationTitle = "Error";
          break;
        case "warning":
          notificationTitle = "Warning";
          break;
        default:
          notificationTitle = "Info";
      }
    }

    setShowToast({
      visible: true,
      type,
      title: notificationTitle,
      message,
    });

    setTimeout(() => {
      setShowToast({
        visible: false,
        type: "",
        title: "",
        message: "",
      });
    }, 3000);
  };

  const openSuccessModal = () => {
    if (typeof window !== "undefined" && window.bootstrap) {
      const modalEl = document.getElementById("successModal");
      if (modalEl) {
        const modal = new window.bootstrap.Modal(modalEl);
        modal.show();
      }
    }
  };

  const calculatePrice = useCallback(() => {
    let price = basePrice;

    if (size === "custom") {
      const w = parseFloat(customSize.width) || 0;
      const h = parseFloat(customSize.height) || 0;
      price += Math.max(0, Math.floor((w * h) / 10) * 50);
    } else {
      const opts = sizeOptions[orientation] || sizeOptions.portrait;
      const sizeIndex = opts.indexOf(size);
      if (sizeIndex > 0) price += sizeIndex * 150;
    }

    if (thickness === "5mm") price += 150;
    if (thickness === "8mm") price += 300;

    return price * quantity;
  }, [orientation, size, customSize, thickness, quantity]);

  const generateMailPreviewImage = async () => {
    try {
      if (!uploadedImage) return "";

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = uploadedImage;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const dims = size === "custom"
        ? { width: (parseFloat(customSize.width) || 10) * 10, height: (parseFloat(customSize.height) || 10) * 10 }
        : frameDimensions[size] || { width: 200, height: 250 };
      const S = 8; // export scale: 8× on-screen CSS pixels → high-res

      const frameW  = dims.width  * S;
      const frameH  = dims.height * S;
      const depthPx = (thickness === "3mm" ? 4 : thickness === "5mm" ? 5 : 7) * S;
      const PAD     = 5 * S;

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

      const fx = PAD;
      const fy = PAD;

      // 1. Depth / thickness layer — same gradient as live preview, offset bottom-right
      ctx.save();
      ctx.beginPath();
      if (orientation === "circle") {
        ctx.ellipse(fx + depthPx + frameW / 2, fy + depthPx + frameH / 2, frameW / 2, frameH / 2, 0, 0, Math.PI * 2);
      } else {
        ctx.rect(fx + depthPx, fy + depthPx, frameW, frameH);
      }
      const depthGrad = ctx.createLinearGradient(
        fx + depthPx, fy + depthPx,
        fx + depthPx + frameW, fy + depthPx + frameH
      );
      depthGrad.addColorStop(0, thickness === "3mm" ? "#d9d9d9" : thickness === "5mm" ? "#cfcfcf" : "#bdbdbd");
      depthGrad.addColorStop(1, "#8f8f8f");
      ctx.fillStyle     = depthGrad;
      ctx.shadowColor   = "rgba(0,0,0,0.22)";
      ctx.shadowBlur    = 18;
      ctx.shadowOffsetY = 18;
      ctx.fill();
      ctx.restore();

      // 2. White front face with a soft drop-shadow
      ctx.save();
      ctx.beginPath();
      if (orientation === "circle") {
        ctx.ellipse(fx + frameW / 2, fy + frameH / 2, frameW / 2, frameH / 2, 0, 0, Math.PI * 2);
      } else {
        ctx.rect(fx, fy, frameW, frameH);
      }
      ctx.fillStyle     = "#ffffff";
      ctx.shadowColor   = "rgba(0,0,0,0.16)";
      ctx.shadowBlur    = 24;
      ctx.shadowOffsetY = 10;
      ctx.fill();
      ctx.restore();

      // 3. User's image clipped to frame
      ctx.save();
      ctx.beginPath();
      if (orientation === "circle") {
        ctx.ellipse(fx + frameW / 2, fy + frameH / 2, frameW / 2, frameH / 2, 0, 0, Math.PI * 2);
      } else {
        ctx.rect(fx, fy, frameW, frameH);
      }
      ctx.clip();

      // objectFit: cover — same as the CSS in the live preview
      const baseScale  = Math.max(frameW / img.width, frameH / img.height);
      const finalScale = baseScale * zoom;
      const drawWidth  = img.width  * finalScale;
      const drawHeight = img.height * finalScale;
      const dx = fx + (frameW - drawWidth)  / 2 + imageOffset.x * S;
      const dy = fy + (frameH - drawHeight) / 2 + imageOffset.y * S;

      ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
      ctx.restore();

      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Preview capture failed:", error);
      return "";
    }
  };

  const processFile = (file) => {
    setIsProcessing(true);

    const reader = new FileReader();

    reader.onload = (event) => {
      setUploadedImage(event.target.result);
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

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];

    if (file && file.type.startsWith("image/")) {
      if (file.size > 10 * 1024 * 1024) {
        showNotification("File size must be less than 50MB", "error");
        return;
      }
      processFile(file);
    } else {
      showNotification("Please upload an image file", "error");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showNotification("File size must be less than 50MB", "error");
        return;
      }

      if (!file.type.startsWith("image/")) {
        showNotification("Please upload an image file", "error");
        return;
      }

      processFile(file);
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3));
    setIsPaymentReady(false);
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 1));
    setIsPaymentReady(false);
  };

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
    setDragStart({
      x: e.clientX - imageOffset.x,
      y: e.clientY - imageOffset.y,
    });
  };

  const handleImageTouchStart = (e) => {
    if (!uploadedImage || !e.touches?.length) return;
    const touch = e.touches[0];
    setIsImageDragging(true);
    setDragStart({
      x: touch.clientX - imageOffset.x,
      y: touch.clientY - imageOffset.y,
    });
  };

  const handleImageTouchMove = (e) => {
    if (!isImageDragging || !e.touches?.length) return;
    e.preventDefault();
    const touch = e.touches[0];
    setImageOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleImageTouchEnd = () => {
    setIsImageDragging(false);
  };

  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setPincode(value);
    setDeliveryStatus({ message: "", type: "", isChecking: false });
  };

  const handleCheckDelivery = async () => {
    if (pincode.length !== 6) {
      showNotification("Please enter a valid 6-digit pincode", "warning");
      return;
    }

    setDeliveryStatus({ message: "", type: "", isChecking: true });

    setTimeout(() => {
      const serviceable = [
        "110001",
        "400001",
        "700001",
        "560001",
        "600001",
      ].includes(pincode);

      if (serviceable) {
        setDeliveryStatus({
          type: "success",
          message: "Delivery available to this pincode.",
          isChecking: false,
        });
        setEstimatedDeliveryDate("3-5 business days");
        showNotification("We deliver to this location", "success");
      } else {
        setDeliveryStatus({
          type: "error",
          message: "Sorry, we do not deliver to this pincode yet.",
          isChecking: false,
        });
        setEstimatedDeliveryDate("");
        showNotification("We don't deliver to this location yet", "error");
      }
    }, 1000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let sanitizedValue = value;

    if (name === "phone" || name === "alternatePhone") {
      sanitizedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    if (name === "pincode") {
      sanitizedValue = value.replace(/\D/g, "").slice(0, 6);
    }

    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name !== "paymentMethod") {
      setIsPaymentReady(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) errors.fullName = "Full name is required";

    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone)) {
      errors.phone = "Phone must be 10 digits";
    }

    if (
      formData.alternatePhone.trim() &&
      !/^\d{10}$/.test(formData.alternatePhone)
    ) {
      errors.alternatePhone = "Alternate phone must be 10 digits";
    }

    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.state.trim()) errors.state = "State is required";

    if (!formData.pincode.trim()) errors.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(formData.pincode)) {
      errors.pincode = "Pincode must be 6 digits";
    }

    return errors;
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
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    await validateBeforePayment();
  };

  const handlePaymentSuccess = (paymentData) => {
    // Save order to localStorage so it appears in order history
    if (typeof window !== "undefined") {
      const existing = localStorage.getItem("mareprints_orders");
      const orders = existing ? JSON.parse(existing) : [];
      const newOrder = {
        id: Date.now(),
        order: orderId,
        date: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        status: "Confirmed",
        productName: "Custom Acrylic Print",
        size,
        thickness,
        quantity,
        amount: calculatePrice(),
        payment_id: paymentData?.razorpay_payment_id || "",
      };
      orders.unshift(newOrder);
      localStorage.setItem("mareprints_orders", JSON.stringify(orders));
    }
    showNotification("Payment successful! Thank you for your order.", "success");
    openSuccessModal();
    setIsPaymentReady(false);
  };

  const handlePaymentError = () => {
    showNotification("Payment failed. Please try again.", "error");
  };

  const goToStep = (step) => {
    if (step === 2 && !uploadedImage) {
      showNotification("Please upload an image first", "warning");
      return;
    }
    if (step === 2) {
      const isLoggedIn =
        typeof window !== "undefined" &&
        localStorage.getItem("isLoggedIn") === "true";
      if (!isLoggedIn) {
        showNotification("Please log in to continue", "warning");
        router.push("/login");
        return;
      }
    }
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const inputStyle = {
    borderRadius: "0px",
    minHeight: "10px",
    border: "1px solid #dbe3ee",
    background: "#ffffff",
    boxShadow: "none",
    padding: "12px 14px",
    fontSize: "15px",
  };

  const labelStyle = {
    fontSize: "12px",
    fontWeight: 700,
    color: "#334155",
    marginBottom: "8px",
    display: "block",
  };

  const sectionCardStyle = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
  };

  const renderFieldError = (field) =>
    formErrors[field] ? (
      <div
        style={{
          marginTop: "6px",
          fontSize: "13px",
          color: "#dc2626",
          fontWeight: 600,
        }}
      >
        {formErrors[field]}
      </div>
    ) : null;

  const renderStepIndicator = () => (
    <div className={styles.stepIndicator}>
      <div className="container">
        <div className={styles.stepWrapper}>
          {[1, 2].map((step) => (
            <div key={step} className={styles.stepItem}>
              <button
                className={`${styles.stepButton} ${
                  currentStep === step ? styles.active : ""
                } ${currentStep > step ? styles.completed : ""}`}
                onClick={() => goToStep(step)}
                disabled={step > 1 && !uploadedImage}
                type="button"
              >
                <span className={styles.stepNumber}>
                  {currentStep > step ? <i className="bi bi-check-lg"></i> : step}
                </span>
                <span className={styles.stepLabel}>
                  {step === 1 ? "Upload" : "Customize & Payment"}
                </span>
              </button>

              {step < 2 && (
                <div
                  className={`${styles.stepConnector} ${
                    currentStep > step ? styles.completed : ""
                  }`}
                />
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
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "8px",
              border: "1px solid #dbe3ee",
              fontSize: "13px",
            }}
          >
            <i className="bi bi-dash-lg"></i>
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
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "8px",
              border: "1px solid #dbe3ee",
               fontSize: "13px",
            }}
          >
            <i className="bi bi-plus-lg"></i>
          </button>
        </div>

        <button
          type="button"
          className="btn btn-outline-dark"
          onClick={() => {
            setZoom(1);
            setImageOffset({ x: 0, y: 0 });
            setIsPaymentReady(false);
          }}
          style={{
            borderRadius: "12px",
            padding: "8px 14px",
             fontSize: "13px",
          }}
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
          onChange={(e) => {
            setZoom(Number(e.target.value));
            setIsPaymentReady(false);
          }}
          style={{
            width: "100%",
            cursor: "pointer",
            accentColor: "#0f172a",
          }}
        />
      </div>
    </div>
  );

  const renderBetterPreview = (useWall = false) => {
    const isCircle = orientation === "circle";
    const shapeRadius = isCircle ? "50%" : "0px";
    let dims;
    let widthInch, heightInch;
    if (size === "custom") {
      widthInch  = parseFloat(customSize.width)  || 10;
      heightInch = parseFloat(customSize.height) || 10;
      dims = { width: widthInch * 10, height: heightInch * 10 };
    } else {
      dims = frameDimensions[size] || { width: 220, height: 280 };
      [widthInch, heightInch] = size.split("x").map(Number);
    }
const depth = thickness === "3mm" ? 4 : thickness === "5mm" ? 5 : 7;  
  const borderSize =
      thickness === "3mm" ? "8px" : thickness === "5mm" ? "12px" : "16px";
const getShadowByThickness = () => {
  if (thickness === "3mm") {
    return "0 10px 20px rgba(0,0,0,0.4)";
  }
  if (thickness === "5mm") {
    return "0 20px 40px rgba(0,0,0,0.3)";
  }
  if (thickness === "8mm") {
    return "0 35px 70px rgba(0,0,0,0.4)";
  }
};
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          minHeight: "550px",
          borderRadius: "28px",
          overflow: "hidden",
          background: useWall
            ? "#f8fafc"
            : "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          backgroundImage: useWall
            ? "url(https://res.cloudinary.com/dsprfys3x/image/upload/v1773637296/wmremove-transformed_f1xtnt.jpg)"
            : undefined,
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
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0.10), rgba(15,23,42,0.06))",
              pointerEvents: "none",
            }}
          />
        )}

        <div
          style={{
            position: "absolute",
            inset: "24px",
            borderRadius: "24px",
            border: "1px solid rgba(255,255,255,0.55)",
            pointerEvents: "none",
          }}
        />
<div
  style={{
    position: "absolute",
    left: "50%",
    top: "50%",
    width: `${dims.width}px`,
    height: `${dims.height}px`,
    transform: "translate(-50%, -50%)",
    borderRadius: shapeRadius,
    overflow: "visible",
    background: "transparent",
    maxWidth: "88%",
    maxHeight: "82%",
  }}
>
  {/* Back depth layer */}
  <div
    style={{
      position: "absolute",
      top: `${depth}px`,
      left: `${depth}px`,
      right: `-${depth}px`,
      bottom: `-${depth}px`,
      borderRadius: shapeRadius,
      background:
        thickness === "3mm"
          ? "linear-gradient(145deg, #d9d9d9,  #8f8f8f)"
          : thickness === "5mm"
          ? "linear-gradient(145deg, #cfcfcf, #8f8f8f)"
          : "linear-gradient(145deg, #bdbdbd,  #8f8f8f)",
      boxShadow: "0 18px 35px rgba(0,0,0,0.22)",
      zIndex: 1,
    }}
  />

  {/* Front frame */}
  <div
    style={{
      position: "absolute",
      inset: 0,
      borderRadius: shapeRadius,
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
    cursor: uploadedImage
      ? isImageDragging
        ? "grabbing"
        : "grab"
      : "default",
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
  src={uploadedImage}
  alt="Frame preview"
  draggable={false}
  style={{
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transform: `translate(calc(-50% + ${imageOffset.x}px), calc(-50% + ${imageOffset.y}px)) scale(${zoom})`,
    transformOrigin: "center center",
    transition: isImageDragging ? "none" : "transform 0.18s ease",
    userSelect: "none",
    touchAction: "none",
    pointerEvents: "none",
  }}
/>

      {uploadedImage && (
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            //background: "rgba(15,23,42,0.72)",
            color: "#fff",
            padding: "7px 12px",
            borderRadius: "999px",
            fontSize: "11px",
            fontWeight: 500,
            pointerEvents: "none",
          }}
        >
          {/* Drag to adjust */}
        </div>
      )}
    </div>
  </div>
</div>

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
            {size === "custom"
              ? `${customSize.width || "?"}×${customSize.height || "?"} in`
              : `${size} • ${(widthInch * 2.54).toFixed(1)} × ${(heightInch * 2.54).toFixed(1)} cm`}
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
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          transform: "scale(0.62)",
          transformOrigin: "top center",
          marginBottom: "-180px",
        }}
      >
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
                className={`${styles.uploadZone} ${
                  isDragging ? styles.dragging : ""
                }`}
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
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.uploadPrompt}>
                    <div className={styles.uploadIcon}>
                      <i
                        className={`bi ${
                          isDragging
                            ? "bi-file-earmark-arrow-up"
                            : "bi-cloud-upload"
                        }`}
                      ></i>
                    </div>

                    <h3 className={styles.uploadTitle}>
                      {isDragging ? "Drop your image here" : "Upload your image"}
                    </h3>

                    <p className={styles.uploadSubtitle}>
                      {isDragging
                        ? "Release to upload"
                        : "Drag & drop or click to browse"}
                    </p>

                    <button
                      className={styles.browseButton}
                      onClick={() => fileInputRef.current?.click()}
                      type="button"
                    >
                      <i className="bi bi-folder2-open me-2"></i>
                      Browse Files
                    </button>

                    <p className={styles.uploadHint}>
                      Supported formats: JPG, PNG, GIF (Max 50MB)
                    </p>

                    {isProcessing && (
                      <p style={{ marginTop: "10px", fontWeight: 600 }}>
                        Processing image...
                      </p>
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
                <i className="bi bi-info-circle me-2"></i>
                Print Quality Guide
              </h4>

              <img
                src="https://res.cloudinary.com/dsprfys3x/image/upload/v1773825342/Gemini_Generated_Image_g2ds8ig2ds8ig2ds_u7pv7w.png"
                alt="Print quality guide"
                className={styles.guideImage}
              />

              <ul className={styles.guideList}>
                <li>
                  <i className="bi bi-check-circle-fill"></i>
                  Upload high-resolution images
                </li>
                <li>
                  <i className="bi bi-check-circle-fill"></i>
                  Ensure image is sharp and clear
                </li>
                <li>
                  <i className="bi bi-check-circle-fill"></i>
                  Avoid screenshots or low-quality images
                </li>
                <li className={styles.warning}>
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  Poor quality images affect final print
                </li>
              </ul>

              <button
                className={styles.nextButton}
                onClick={() => goToStep(2)}
                disabled={!uploadedImage}
                type="button"
              >
                Continue to Customize & Payment
                <i className="bi bi-arrow-right ms-2"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => {
    const totalAmount = calculatePrice();

    const shapeOptions = [
      { value: "portrait",  label: "Portrait",  icon: "bi-phone" },
      { value: "landscape", label: "Landscape", icon: "bi-tablet-landscape" },
      { value: "circle",    label: "Circle",    icon: "bi-circle" },
      { value: "square",    label: "Square",    icon: "bi-square" },
    ];

    const thicknessInfo = {
      "3mm": { label: "3mm",  desc: "Slim",    icon: "bi-layers",     color: "#10b981" },
      "5mm": { label: "5mm",  desc: "Standard",icon: "bi-layers-fill",color: "#2563eb" },
      "8mm": { label: "8mm",  desc: "Premium", icon: "bi-stack",      color: "#7c3aed" },
    };

    const sectionHeader = (icon, title, subtitle) => (
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "12px",
          background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: "18px", flexShrink: 0,
        }}>
          <i className={`bi ${icon}`}></i>
        </div>
        <div>
          <div style={{ fontSize: "clamp(14px,3vw,17px)", fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>{title}</div>
          {subtitle && <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{subtitle}</div>}
        </div>
      </div>
    );

    const fieldInput = (type, name, value, placeholder, extraStyle = {}) => (
      <input
        type={type}
        name={name}
        value={value}
        onChange={handleInputChange}
        className="form-control"
        placeholder={placeholder}
        style={{
          borderRadius: "10px",
          border: "1.5px solid #e2e8f0",
          padding: "11px 14px",
          fontSize: "clamp(13px,2.5vw,14px)",
          background: "#fff",
          boxShadow: "none",
          transition: "border-color 0.2s",
          ...extraStyle,
        }}
      />
    );

    return (
      <div
        className={styles.stepContainer}
        style={{
          background: "linear-gradient(180deg, #f0f7ff 0%, #f8fafc 50%, #f1f5f9 100%)",
          paddingBottom: "48px",
        }}
      >
        <div className="container">
          <div className="row g-4 align-items-start">

            {/* ── LEFT COLUMN ── */}
            <div className="col-12 col-xl-8">

              {/* Live Preview card */}
              <div style={{ ...sectionCardStyle, marginBottom: "20px" }}>
                {sectionHeader("bi-display", "Live Preview", "Drag to reposition · pinch or slider to zoom")}
                {renderBetterPreview(true)}
                {renderEditorControls()}
              </div>

              {/* Customise Options card */}
              <div style={{ ...sectionCardStyle }}>
                {sectionHeader("bi-sliders", "Customise Your Print", "Choose shape, size, thickness and quantity")}

                {/* Shape selector */}
                <div style={{ marginBottom: "24px" }}>
                  <label style={{ ...labelStyle, marginBottom: "10px" }}>
                    <i className="bi bi-grid-3x3-gap me-1" style={{ color: "#2563eb" }}></i>Shape
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {shapeOptions.map((s) => {
                      const active = orientation === s.value;
                      return (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => { setOrientation(s.value); setIsPaymentReady(false); }}
                          style={{
                            display: "flex", alignItems: "center", gap: "7px",
                            padding: "9px 18px",
                            borderRadius: "999px",
                            border: active ? "2px solid #2563eb" : "1.5px solid #e2e8f0",
                            background: active ? "linear-gradient(135deg,#eff6ff,#dbeafe)" : "#f8fafc",
                            color: active ? "#1d4ed8" : "#475569",
                            fontWeight: active ? 700 : 500,
                            fontSize: "clamp(12px,2.5vw,14px)",
                            cursor: "pointer",
                            transition: "all 0.18s",
                            boxShadow: active ? "0 0 0 3px rgba(37,99,235,0.12)" : "none",
                          }}
                        >
                          <i className={`bi ${s.icon}`} style={{ fontSize: "15px" }}></i>
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Size selector */}
                <div style={{ marginBottom: "24px" }}>
                  <label style={{ ...labelStyle, marginBottom: "10px" }}>
                    <i className="bi bi-aspect-ratio me-1" style={{ color: "#2563eb" }}></i>Size (inches)
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {(sizeOptions[orientation] || sizeOptions.portrait).map((opt) => {
                      const active = size === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => { setSize(opt); setIsPaymentReady(false); }}
                          style={{
                            padding: "8px 16px",
                            borderRadius: "10px",
                            border: active ? "2px solid #2563eb" : "1.5px solid #e2e8f0",
                            background: active ? "#2563eb" : "#f8fafc",
                            color: active ? "#fff" : "#334155",
                            fontWeight: active ? 700 : 500,
                            fontSize: "clamp(12px,2.5vw,13px)",
                            cursor: "pointer",
                            transition: "all 0.18s",
                            boxShadow: active ? "0 4px 12px rgba(37,99,235,0.25)" : "none",
                          }}
                        >
                          {opt === "custom" ? <><i className="bi bi-pencil-square me-1"></i>Custom</> : opt}
                        </button>
                      );
                    })}
                  </div>

                  {size === "custom" && (
                    <div
                      style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        marginTop: "14px",
                        padding: "14px 16px",
                        background: "#eff6ff",
                        border: "1.5px solid #bfdbfe",
                        borderRadius: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      <i className="bi bi-rulers" style={{ color: "#2563eb", fontSize: "16px" }}></i>
                      <input
                        type="number" min="1" max="60"
                        placeholder="Width"
                        value={customSize.width}
                        onChange={(e) => { setCustomSize((p) => ({ ...p, width: e.target.value })); setIsPaymentReady(false); }}
                        style={{ width: "80px", padding: "8px 10px", borderRadius: "8px", border: "1.5px solid #bfdbfe", fontSize: "13px", textAlign: "center" }}
                      />
                      <span style={{ fontWeight: 700, color: "#2563eb", fontSize: "16px" }}>×</span>
                      <input
                        type="number" min="1" max="60"
                        placeholder="Height"
                        value={customSize.height}
                        onChange={(e) => { setCustomSize((p) => ({ ...p, height: e.target.value })); setIsPaymentReady(false); }}
                        style={{ width: "80px", padding: "8px 10px", borderRadius: "8px", border: "1.5px solid #bfdbfe", fontSize: "13px", textAlign: "center" }}
                      />
                      <span style={{ fontSize: "12px", color: "#2563eb", fontWeight: 600 }}>inches</span>
                    </div>
                  )}
                </div>

                {/* Thickness selector */}
                <div style={{ marginBottom: "24px" }}>
                  <label style={{ ...labelStyle, marginBottom: "10px" }}>
                    <i className="bi bi-layers me-1" style={{ color: "#2563eb" }}></i>Thickness
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
                            flex: "1 1 90px",
                            padding: "12px 10px",
                            borderRadius: "14px",
                            border: active ? `2px solid ${info.color}` : "1.5px solid #e2e8f0",
                            background: active ? `${info.color}14` : "#f8fafc",
                            color: active ? info.color : "#475569",
                            fontWeight: active ? 700 : 500,
                            fontSize: "13px",
                            cursor: "pointer",
                            transition: "all 0.18s",
                            textAlign: "center",
                            boxShadow: active ? `0 0 0 3px ${info.color}22` : "none",
                          }}
                        >
                          <i className={`bi ${info.icon}`} style={{ fontSize: "18px", display: "block", marginBottom: "4px" }}></i>
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
                    <i className="bi bi-hash me-1" style={{ color: "#2563eb" }}></i>Quantity
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", maxWidth: "200px" }}>
                    <button
                      type="button"
                      onClick={() => { setQuantity((p) => Math.max(1, p - 1)); setIsPaymentReady(false); }}
                      style={{
                        width: "42px", height: "42px", borderRadius: "12px",
                        border: "1.5px solid #dbe3ee", background: "#fff",
                        fontWeight: 700, fontSize: "18px", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#334155",
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
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#334155",
                      }}
                    >+</button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="col-12 col-xl-4">
              <div className="d-flex flex-column gap-4">

                {/* Order Summary card */}
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
                      <i className="bi bi-receipt"></i>
                    </div>
                    <span style={{ fontSize: "16px", fontWeight: 800, color: "#fff" }}>Order Summary</span>
                  </div>

                  {renderSummaryPreview()}

                  <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    {[
                      { icon: "bi-hash",             label: "Order ID",    value: orderId },
                      { icon: "bi-aspect-ratio",     label: "Shape",       value: orientation.charAt(0).toUpperCase() + orientation.slice(1) },
                      { icon: "bi-rulers",           label: "Size",        value: size === "custom" ? `${customSize.width||"?"}×${customSize.height||"?"} in` : size },
                      { icon: "bi-layers",           label: "Thickness",   value: thickness },
                      { icon: "bi-bag",              label: "Quantity",    value: quantity },
                    ].map(({ icon, label, value }) => (
                      <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "7px", color: "#94a3b8", fontSize: "13px" }}>
                          <i className={`bi ${icon}`}></i>{label}
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

                {/* Contact & Delivery card */}
                <div style={sectionCardStyle}>
                  {sectionHeader("bi-truck", "Contact & Delivery", "We'll use this to ship your order")}

                  <form onSubmit={handleSubmitOrder}>
                    <div className="row g-3">
                      <div className="col-12">
                        <label style={labelStyle}><i className="bi bi-person me-1" style={{ color: "#2563eb" }}></i>Full Name</label>
                        {fieldInput("text", "fullName", formData.fullName, "Enter your full name")}
                        {renderFieldError("fullName")}
                      </div>

                      <div className="col-12">
                        <label style={labelStyle}><i className="bi bi-envelope me-1" style={{ color: "#2563eb" }}></i>Email Address</label>
                        {fieldInput("email", "email", formData.email, "Enter your email")}
                        {renderFieldError("email")}
                      </div>

                      <div className="col-md-6">
                        <label style={labelStyle}><i className="bi bi-telephone me-1" style={{ color: "#2563eb" }}></i>Phone</label>
                        {fieldInput("text", "phone", formData.phone, "10-digit phone")}
                        {renderFieldError("phone")}
                      </div>

                      <div className="col-md-6">
                        <label style={labelStyle}><i className="bi bi-telephone-plus me-1" style={{ color: "#94a3b8" }}></i>Alt. Phone</label>
                        {fieldInput("text", "alternatePhone", formData.alternatePhone, "Optional")}
                        {renderFieldError("alternatePhone")}
                      </div>

                      <div className="col-12">
                        <label style={labelStyle}><i className="bi bi-geo-alt me-1" style={{ color: "#2563eb" }}></i>Address</label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="form-control"
                          placeholder="Enter your full address"
                          style={{
                            borderRadius: "10px", border: "1.5px solid #e2e8f0",
                            padding: "11px 14px", fontSize: "clamp(13px,2.5vw,14px)",
                            minHeight: "90px", boxShadow: "none", resize: "vertical",
                          }}
                        />
                        {renderFieldError("address")}
                      </div>

                      <div className="col-md-6">
                        <label style={labelStyle}><i className="bi bi-building me-1" style={{ color: "#2563eb" }}></i>City</label>
                        {fieldInput("text", "city", formData.city, "City")}
                        {renderFieldError("city")}
                      </div>

                      <div className="col-md-6">
                        <label style={labelStyle}><i className="bi bi-map me-1" style={{ color: "#2563eb" }}></i>State</label>
                        {fieldInput("text", "state", formData.state, "State")}
                        {renderFieldError("state")}
                      </div>

                      <div className="col-12">
                        <label style={labelStyle}><i className="bi bi-mailbox me-1" style={{ color: "#2563eb" }}></i>Pincode</label>
                        {fieldInput("text", "pincode", formData.pincode, "6-digit pincode")}
                        {renderFieldError("pincode")}
                      </div>

                      <div className="col-12 mt-2">
                        {!isPaymentReady ? (
                          <button
                            type="button"
                            onClick={validateBeforePayment}
                            style={{
                              width: "100%", padding: "14px",
                              borderRadius: "14px", border: "none",
                              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                              color: "#fff", fontWeight: 700,
                              fontSize: "clamp(14px,3vw,16px)",
                              cursor: "pointer",
                              boxShadow: "0 8px 20px rgba(37,99,235,0.3)",
                              display: "flex", alignItems: "center",
                              justifyContent: "center", gap: "8px",
                              transition: "opacity 0.2s",
                            }}
                          >
                            <i className="bi bi-shield-check"></i>
                            Verify Details
                          </button>
                        ) : (
                          <RazorpayPayment
                            amount={calculatePrice()}
                            buttonText={`Pay Now ₹${calculatePrice()}`}
                            themeColor="#2563eb"
                            previewImage={mailPreviewImage}
                            customerDetails={{
                              orderId,
                              productType: orientation,
                              productName: `Custom Acrylic Print (${orientation} ${size})`,
                              name: formData.fullName,
                              fullName: formData.fullName,
                              email: formData.email,
                              phone: formData.phone,
                              alternatePhone: formData.alternatePhone,
                              address: formData.address,
                              alternateAddress: formData.alternateAddress,
                              city: formData.city,
                              state: formData.state,
                              pincode: formData.pincode,
                              orientation,
                              size,
                              thickness,
                              quantity,
                              amount: calculatePrice(),
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

  return (
    <>
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {showToast.visible && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 9999,
            minWidth: "280px",
            maxWidth: "360px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderLeft: `4px solid ${
              showToast.type === "success"
                ? "#16a34a"
                : showToast.type === "error"
                ? "#dc2626"
                : showToast.type === "warning"
                ? "#f59e0b"
                : "#2563eb"
            }`,
            borderRadius: "16px",
            boxShadow: "0 20px 40px rgba(15,23,42,0.12)",
            padding: "14px 16px",
          }}
        >
          <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>
            {showToast.title}
          </div>
          <div style={{ color: "#475569", fontSize: "14px" }}>
            {showToast.message}
          </div>
        </div>
      )}

      {renderStepIndicator()}

      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}

      <div
        className="modal fade"
        id="successModal"
        tabIndex="-1"
        aria-labelledby="successModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 rounded-4 shadow">
            <div className="modal-body text-center p-4">
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: "72px",
                  height: "72px",
                  background: "rgba(25, 135, 84, 0.12)",
                  color: "#198754",
                  fontSize: "32px",
                }}
              >
                <i className="bi bi-check2-circle"></i>
              </div>

              <h4 id="successModalLabel" className="fw-bold mb-2">
                Payment Successful
              </h4>
              <p className="text-muted mb-4">
                Thank you for your order. Your payment was completed successfully.
              </p>

              <div className="bg-light rounded-4 p-3 text-start mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>Order ID</span>
                  <span>{orderId}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Amount Paid</span>
                  <span>₹{calculatePrice()}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Email</span>
                  <span>{formData.email || "-"}</span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-dark px-4 py-2 rounded-3"
                data-bs-dismiss="modal"
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
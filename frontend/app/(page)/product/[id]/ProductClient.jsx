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
    portrait: ["8x10", "11x14", "16x20", "20x24", "24x36"],
    landscape: ["10x8", "14x11", "20x16", "24x20", "36x24"],
  };

  const thicknessOptions = ["3mm", "5mm", "8mm"];

  const frameDimensions = {
    "8x10": { width: 80, height: 100 },
    "11x14": { width: 110, height: 140 },
    "16x20": { width: 160, height: 200 },
    "20x24": { width: 200, height: 240 },
    "24x36": { width: 240, height: 360 },
    "10x8": { width: 100, height: 80 },
    "14x11": { width: 140, height: 110 },
    "20x16": { width: 200, height: 160 },
    "24x20": { width: 240, height: 200 },
    "36x24": { width: 360, height: 240 },
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
    setSize(orientation === "portrait" ? "20x24" : "10x8");
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

    const sizeIndex =
      orientation === "portrait"
        ? sizeOptions.portrait.indexOf(size)
        : sizeOptions.landscape.indexOf(size);

    if (sizeIndex > 0) price += sizeIndex * 150;
    if (thickness === "5mm") price += 150;
    if (thickness === "8mm") price += 300;

    return price * quantity;
  }, [orientation, size, thickness, quantity]);

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

      const dims = frameDimensions[size] || { width: 200, height: 250 };
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
      ctx.rect(fx + depthPx, fy + depthPx, frameW, frameH);
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
      ctx.rect(fx, fy, frameW, frameH);
      ctx.fillStyle     = "#ffffff";
      ctx.shadowColor   = "rgba(0,0,0,0.16)";
      ctx.shadowBlur    = 24;
      ctx.shadowOffsetY = 10;
      ctx.fill();
      ctx.restore();

      // 3. User's image clipped to frame (rectangular)
      ctx.save();
      ctx.beginPath();
      ctx.rect(fx, fy, frameW, frameH);
      ctx.clip();

      // objectFit: contain — same as the CSS in the live preview
      const baseScale  = Math.min(frameW / img.width, frameH / img.height);
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
    const dims = frameDimensions[size] || { width: 220, height: 280 };
    const [widthInch, heightInch] = size.split("x").map(Number);
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
    top: "45%",
    width: `${dims.width}px`,
    height: `${dims.height}px`,
    transform: "translate(-50%, -50%)",
    borderRadius: "0px",
    overflow: "visible",
    background: "transparent",
    maxWidth: "92%",
    maxHeight: "78%",
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
      borderRadius: "0px",
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
      borderRadius: "0px",
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
  src={uploadedImage || roomWallBackground}
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
            {size} • {(widthInch * 2.54).toFixed(2)} x{" "}
            {(heightInch * 2.54).toFixed(2)} cm
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

    return (
      <div
        className={styles.stepContainer}
        style={{
          background:
            "linear-gradient(180deg, #ffffff 0%, #f8fafc 55%, #f1f5f9 100%)",
          paddingBottom: "42px",
        }}
      >
        <div className="container">
          <div className="row g-4 align-items-start">
            <div className="col-12 col-xl-8">
              <div style={sectionCardStyle}>
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                  <div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: 800,
                        color: "#0f172a",
                        lineHeight: 1.2,
                      }}
                    >
                      Live Preview
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#64748b",
                        marginTop: "3px",
                      }}
                    >
                      Adjust your image, choose size, and review the final look.
                    </div>
                  </div>
                </div>

                {renderBetterPreview(true)}
                {renderEditorControls()}

                <div className="row g-3 mt-1">
                  <div className="col-md-4">
                    <label style={labelStyle}>Orientation</label>
                   <select
  value={orientation}
  onChange={(e) => {setOrientation(e.target.value)
setIsPaymentReady(false);}}
  style={{
    width: "200px",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    appearance: "none",

    backgroundImage:
      "url('data:image/svg+xml;utf8,<svg fill=\"black\" height=\"20\" viewBox=\"0 0 24 24\" width=\"20\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/></svg>')",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center"
  }}
>
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label style={labelStyle}>Size</label>
                    <select
  value={size}
  onChange={(e) => { setSize(e.target.value); setIsPaymentReady(false); }}
  style={{
    width: "200px",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    appearance: "none",

    backgroundImage:
      "url('data:image/svg+xml;utf8,<svg fill=\"black\" height=\"20\" viewBox=\"0 0 24 24\" width=\"20\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/></svg>')",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center"
  }}
>
                      {sizeOptions[orientation].map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label style={labelStyle}>Thickness</label>
                    <select
  value={thickness}
  onChange={(e) => { setThickness(e.target.value); setIsPaymentReady(false); }}
  style={{
    width: "200px",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    appearance: "none",

    backgroundImage:
      "url('data:image/svg+xml;utf8,<svg fill=\"black\" height=\"20\" viewBox=\"0 0 24 24\" width=\"20\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/></svg>')",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center"
  }}
>
                      {thicknessOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label style={labelStyle}>Quantity</label>
                    <div className="d-flex align-items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-light"
                        onClick={() => {
                          setQuantity((prev) => Math.max(1, prev - 1));
                          setIsPaymentReady(false);
                        }}
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "10px",
                          border: "1px solid #dbe3ee",
                          fontWeight: 500,
                        }}
                      >
                        -
                      </button>

                      <div
                        style={{
                          flex: 1,
                          height: "40px",
                          borderRadius: "12px",
                          border: "1px solid #dbe3ee",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 500,
                          background: "#fff",
                        }}
                      >
                        {quantity}
                      </div>

                      <button
                        type="button"
                        className="btn btn-light"
                        onClick={() => {
                          setQuantity((prev) => prev + 1);
                          setIsPaymentReady(false);
                        }}
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "12px",
                          border: "1px solid #dbe3ee",
                          fontWeight: 500,
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                 </div>
              </div>
            </div>
          
            <div className="col-12 col-xl-4">
               <div style={sectionCardStyle}>
                  <h4
                    style={{
                      fontSize: "22px",
                      fontWeight: 500,
                      color: "#0f172a",
                      marginBottom: "18px",
                    }}
                  >
                    Order Summary
                  </h4>

                  {renderSummaryPreview()}

                  <div className="mt-3 d-flex flex-column gap-2">
                    <div className="d-flex justify-content-between">
                      <span style={{ color: "#64748b" }}>Order ID</span>
                      <span style={{ fontWeight: 700 }}>{orderId}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span style={{ color: "#64748b" }}>Orientation</span>
                      <span style={{ fontWeight: 700, textTransform: "capitalize" }}>
                        {orientation}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span style={{ color: "#64748b" }}>Size</span>
                      <span style={{ fontWeight: 700 }}>{size}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span style={{ color: "#64748b" }}>Thickness</span>
                      <span style={{ fontWeight: 700 }}>{thickness}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span style={{ color: "#64748b" }}>Quantity</span>
                      <span style={{ fontWeight: 700 }}>{quantity}</span>
                    </div>
                    <hr style={{ margin: "8px 0", opacity: 0.12 }} />
                    <div className="d-flex justify-content-between align-items-center">
                      <span
                        style={{
                          fontSize: "15px",
                          color: "#0f172a",
                          fontWeight: 700,
                        }}
                      >
                        Total Amount
                      </span>
                      <span
                        style={{
                          fontSize: "24px",
                          color: "#0f172a",
                          fontWeight: 800,
                        }}
                      >
                        ₹{totalAmount}
                      </span>
                    </div>
                  </div>
                </div>
              <div className="d-flex flex-column gap-4">
                <div style={sectionCardStyle}>
                  <h4
                    style={{
                      fontSize: "22px",
                      fontWeight: 800,
                      color: "#0f172a",
                      marginBottom: "18px",
                    }}
                  >
                   Contact & Delivery Details
                  </h4>

                  <form onSubmit={handleSubmitOrder}>
                    <div className="row g-3">
                      <div className="col-12">
                        <label style={labelStyle}>Full Name</label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="form-control"
                          style={inputStyle}
                          placeholder="Enter your full name"
                        />
                        {renderFieldError("fullName")}
                      </div>

                      <div className="col-12">
                        <label style={labelStyle}>Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="form-control"
                          style={inputStyle}
                          placeholder="Enter your email"
                        />
                        {renderFieldError("email")}
                      </div>

                      <div className="col-md-6">
                        <label style={labelStyle}>Phone Number</label>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="form-control"
                          style={inputStyle}
                          placeholder="10-digit phone"
                        />
                        {renderFieldError("phone")}
                      </div>

                      <div className="col-md-6">
                        <label style={labelStyle}>Alternate Phone</label>
                        <input
                          type="text"
                          name="alternatePhone"
                          value={formData.alternatePhone}
                          onChange={handleInputChange}
                          className="form-control"
                          style={inputStyle}
                          placeholder="Optional"
                        />
                        {renderFieldError("alternatePhone")}
                      </div>

                      <div className="col-12">
                        <label style={labelStyle}>Address</label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="form-control"
                          style={{ ...inputStyle, minHeight: "94px" }}
                          placeholder="Enter your address"
                        />
                        {renderFieldError("address")}
                      </div>

                      {/* <div className="col-12">
                        <label style={labelStyle}>Alternate Address</label>
                        <textarea
                          name="alternateAddress"
                          value={formData.alternateAddress}
                          onChange={handleInputChange}
                          className="form-control"
                          style={{ ...inputStyle, minHeight: "84px" }}
                          placeholder="Optional"
                        />
                      </div> */}

                      <div className="col-md-6">
                        <label style={labelStyle}>City</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="form-control"
                          style={inputStyle}
                          placeholder="City"
                        />
                        {renderFieldError("city")}
                      </div>

                      <div className="col-md-6">
                        <label style={labelStyle}>State</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="form-control"
                          style={inputStyle}
                          placeholder="State"
                        />
                        {renderFieldError("state")}
                      </div>

                      <div className="col-12">
                        <label style={labelStyle}>Pincode</label>
                        <input
                          type="text"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          className="form-control"
                          style={inputStyle}
                          placeholder="6-digit pincode"
                        />
                        {renderFieldError("pincode")}
                      </div>
<div className="mt-4">
  {!isPaymentReady ? (
    <button
      type="button"
      className="btn btn-primary w-100"
      onClick={validateBeforePayment}
    >
      Verify Details
    </button>
  ) : (
    <RazorpayPayment
      amount={calculatePrice()}
      buttonText={`Pay Now ₹${calculatePrice()}`}
      themeColor="#3496cb"
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
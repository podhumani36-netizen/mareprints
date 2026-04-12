"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import styles from "../../../assest/style/ProductClient.module.css";
import RazorpayPayment from "../../../Components/payment/Razorpay";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function ProductClientRoundedRectPortrait() {
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

  const sizeOptions = ["8x10", "11x14", "16x20", "20x24", "24x36"];
  const thicknessOptions = ["3mm", "5mm", "8mm"];

  const frameDimensions = {
    "8x10": { width: 80, height: 100 },
    "11x14": { width: 110, height: 140 },
    "16x20": { width: 160, height: 200 },
    "20x24": { width: 200, height: 240 },
    "24x36": { width: 240, height: 360 },
  };

  const basePrice = 799;

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

    const sizeIndex = sizeOptions.indexOf(size);
    if (sizeIndex > 0) price += sizeIndex * 150;
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

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const exportWidth = 1600;
      const exportHeight = 2000;

      const canvas = document.createElement("canvas");
      canvas.width = exportWidth;
      canvas.height = exportHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) return "";

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, exportWidth, exportHeight);

      const baseScale = Math.max(
        exportWidth / img.width,
        exportHeight / img.height
      );

      const finalScale = baseScale * zoom;
      const drawWidth = img.width * finalScale;
      const drawHeight = img.height * finalScale;

      const previewDims = frameDimensions[size] || { width: 160, height: 200 };
      const offsetScaleX = exportWidth / previewDims.width;
      const offsetScaleY = exportHeight / previewDims.height;

      const dx = (exportWidth - drawWidth) / 2 + imageOffset.x * offsetScaleX;
      const dy = (exportHeight - drawHeight) / 2 + imageOffset.y * offsetScaleY;

      ctx.drawImage(img, dx, dy, drawWidth, drawHeight);

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
        showNotification("File size must be less than 10MB", "error");
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
        showNotification("File size must be less than 10MB", "error");
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

  const handlePaymentSuccess = () => {
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
          <option key={opt} value={opt}>
            {opt}
          </option>
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
    const dims = frameDimensions[size] || { width: 160, height: 200 };
    const [widthInch, heightInch] = size.split("x").map(Number);
    const depth = thickness === "3mm" ? 4 : thickness === "5mm" ? 5 : 7;

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
            borderRadius: "20px",
            overflow: "visible",
            background: "transparent",
            maxWidth: "92%",
            maxHeight: "78%",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: `${depth}px`,
              left: `${depth}px`,
              right: `-${depth}px`,
              bottom: `-${depth}px`,
              borderRadius: "20px",
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

          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "20px",
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
                      Supported formats: JPG, PNG, GIF (Max 10MB)
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
        }}
      >
        <div className="container">
          <div className="row g-4 align-items-start">
            <div className="col-lg-7">
              <div style={sectionCardStyle}>
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "28px",
                        fontWeight: 800,
                        color: "#0f172a",
                      }}
                    >
                      Live Preview
                    </h3>
                    <p
                      style={{
                        margin: "6px 0 0",
                        fontSize: "14px",
                        color: "#64748b",
                      }}
                    >
                      Adjust your image and review before payment
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline-dark"
                    onClick={() => goToStep(1)}
                    style={{ borderRadius: "12px" }}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back
                  </button>
                </div>

                {renderBetterPreview(true)}
                {renderEditorControls()}
                 <div style={{ ...sectionCardStyle, marginBottom: "20px" }}>
                {/* <h4
                  style={{
                    marginBottom: "18px",
                    fontWeight: 800,
                    color: "#0f172a",
                  }}
                >
                  Customize Your Print
                </h4> */}

                <div className="row g-3">
                  <div className="col-md-6">
                    <label style={labelStyle}>Size</label>
                    <SelectField
                      value={size}
                      onChange={(e) => {
                        setSize(e.target.value);
                        setIsPaymentReady(false);
                      }}
                      options={sizeOptions}
                    />
                  </div>

                  <div className="col-md-6">
                    <label style={labelStyle}>Thickness</label>
                    <SelectField
                      value={thickness}
                      onChange={(e) => {
                        setThickness(e.target.value);
                        setIsPaymentReady(false);
                      }}
                      options={thicknessOptions}
                    />
                  </div>

                  <div className="col-md-6">
                    <label style={labelStyle}>Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => {
                        const value = Math.max(1, Number(e.target.value) || 1);
                        setQuantity(value);
                        setIsPaymentReady(false);
                      }}
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
              {/* <div style={{ ...sectionCardStyle, marginBottom: "20px" }}> */}
                {/* <h4
                  style={{
                    marginBottom: "18px",
                    fontWeight: 800,
                    color: "#0f172a",
                  }}
                >
                  Customize Your Print
                </h4> */}
{/* 
                <div className="row g-3">
                  <div className="col-md-6">
                    <label style={labelStyle}>Size</label>
                    <SelectField
                      value={size}
                      onChange={(e) => {
                        setSize(e.target.value);
                        setIsPaymentReady(false);
                      }}
                      options={sizeOptions}
                    />
                  </div>

                  <div className="col-md-6">
                    <label style={labelStyle}>Thickness</label>
                    <SelectField
                      value={thickness}
                      onChange={(e) => {
                        setThickness(e.target.value);
                        setIsPaymentReady(false);
                      }}
                      options={thicknessOptions}
                    />
                  </div>

                  <div className="col-md-6">
                    <label style={labelStyle}>Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => {
                        const value = Math.max(1, Number(e.target.value) || 1);
                        setQuantity(value);
                        setIsPaymentReady(false);
                      }}
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
                </div> */}
              {/* </div> */}
            </div>

            <div className="col-lg-5">
           

              <form onSubmit={handleSubmitOrder}>
                  <div style={{ ...sectionCardStyle, marginBottom: "20px" }}>
                  <h4
                    style={{
                      marginBottom: "18px",
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    Order Summary
                  </h4>

                  {renderSummaryPreview()}

                  <div
                    style={{
                      display: "grid",
                      gap: "10px",
                      marginTop: "12px",
                      fontSize: "15px",
                      color: "#334155",
                    }}
                  >
                    <div className="d-flex justify-content-between">
                      <span>Size</span>
                      <strong>{size}</strong>
                    </div>

                    <div className="d-flex justify-content-between">
                      <span>Thickness</span>
                      <strong>{thickness}</strong>
                    </div>

                    <div className="d-flex justify-content-between">
                      <span>Quantity</span>
                      <strong>{quantity}</strong>
                    </div>

                    <div className="d-flex justify-content-between">
                      <span>Total Amount</span>
                      <strong>₹{totalAmount}</strong>
                    </div>
                  </div>
                </div>
                <div style={{ ...sectionCardStyle, marginBottom: "20px" }}>
                  
                  <h4
                    style={{
                      marginBottom: "18px",
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    Customer Details
                  </h4>

                  <div className="row g-3">
                    <div className="col-12">
                      <label style={labelStyle}>Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        style={{ ...inputStyle, width: "100%" }}
                      />
                      {renderFieldError("fullName")}
                    </div>

                    <div className="col-md-6">
                      <label style={labelStyle}>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        style={{ ...inputStyle, width: "100%" }}
                      />
                      {renderFieldError("email")}
                    </div>

                    <div className="col-md-6">
                      <label style={labelStyle}>Phone</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        style={{ ...inputStyle, width: "100%" }}
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
                        style={{ ...inputStyle, width: "100%" }}
                      />
                      {renderFieldError("alternatePhone")}
                    </div>

                    <div className="col-md-6">
                      <label style={labelStyle}>Pincode</label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        style={{ ...inputStyle, width: "100%" }}
                      />
                      {renderFieldError("pincode")}
                    </div>

                    <div className="col-12">
                      <label style={labelStyle}>Address</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        style={{ ...inputStyle, width: "100%", resize: "none" }}
                      />
                      {renderFieldError("address")}
                    </div>

                    {/* <div className="col-12">
                      <label style={labelStyle}>Alternate Address</label>
                      <textarea
                        name="alternateAddress"
                        value={formData.alternateAddress}
                        onChange={handleInputChange}
                        rows="2"
                        style={{ ...inputStyle, width: "100%", resize: "none" }}
                      />
                    </div> */}

                    <div className="col-md-6">
                      <label style={labelStyle}>City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        style={{ ...inputStyle, width: "100%" }}
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
                        style={{ ...inputStyle, width: "100%" }}
                      />
                      {renderFieldError("state")}
                    </div>
                  </div>
                </div>

              

                <div style={sectionCardStyle}>
                  {!isPaymentReady ? (
                    <button
                      type="submit"
                      className="btn btn-dark w-100"
                      style={{
                        borderRadius: "14px",
                        padding: "14px 18px",
                        fontWeight: 700,
                        fontSize: "16px",
                      }}
                    >
                      Verify Details & Pay Now
                    </button>
                  ) : (
                    <RazorpayPayment
                      amount={totalAmount}
                      customerDetails={formData}
                      previewImage={mailPreviewImage}
                      productDetails={{
                        orientation: "rounded_rect_portrait",
                        size,
                        thickness,
                        quantity,
                        orderId,
                        zoom,
                        imageOffset,
                      }}
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

  return (
    <>
      {renderStepIndicator()}
      {currentStep === 1 ? renderStep1() : renderStep2()}

      <canvas ref={canvasRef} className="d-none" />

      {showToast.visible && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 9999,
            minWidth: "280px",
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
              padding: "14px 16px",
              borderLeft: `4px solid ${
                showToast.type === "success"
                  ? "#16a34a"
                  : showToast.type === "error"
                  ? "#dc2626"
                  : showToast.type === "warning"
                  ? "#f59e0b"
                  : "#2563eb"
              }`,
            }}
          >
            <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>
              {showToast.title}
            </div>
            <div style={{ fontSize: "14px", color: "#475569" }}>
              {showToast.message}
            </div>
          </div>
        </div>
      )}

      <div
        className="modal fade"
        id="successModal"
        tabIndex="-1"
        aria-hidden="true"
      >
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
                <i className="bi bi-check2"></i>
              </div>

              <h3
                style={{
                  fontWeight: 800,
                  color: "#0f172a",
                  marginBottom: "10px",
                }}
              >
                Payment Successful
              </h3>

              <p style={{ color: "#64748b", marginBottom: "20px" }}>
                Thank you for your order. Your print request has been received.
              </p>

              <button
                type="button"
                className="btn btn-dark"
                data-bs-dismiss="modal"
                style={{ borderRadius: "14px", padding: "12px 24px" }}
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
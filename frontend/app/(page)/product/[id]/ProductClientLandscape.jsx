"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import styles from "../../../assest/style/ProductClient.module.css";
import GPayButton from "../../../Components/GPayButton";
import RazorpayPayment from "../../../Components/payment/Razorpay";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function ProductClientLandscape() {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTouchPoint, setLastTouchPoint] = useState({ x: 0, y: 0 });
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

  const [size, setSize] = useState("10x8");
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

  const sizeOptions = ["10x8", "14x11", "20x16", "24x20", "36x24"];
  const thicknessOptions = ["3mm", "5mm", "8mm"];

  const frameDimensions = {
    "10x8": { width: 100, height: 80 },
    "14x11": { width: 140, height: 110 },
    "20x16": { width: 200, height: 160 },
    "24x20": { width: 240, height: 200 },
    "36x24": { width: 360, height: 240 },
  };

  const basePrice = 899;

  const roomWallBackground =
    "https://res.cloudinary.com/dsprfys3x/image/upload/v1773634493/Gemini_Generated_Image_g2ds8ig2ds8ig2ds_puojbl.png";

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js")
      .then(() => console.log("Bootstrap JS loaded"))
      .catch((err) => console.error("Failed to load Bootstrap JS:", err));
  }, []);

  useEffect(() => {
    setOrderId(`#ORD${Math.floor(Math.random() * 100000)}`);
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
    };

    img.onerror = () => {
      showNotification("Failed to load image. Please try again.", "error");
    };
  }, [uploadedImage]);

  useEffect(() => {
    setZoom(1);
    setImageOffset({ x: 0, y: 0 });
  }, [size]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isImageDragging) return;

      setImageOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    };

    const handleMouseUp = () => {
      setIsImageDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isImageDragging, dragStart]);

  const isMobileView = () => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= 768;
  };

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
    if (sizeIndex > 0) price += sizeIndex * 180;
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

      const exportWidth = 2000;
      const exportHeight = 1600;

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

      const previewDims = frameDimensions[size] || { width: 200, height: 160 };

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
      setCurrentStep(1);
      setIsProcessing(false);
      setIsPaymentReady(false);
      setMailPreviewImage("");
      showNotification("Image uploaded successfully!", "success");
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

    const file = e.dataTransfer.files[0];

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
    const file = e.target.files[0];

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
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 1));
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setZoom(1);
    setImageOffset({ x: 0, y: 0 });
    setCurrentStep(1);
    setIsPaymentReady(false);
    setMailPreviewImage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    showNotification("Image removed successfully", "warning");
  };

  const handleImageMouseDown = (e) => {
    e.preventDefault();
    setIsImageDragging(true);
    setDragStart({
      x: e.clientX - imageOffset.x,
      y: e.clientY - imageOffset.y,
    });
  };

  const handleImageTouchStart = (e) => {
    if (!e.touches || !e.touches[0]) return;

    const touch = e.touches[0];
    setIsImageDragging(true);
    setLastTouchPoint({
      x: touch.clientX,
      y: touch.clientY,
    });
  };

  const handleImageTouchMove = (e) => {
    if (!isImageDragging || !e.touches || !e.touches[0]) return;

    e.preventDefault();

    const touch = e.touches[0];
    const deltaX = touch.clientX - lastTouchPoint.x;
    const deltaY = touch.clientY - lastTouchPoint.y;

    setImageOffset((prev) => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }));

    setLastTouchPoint({
      x: touch.clientX,
      y: touch.clientY,
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
      const servicable = [
        "110001",
        "400001",
        "700001",
        "560001",
        "600001",
      ].includes(pincode);

      if (servicable) {
        setDeliveryStatus({
          type: "success",
          message: "Delivery available to this pincode.",
          isChecking: false,
        });
        setEstimatedDeliveryDate("3-5 business days");
        showNotification("✓ We deliver to this location", "success");
      } else {
        setDeliveryStatus({
          type: "error",
          message: "Sorry, we do not deliver to this pincode yet.",
          isChecking: false,
        });
        setEstimatedDeliveryDate("");
        showNotification("✗ We don't deliver to this location yet", "error");
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
      return;
    }

    setFormErrors({});

    const previewBase64 = await generateMailPreviewImage();
    setMailPreviewImage(previewBase64);
    setIsPaymentReady(true);
    showNotification("Details verified. You can continue payment now.", "success");
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

    if (step === 3 && !uploadedImage) {
      showNotification("Please upload an image first", "warning");
      return;
    }

    setCurrentStep(step);
  };

  const getPreviewFramePx = () => {
    const isMobile = isMobileView();

    if (isMobile) {
      switch (size) {
        case "10x8":
          return { width: 260, height: 208 };
        case "14x11":
          return { width: 280, height: 220 };
        case "20x16":
          return { width: 300, height: 240 };
        case "24x20":
          return { width: 300, height: 250 };
        case "36x24":
          return { width: 300, height: 200 };
        default:
          return { width: 260, height: 208 };
      }
    }

    const dims = frameDimensions[size] || { width: 100, height: 80 };

    let scale = 2.2;
    if (size === "24x20") scale = 1.65;
    if (size === "36x24") scale = 1.1;

    return {
      width: dims.width * scale,
      height: dims.height * scale,
    };
  };

  const getSummaryFramePx = () => {
    const isMobile = isMobileView();

    if (isMobile) {
      switch (size) {
        case "10x8":
          return { width: 220, height: 176 };
        case "14x11":
          return { width: 230, height: 180 };
        case "20x16":
          return { width: 240, height: 192 };
        case "24x20":
          return { width: 240, height: 200 };
        case "36x24":
          return { width: 240, height: 160 };
        default:
          return { width: 220, height: 176 };
      }
    }

    switch (size) {
      case "10x8":
        return { width: 170, height: 136 };
      case "14x11":
        return { width: 190, height: 149 };
      case "20x16":
        return { width: 220, height: 176 };
      case "24x20":
        return { width: 230, height: 192 };
      case "36x24":
        return { width: 240, height: 160 };
      default:
        return { width: 170, height: 136 };
    }
  };

  const renderImagePreview = ({ showBackground = false, summary = false } = {}) => {
    const dims = summary ? getSummaryFramePx() : getPreviewFramePx();
    const isMobile = isMobileView();

    return (
      <div
        className={summary ? "" : styles.previewArea}
        style={{
          position: "relative",
          width: "100%",
          minHeight: summary ? "auto" : isMobile ? "320px" : "480px",
          borderRadius: "20px",
          overflow: "hidden",
          backgroundImage: showBackground ? `url(${roomWallBackground})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          boxShadow: showBackground ? "0 10px 30px rgba(0,0,0,0.08)" : "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: summary ? "0" : isMobile ? "14px" : "20px",
        }}
      >
        <div
          className={summary ? "" : styles.previewFrame}
          style={{
            width: "100%",
            maxWidth: `${dims.width}px`,
            height: `${dims.height}px`,
            border: `${thickness === "3mm" ? 6 : thickness === "5mm" ? 10 : 14}px solid #fff`,
            borderRadius: "8px",
            overflow: "hidden",
            background: "#fff",
            boxShadow: "0 18px 40px rgba(0,0,0,0.22), 0 4px 10px rgba(0,0,0,0.10)",
            position: "relative",
            margin: "0 auto",
            touchAction: summary ? "auto" : "none",
          }}
        >
          {uploadedImage ? (
            <img
              src={uploadedImage}
              alt="Frame preview"
              onMouseDown={!summary ? handleImageMouseDown : undefined}
              onTouchStart={!summary ? handleImageTouchStart : undefined}
              onTouchMove={!summary ? handleImageTouchMove : undefined}
              onTouchEnd={!summary ? handleImageTouchEnd : undefined}
              onTouchCancel={!summary ? handleImageTouchEnd : undefined}
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                transform: `translate(${imageOffset.x}px, ${imageOffset.y}px) scale(${zoom})`,
                transformOrigin: "center center",
                transition: isImageDragging ? "none" : "transform 0.18s ease",
                userSelect: "none",
                WebkitUserSelect: "none",
                WebkitTouchCallout: "none",
                cursor: summary ? "default" : isImageDragging ? "grabbing" : "grab",
                touchAction: "none",
              }}
            />
          ) : null}
        </div>
      </div>
    );
  };

  const renderStepIndicator = () => (
    <div className={styles.stepIndicator}>
      <div className="container">
        <div className={styles.stepWrapper}>
          {[1, 2, 3].map((step) => (
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
                  {step === 1 ? "Upload" : step === 2 ? "Customize" : "Payment"}
                </span>
              </button>

              {step < 3 && (
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
    <div className="mt-3">
      <div
        className="d-flex gap-2 flex-wrap align-items-center"
        style={{ justifyContent: "center" }}
      >
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={handleZoomOut}
        >
          <i className="bi bi-dash-lg"></i>
        </button>

        <div
          style={{
            minWidth: "70px",
            textAlign: "center",
            fontWeight: 700,
            fontSize: "15px",
          }}
        >
          {Math.round(zoom * 100)}%
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={handleZoomIn}
        >
          <i className="bi bi-plus-lg"></i>
        </button>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={() => {
            setZoom(1);
            setImageOffset({ x: 0, y: 0 });
          }}
        >
          Reset
        </button>
      </div>

      <div className="mt-3">
        <input
          type="range"
          min="1"
          max="3"
          step="0.05"
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          style={{ width: "100%", cursor: "pointer" }}
        />
      </div>

      <div
        className="small text-muted mt-2 text-center"
        style={{ lineHeight: "1.5" }}
      >
        Drag on desktop / touch and move on mobile
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className={styles.stepContainer}>
      <div className="container">
        <div className="row g-4">
          <div className="col-sm-12 col-md-8">
            <div className={styles.uploadCard}>
              <h4 className={styles.uploadTitle}>
                <i className="bi bi-cloud-upload me-2"></i>
                Upload Your Landscape Image
              </h4>

              <div
                ref={dropZoneRef}
                className={`${styles.uploadZone} ${isDragging ? styles.dragging : ""}`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {!uploadedImage ? (
                  <div className={styles.uploadPlaceholder}>
                    <div className={styles.uploadIcon}>
                      <i className="bi bi-image"></i>
                    </div>

                    <h5>Drag & drop your image here</h5>
                    <p>Upload a clear landscape image for best print quality</p>

                    <button
                      className={styles.browseButton}
                      onClick={() => fileInputRef.current?.click()}
                      type="button"
                    >
                      <i className="bi bi-folder2-open me-2"></i>
                      Browse Files
                    </button>

                    <p className={styles.uploadHint}>
                      Supported formats: JPG, PNG, WEBP (Max 50MB)
                    </p>

                    {isProcessing && (
                      <p style={{ marginTop: "10px", fontWeight: 600 }}>
                        Processing image...
                      </p>
                    )}
                  </div>
                ) : (
                  <div
                    className={styles.previewWrapper}
                    style={{
                      width: "100%",
                      overflow: "hidden",
                    }}
                  >
                    {renderImagePreview({ showBackground: false })}
                    {renderEditorControls()}

                    <div
                      className="d-flex gap-2 mt-3 flex-wrap"
                      style={{ justifyContent: "center" }}
                    >
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={handleRemoveImage}
                      >
                        Remove Image
                      </button>

                      {/* <button
                        className={styles.nextButton}
                        onClick={() => goToStep(2)}
                        type="button"
                      >
                        Continue to Customize
                        <i className="bi bi-arrow-right ms-2"></i>
                      </button> */}
                    </div>
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
                alt="Sample"
                className="img-fluid"
              />
            </div>
          </div>

          <div className="col-sm-12 col-md-4">
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
                  Use clear landscape photos
                </li>
                <li>
                  <i className="bi bi-check-circle-fill"></i>
                  Avoid blurry or cropped images
                </li>
                <li className={styles.warning}>
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  Poor quality image affects final print
                </li>
              </ul>

              <button
                className={styles.nextButton}
                onClick={() => goToStep(2)}
                disabled={!uploadedImage}
                type="button"
              >
                Continue to Customize
                <i className="bi bi-arrow-right ms-2"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className={styles.stepContainer}>
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-8">
            <div className={styles.previewCard}>
              <h4 className={styles.previewTitle}>
                <i className="bi bi-eye me-2"></i>
                Live Preview
              </h4>

              {renderImagePreview({ showBackground: true })}
              {renderEditorControls()}
            </div>
          </div>

          <div className="col-lg-4">
            <div className={styles.optionsCard}>
              <h4 className={styles.optionsTitle}>
                <i className="bi bi-sliders2 me-2"></i>
                Customize Your Print
              </h4>

              <div className={styles.optionGroup}>
                <label className={styles.optionLabel}>Size (inches)</label>
                <div className={styles.sizeGrid}>
                  {sizeOptions.map((opt) => (
                    <button
                      key={opt}
                      className={`${styles.sizeButton} ${size === opt ? styles.active : ""}`}
                      onClick={() => setSize(opt)}
                      type="button"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <small className="text-muted d-block mt-2">
                  {frameDimensions[size].width} × {frameDimensions[size].height} cm
                </small>
              </div>

              <div className={styles.optionGroup}>
                <label className={styles.optionLabel}>Thickness</label>
                <div className={styles.buttonGroup}>
                  {thicknessOptions.map((opt) => (
                    <button
                      key={opt}
                      className={`${styles.optionButton} ${thickness === opt ? styles.active : ""}`}
                      onClick={() => setThickness(opt)}
                      type="button"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.optionGroup}>
                <label className={styles.optionLabel}>Quantity</label>
                <select
                  className="form-select"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.priceBreakdown}>
                <div className={styles.priceRow}>
                  <span>Base Price</span>
                  <span>₹{basePrice}</span>
                </div>

                {size !== "10x8" && (
                  <div className={styles.priceRow}>
                    <span>Size Upgrade</span>
                    <span>+₹{sizeOptions.indexOf(size) * 180}</span>
                  </div>
                )}

                {thickness !== "3mm" && (
                  <div className={styles.priceRow}>
                    <span>Thickness Upgrade</span>
                    <span>+₹{thickness === "5mm" ? 150 : 300}</span>
                  </div>
                )}

                {quantity > 1 && (
                  <div className={styles.priceRow}>
                    <span>Quantity</span>
                    <span>x{quantity}</span>
                  </div>
                )}
              </div>

              <div className={styles.summaryTotal}>
                <span>Total Amount</span>
                <span>₹{calculatePrice()}</span>
              </div>

              <button
                className={styles.nextButton}
                onClick={() => goToStep(3)}
                type="button"
              >
                Continue to Payment
                <i className="bi bi-arrow-right ms-2"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const totalAmount = calculatePrice();

    return (
      <div className={styles.stepContainer}>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4 order-lg-2">
              <div className={styles.summaryCard}>
                <h4 className="mb-4">Order Summary</h4>

                <div className="text-center mb-4">
                  {renderImagePreview({ summary: true })}
                </div>

                <div className="bg-light rounded p-3 mt-3">
                  <div className="d-flex justify-content-between py-1">
                    <span>Order ID</span>
                    <span>{orderId}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1">
                    <span>Product</span>
                    <span>Landscape Print</span>
                  </div>
                  <div className="d-flex justify-content-between py-1">
                    <span>Selected Size</span>
                    <span>{size}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1">
                    <span>Frame Size</span>
                    <span>
                      {frameDimensions[size].width} × {frameDimensions[size].height} cm
                    </span>
                  </div>
                  <div className="d-flex justify-content-between py-1">
                    <span>Thickness</span>
                    <span>{thickness}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1">
                    <span>Quantity</span>
                    <span>{quantity}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1">
                    <span>Estimated Delivery</span>
                    <span>{estimatedDeliveryDate || "3-5 business days"}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between fw-bold fs-5">
                    <span>Total</span>
                    <span className="text-primary">₹{totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-8 order-lg-1">
              <div className={styles.formCard}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4>
                    <i className="bi bi-credit-card me-2"></i>
                    Shipping & Payment
                  </h4>

                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => goToStep(2)}
                    type="button"
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back
                  </button>
                </div>

                <form onSubmit={handleSubmitOrder}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        className={`form-control ${formErrors.fullName ? "is-invalid" : ""}`}
                        value={formData.fullName}
                        onChange={handleInputChange}
                      />
                      {formErrors.fullName && (
                        <div className="invalid-feedback">{formErrors.fullName}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        name="email"
                        className={`form-control ${formErrors.email ? "is-invalid" : ""}`}
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                      {formErrors.email && (
                        <div className="invalid-feedback">{formErrors.email}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Phone *</label>
                      <input
                        type="text"
                        name="phone"
                        className={`form-control ${formErrors.phone ? "is-invalid" : ""}`}
                        value={formData.phone}
                        onChange={handleInputChange}
                        maxLength={10}
                      />
                      {formErrors.phone && (
                        <div className="invalid-feedback">{formErrors.phone}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Alternate Phone</label>
                      <input
                        type="text"
                        name="alternatePhone"
                        className={`form-control ${formErrors.alternatePhone ? "is-invalid" : ""}`}
                        value={formData.alternatePhone}
                        onChange={handleInputChange}
                        maxLength={10}
                      />
                      {formErrors.alternatePhone && (
                        <div className="invalid-feedback">{formErrors.alternatePhone}</div>
                      )}
                    </div>

                    <div className="col-12">
                      <label className="form-label">Address *</label>
                      <textarea
                        name="address"
                        className={`form-control ${formErrors.address ? "is-invalid" : ""}`}
                        rows={3}
                        value={formData.address}
                        onChange={handleInputChange}
                      />
                      {formErrors.address && (
                        <div className="invalid-feedback">{formErrors.address}</div>
                      )}
                    </div>

                    <div className="col-12">
                      <label className="form-label">Alternate Address</label>
                      <textarea
                        name="alternateAddress"
                        className="form-control"
                        rows={2}
                        value={formData.alternateAddress}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">City *</label>
                      <input
                        type="text"
                        name="city"
                        className={`form-control ${formErrors.city ? "is-invalid" : ""}`}
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                      {formErrors.city && (
                        <div className="invalid-feedback">{formErrors.city}</div>
                      )}
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">State *</label>
                      <input
                        type="text"
                        name="state"
                        className={`form-control ${formErrors.state ? "is-invalid" : ""}`}
                        value={formData.state}
                        onChange={handleInputChange}
                      />
                      {formErrors.state && (
                        <div className="invalid-feedback">{formErrors.state}</div>
                      )}
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Pincode *</label>
                      <input
                        type="text"
                        name="pincode"
                        className={`form-control ${formErrors.pincode ? "is-invalid" : ""}`}
                        value={formData.pincode}
                        onChange={handleInputChange}
                        maxLength={6}
                      />
                      {formErrors.pincode && (
                        <div className="invalid-feedback">{formErrors.pincode}</div>
                      )}
                    </div>

                    <div className="col-12">
                      <div className={styles.formSection}>
                        <h5 className={styles.sectionTitle}>Payment Method</h5>

                        {/* <div className={styles.paymentOptions}>
                          <label className={styles.paymentOption}>
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="razorpay"
                              checked={formData.paymentMethod === "razorpay"}
                              onChange={handleInputChange}
                            />
                            <span className={styles.radioCustom}></span>
                            <img
                              src="https://res.cloudinary.com/dsprfys3x/image/upload/v1773377507/razorpay_chzbwv.svg"
                              alt="Razorpay"
                            />
                            <span>Razorpay</span>
                          </label>
                        </div> */}

                        {!isPaymentReady ? (
                          <button
                            type="submit"
                            className={styles.proceedButton}
                            style={{ marginTop: "14px" }}
                          >
                            Verify Details & Continue
                            <i className="bi bi-shield-check ms-2"></i>
                          </button>
                        ) : (
                          <div className={styles.paymentButton}>
                            {formData.paymentMethod === "razorpay" ? (
                              <RazorpayPayment
                                amount={calculatePrice()}
                                buttonText={`Pay `}
                                themeColor="#3496cb"
                                previewImage={mailPreviewImage}
                                disabled={!isPaymentReady}
                                customerDetails={{
                                  orderId,
                                  productType: "landscape",
                                  productName: "Custom Landscape Print",
                                  name: formData.fullName,
                                  email: formData.email,
                                  phone: formData.phone,
                                  alternatePhone: formData.alternatePhone,
                                  address: formData.address,
                                  alternateAddress: formData.alternateAddress,
                                  city: formData.city,
                                  state: formData.state,
                                  pincode: formData.pincode,
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
                            ) : (
                              <GPayButton
                                amount={calculatePrice()}
                                customerDetails={{
                                  orderId,
                                  productType: "landscape",
                                  productName: "Custom Landscape Print",
                                  name: formData.fullName,
                                  email: formData.email,
                                  phone: formData.phone,
                                  alternatePhone: formData.alternatePhone,
                                  address: formData.address,
                                  alternateAddress: formData.alternateAddress,
                                  city: formData.city,
                                  state: formData.state,
                                  pincode: formData.pincode,
                                  size,
                                  thickness,
                                  quantity,
                                  amount: calculatePrice(),
                                }}
                                onSuccess={handlePaymentSuccess}
                                onError={handlePaymentError}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={styles.productClient}>
        {renderStepIndicator()}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {showToast.visible && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "#fff",
            borderRadius: "10px",
            padding: "12px 16px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
            zIndex: 9999,
            minWidth: "250px",
            maxWidth: "calc(100vw - 30px)",
          }}
        >
          <strong>{showToast.title}</strong>
          <div>{showToast.message}</div>
        </div>
      )}

      <div
        className="modal fade"
        id="successModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Order Submitted</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <p>Your landscape order has been placed successfully.</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                data-bs-dismiss="modal"
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
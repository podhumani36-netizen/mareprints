"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import styles from "../../../assest/style/ProductClient.module.css";
import GPayButton from "../../../Components/GPayButton";
import RazorpayPayment from "../../../Components/payment/Razorpay";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function ProductClient() {
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
  const [size, setSize] = useState("8x10");
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
    setOrderId(`#ORD${Math.floor(Math.random() * 10000)}`);
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
    setSize(orientation === "portrait" ? "8x10" : "10x8");
    setZoom(1);
    setImageOffset({ x: 0, y: 0 });
  }, [orientation]);

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

      const isPortrait = orientation === "portrait";

      const exportWidth = isPortrait ? 1600 : 2000;
      const exportHeight = isPortrait ? 2000 : 1600;

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

      const previewDims =
        frameDimensions[size] ||
        (isPortrait
          ? { width: 180, height: 220 }
          : { width: 220, height: 180 });

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

  const processFile = (file) => {
    setIsProcessing(true);

    const reader = new FileReader();

    reader.onload = (event) => {
      setUploadedImage(event.target.result);
      setZoom(1);
      setImageOffset({ x: 0, y: 0 });
      setIsProcessing(false);
    };

    reader.onerror = () => {
      setIsProcessing(false);
      showNotification("Failed to read file. Please try again.", "error");
    };

    reader.readAsDataURL(file);
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
    <div className="d-flex gap-2 flex-wrap align-items-center">
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

    {/* 🔥 Slider */}
    <div className="mt-3">
      <input
        type="range"
        min="0.5"
        max="3"
        step="0.05"
        value={zoom}
        onChange={(e) => setZoom(Number(e.target.value))}
        style={{ width: "100%", cursor: "pointer" }}
      />
    </div>
  </div>
);
  const renderBetterPreview = (useWall = false) => {
    const dims = frameDimensions[size] || { width: 220, height: 280 };
     const [widthInch, heightInch] = size.split("x").map(Number);
    const borderSize =
      thickness === "3mm" ? "6px" : thickness === "5mm" ? "10px" : "14px";

    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "540px",
          borderRadius: "20px",
          overflow: "hidden",
          background: useWall
            ? undefined
            : "linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)",
          backgroundImage: useWall
            ? "url(https://res.cloudinary.com/dsprfys3x/image/upload/v1773637296/wmremove-transformed_f1xtnt.jpg)"
            : undefined,
          backgroundSize: useWall ? "cover" : undefined,
          backgroundPosition: useWall ? "center" : undefined,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        {useWall && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.14))",
            }}
          />
        )}

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "35%",
            width: `${dims.width}px`,
            height: `${dims.height}px`,
            transform: "translate(-50%, -50%)",
            borderRadius: "8px",
            overflow: "hidden",
            background: "#fff",
            boxShadow:
              "0 18px 40px rgba(0,0,0,0.22), 0 4px 10px rgba(0,0,0,0.10)",
            border: `${borderSize} solid #ffffff`,
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
              background: "#f3f4f6",
            }}
          >
            <img
              src={uploadedImage || roomWallBackground}
              alt="Frame preview"
              onMouseDown={uploadedImage ? handleImageMouseDown : undefined}
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                transform: `translate(${imageOffset.x}px, ${imageOffset.y}px) scale(${zoom})`,
                transformOrigin: "center center",
                transition: isImageDragging ? "none" : "transform 0.18s ease",
                userSelect: "none",
                 filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.25))",
              }}
            />

            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 38%, rgba(255,255,255,0.00) 55%)",
                pointerEvents: "none",
              }}
            />

            {uploadedImage && (
              <div
                style={{
                  position: "absolute",
                  top: "5px",
                  right: "10px",
                  background: "rgba(17,24,39,0.72)",
                  color: "#fff",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontSize: "8px",
                  fontWeight: 600,
                  pointerEvents: "none",
                }}
              >
                Drag to adjust
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "calc(50% + 170px)",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              background: "rgba(255,255,255,0.92)",
              padding: "8px 14px",
              borderRadius: "999px",
              fontWeight: 600,
              fontSize: "13px",
              boxShadow: "0 6px 18px rgba(0,0,0,0.10)",
            }}
          >
            {size} ({(widthInch * 2.54).toFixed(2)} x {(heightInch * 2.54).toFixed(2)} cm)
          </span>

          <span
            style={{
              background: "rgba(255,255,255,0.92)",
              padding: "8px 14px",
              borderRadius: "999px",
              fontWeight: 600,
              fontSize: "13px",
              boxShadow: "0 6px 18px rgba(0,0,0,0.10)",
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

  const dims = frameDimensions[size] || { width: 100, height: 150 };
  const borderSize =
    thickness === "3mm" ? "6px" : thickness === "5mm" ? "10px" : "14px";

  return (
    <div
      className={styles.summaryImage}
      style={{
        position: "relative",
        width: "100%",
        height: "220px",
        borderRadius: "14px",
        overflow: "hidden",
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          width: `${dims.width}px`,
          height: `${dims.height}px`,
          overflow: "hidden",
          borderRadius: "8px",
          background: "#fff",
          position: "relative",
          border: `${borderSize} solid #ffffff`,
          boxShadow:
            "0 18px 40px rgba(0,0,0,0.22), 0 4px 10px rgba(0,0,0,0.10)",
        }}
      >
        <img
          src={uploadedImage}
          alt="Product preview"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            transform: `translate(${imageOffset.x}px, ${imageOffset.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
};
  const renderStep1 = () => (
    <div className={styles.stepContainer}>
      <div className="container">
        <div className="row g-4">
          <div className="col-sm-12 col-md-8">
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

            <div className={`${styles.uploadCard} mt-5`}>
              <img
                src="https://res.cloudinary.com/dsprfys3x/image/upload/v1773633339/wmremove-transformed_ouhicx.png"
                alt="image"
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
                Continue to Customize
                <i className="bi bi-arrow-right ms-2"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => {
    const dims = frameDimensions[size] || { width: 100, height: 150 };

    return (
      <div className={styles.stepContainer}>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-8">
              <div className={styles.previewCard}>
                <h4 className={styles.previewTitle}>
                  <i className="bi bi-eye me-2"></i>
                  Live Preview
                </h4>

                {renderBetterPreview(true)}

                

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
                  <label className={styles.optionLabel}>Orientation</label>
                  <div className={styles.buttonGroup}>
                    <button
                      className={`${styles.optionButton} ${
                        orientation === "portrait" ? styles.active : ""
                      }`}
                      onClick={() => setOrientation("portrait")}
                      type="button"
                    >
                      <i className="bi bi-phone-portrait"></i>
                      Portrait
                    </button>

                    <button
                      className={`${styles.optionButton} ${
                        orientation === "landscape" ? styles.active : ""
                      }`}
                      onClick={() => setOrientation("landscape")}
                      type="button"
                    >
                      <i className="bi bi-phone-landscape"></i>
                      Landscape
                    </button>
                  </div>
                </div>

                <div className={styles.optionGroup}>
                  <label className={styles.optionLabel}>Size (inches)</label>
                  <div className={styles.sizeGrid}>
                    {(orientation === "portrait"
                      ? sizeOptions.portrait
                      : sizeOptions.landscape
                    ).map((opt) => (
                      <button
                        key={opt}
                        className={`${styles.sizeButton} ${
                          size === opt ? styles.active : ""
                        }`}
                        onClick={() => setSize(opt)}
                        type="button"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.optionGroup}>
                  <label className={styles.optionLabel}>Thickness</label>
                  <div className={styles.buttonGroup}>
                    {thicknessOptions.map((opt) => (
                      <button
                        key={opt}
                        className={`${styles.optionButton} ${
                          thickness === opt ? styles.active : ""
                        }`}
                        onClick={() => setThickness(opt)}
                        type="button"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.optionGroup}>
                  <label className={styles.optionLabel}>Price</label>

                  {/* Optional pincode checker
                  <div className={styles.pincodeInput}>
                    <input
                      type="text"
                      className={styles.pincodeField}
                      placeholder="Enter 6-digit pincode"
                      value={pincode}
                      onChange={handlePincodeChange}
                      maxLength="6"
                    />
                    <button
                      className={styles.checkButton}
                      onClick={handleCheckDelivery}
                      disabled={pincode.length !== 6 || deliveryStatus.isChecking}
                      type="button"
                    >
                      {deliveryStatus.isChecking ? (
                        <span className={styles.spinner}></span>
                      ) : (
                        "Check"
                      )}
                    </button>
                  </div>
                  */}

                  {deliveryStatus.message && (
                    <div
                      className={`${styles.deliveryMessage} ${
                        styles[deliveryStatus.type]
                      }`}
                    >
                      <i
                        className={`bi ${
                          deliveryStatus.type === "success"
                            ? "bi-check-circle"
                            : "bi-exclamation-circle"
                        }`}
                      ></i>
                      <span>{deliveryStatus.message}</span>
                      {estimatedDeliveryDate &&
                        deliveryStatus.type === "success" && (
                          <small>Est. delivery: {estimatedDeliveryDate}</small>
                        )}
                    </div>
                  )}
                </div>

                <div className={styles.priceBreakdown}>
                  <div className={styles.priceRow}>
                    <span>Base Price</span>
                    <span>₹{basePrice}</span>
                  </div>

                  {size !== (orientation === "portrait" ? "8x10" : "10x8") && (
                    <div className={styles.priceRow}>
                      <span>Size Upgrade</span>
                      <span>
                        +₹
                        {(orientation === "portrait"
                          ? sizeOptions.portrait.indexOf(size)
                          : sizeOptions.landscape.indexOf(size)) * 150}
                      </span>
                    </div>
                  )}

                  {thickness !== "3mm" && (
                    <div className={styles.priceRow}>
                      <span>Thickness Upgrade</span>
                      <span>+₹{thickness === "5mm" ? "150" : "300"}</span>
                    </div>
                  )}

                  <div className={styles.totalRow}>
                    <span>Total</span>
                    <span>₹{calculatePrice()}</span>
                  </div>
                </div>

                <button
                  className={styles.proceedButton}
                  onClick={() => goToStep(3)}
                  type="button"
                >
                  Proceed to Payment
                  <i className="bi bi-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div className={styles.stepContainer}>
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 order-lg-2">
            <div className={styles.summaryCard}>
              <h4 className={styles.summaryTitle}>
                <i className="bi bi-bag-check me-2"></i>
                Order Summary
              </h4>

              {renderSummaryPreview()}

              <div className={styles.summaryDetails}>
                <div className={styles.summaryRow}>
                  <span>Orientation</span>
                  <span className={styles.summaryValue}>{orientation}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Size</span>
                  <span className={styles.summaryValue}>{size}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Thickness</span>
                  <span className={styles.summaryValue}>{thickness}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Quantity</span>
                  <div className={styles.quantityWrapper}>
                    <select
                      className={styles.quantityDropdown}
                      value={quantity}
                      onChange={(e) => {
                        setQuantity(Number(e.target.value));
                        setIsPaymentReady(false);
                      }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.totalItems}>
                <span>Total Items:</span>
                <span className={styles.totalItemsValue}>{quantity}</span>
              </div>

              <div className={styles.summaryTotal}>
                <span>Total Amount</span>
                <span>₹{calculatePrice()}</span>
              </div>

              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>
          </div>

          <div className="col-lg-8 order-lg-1">
            <div className={styles.formCard}>
              <div className={styles.formHeader}>
                <h4 className={styles.formTitle}>
                  <i className="bi bi-truck me-2"></i>
                  Shipping Details
                </h4>
                <button
                  className={styles.backButton}
                  onClick={() => setCurrentStep(2)}
                  type="button"
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back
                </button>
              </div>

              <form
                onSubmit={handleSubmitOrder}
                className={styles.shippingForm}
              >
                <div className={styles.formSection}>
                  <h5 className={styles.sectionTitle}>Personal Information</h5>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className={styles.fieldLabel}>Full Name *</label>
                      <div className={styles.inputWrapper}>
                        <i className={`bi bi-person ${styles.inputIcon}`}></i>
                        <input
                          type="text"
                          name="fullName"
                          className={`${styles.formInput} ${
                            formErrors.fullName ? styles.error : ""
                          }`}
                          placeholder="Enter your full name"
                          value={formData.fullName}
                          onChange={handleInputChange}
                        />
                      </div>
                      {formErrors.fullName && (
                        <span className={styles.errorMessage}>
                          {formErrors.fullName}
                        </span>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className={styles.fieldLabel}>Email *</label>
                      <div className={styles.inputWrapper}>
                        <i className={`bi bi-envelope ${styles.inputIcon}`}></i>
                        <input
                          type="email"
                          name="email"
                          className={`${styles.formInput} ${
                            formErrors.email ? styles.error : ""
                          }`}
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                      {formErrors.email && (
                        <span className={styles.errorMessage}>
                          {formErrors.email}
                        </span>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className={styles.fieldLabel}>Phone *</label>
                      <div className={styles.inputWrapper}>
                        <i className={`bi bi-phone ${styles.inputIcon}`}></i>
                        <input
                          type="tel"
                          name="phone"
                          className={`${styles.formInput} ${
                            formErrors.phone ? styles.error : ""
                          }`}
                          placeholder="10-digit mobile number"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                      {formErrors.phone && (
                        <span className={styles.errorMessage}>
                          {formErrors.phone}
                        </span>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className={styles.fieldLabel}>
                        Alternate Phone
                      </label>
                      <div className={styles.inputWrapper}>
                        <i className={`bi bi-telephone ${styles.inputIcon}`}></i>
                        <input
                          type="tel"
                          name="alternatePhone"
                          className={`${styles.formInput} ${
                            formErrors.alternatePhone ? styles.error : ""
                          }`}
                          placeholder="Optional alternate number"
                          value={formData.alternatePhone}
                          onChange={handleInputChange}
                        />
                      </div>
                      {formErrors.alternatePhone && (
                        <span className={styles.errorMessage}>
                          {formErrors.alternatePhone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.formSection}>
                  <h5 className={styles.sectionTitle}>Address Information</h5>

                  <div className="row g-3">
                    <div className="col-12">
                      <label className={styles.fieldLabel}>Address *</label>
                      <div className={styles.inputWrapper}>
                        <i className={`bi bi-geo-alt ${styles.inputIcon}`}></i>
                        <textarea
                          name="address"
                          className={`${styles.formInput} ${
                            formErrors.address ? styles.error : ""
                          }`}
                          placeholder="Enter your complete address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows="3"
                        />
                      </div>
                      {formErrors.address && (
                        <span className={styles.errorMessage}>
                          {formErrors.address}
                        </span>
                      )}
                    </div>

                    <div className="col-12">
                      <label className={styles.fieldLabel}>
                        Alternate Address
                      </label>
                      <div className={styles.inputWrapper}>
                        <i className={`bi bi-pin-map ${styles.inputIcon}`}></i>
                        <textarea
                          name="alternateAddress"
                          className={styles.formInput}
                          placeholder="Optional alternate address"
                          value={formData.alternateAddress}
                          onChange={handleInputChange}
                          rows="2"
                        />
                      </div>
                    </div>

                    <div className="col-md-4">
                      <label className={styles.fieldLabel}>City *</label>
                      <div className={styles.inputWrapper}>
                        <i className={`bi bi-building ${styles.inputIcon}`}></i>
                        <input
                          type="text"
                          name="city"
                          className={`${styles.formInput} ${
                            formErrors.city ? styles.error : ""
                          }`}
                          placeholder="City"
                          value={formData.city}
                          onChange={handleInputChange}
                        />
                      </div>
                      {formErrors.city && (
                        <span className={styles.errorMessage}>
                          {formErrors.city}
                        </span>
                      )}
                    </div>

                    <div className="col-md-4">
                      <label className={styles.fieldLabel}>State *</label>
                      <div className={styles.inputWrapper}>
                        <i className={`bi bi-map ${styles.inputIcon}`}></i>
                        <input
                          type="text"
                          name="state"
                          className={`${styles.formInput} ${
                            formErrors.state ? styles.error : ""
                          }`}
                          placeholder="State"
                          value={formData.state}
                          onChange={handleInputChange}
                        />
                      </div>
                      {formErrors.state && (
                        <span className={styles.errorMessage}>
                          {formErrors.state}
                        </span>
                      )}
                    </div>

                    <div className="col-md-4">
                      <label className={styles.fieldLabel}>Pincode *</label>
                      <div className={styles.inputWrapper}>
                        <i className={`bi bi-mailbox ${styles.inputIcon}`}></i>
                        <input
                          type="text"
                          name="pincode"
                          className={`${styles.formInput} ${
                            formErrors.pincode ? styles.error : ""
                          }`}
                          placeholder="6-digit pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          maxLength="6"
                        />
                      </div>
                      {formErrors.pincode && (
                        <span className={styles.errorMessage}>
                          {formErrors.pincode}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.formSection}>
                  <h5 className={styles.sectionTitle}>Payment Method</h5>

                  <div className={styles.paymentOptions}>
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
{/* 
                    <label className={styles.paymentOption}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="gpay"
                        checked={formData.paymentMethod === "gpay"}
                        onChange={handleInputChange}
                      />
                      <span className={styles.radioCustom}></span>
                      <i className="bi bi-google"></i>
                      <span>Google Pay</span>
                    </label> */}
                  </div>

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
  buttonText={`Pay ₹${calculatePrice()}`}
  themeColor="#3496cb"
  previewImage={mailPreviewImage}
  disabled={!isPaymentReady}
  customerDetails={{
    orderId,
    productType: "portrait",
    productName: "Custom Portrait Print",
    name: formData.fullName,
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
                      ) : (
                        <GPayButton
                          amount={calculatePrice()}
                          customerDetails={{
                            orderId,
                            productType: "portrait",
                            productName: "Custom Portrait Print",
                            name: formData.fullName,
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
                          }}
                          onSuccess={handlePaymentSuccess}
                          onError={handlePaymentError}
                        />
                      )}
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
              <p>Your order has been placed successfully.</p>
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
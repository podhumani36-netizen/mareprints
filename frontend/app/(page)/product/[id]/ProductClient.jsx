"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import styles from "../../../assest/style/ProductClient.module.css";
import GPayButton from "../../../Components/GPayButton";
import RazorpayPayment from "../../../Components/payment/Razorpay";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function ProductClientPortrait() {
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

  const [showToast, setShowToast] = useState({
    visible: false,
    type: "",
    title: "",
    message: "",
  });

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const containerRef = useRef(null);

  const [size, setSize] = useState("8×10");
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

  const sizeOptions = ["8×10", "11×14", "16×20", "20×24", "24×36"];
  const thicknessOptions = ["3mm", "5mm", "8mm"];

  const frameDimensions = {
    "8×10": { width: 180, height: 220 },
    "11×14": { width: 220, height: 280 },
    "16×20": { width: 280, height: 340 },
    "20×24": { width: 320, height: 380 },
    "24×36": { width: 360, height: 500 },
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

  const calculatePrice = useCallback(() => {
    let price = basePrice;
    const sizeIndex = sizeOptions.indexOf(size);

    if (sizeIndex > 0) price += sizeIndex * 150;
    if (thickness === "5mm") price += 150;
    if (thickness === "8mm") price += 300;

    return price * quantity;
  }, [size, thickness, quantity]);

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
        showNotification("File size must be less than 10MB", "error");
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

  const processFile = (file) => {
    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      setUploadedImage(event.target.result);
      setZoom(1);
      setImageOffset({ x: 0, y: 0 });
      setIsProcessing(false);
      showNotification("Image uploaded successfully!", "success");
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
      const servicable = ["110001", "400001", "700001", "560001", "600001"].includes(pincode);

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
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Invalid email format";

    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone)) errors.phone = "Phone must be 10 digits";

    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.state.trim()) errors.state = "State is required";

    if (!formData.pincode.trim()) errors.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(formData.pincode)) errors.pincode = "Pincode must be 6 digits";

    return errors;
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showNotification("Please fill all required fields correctly", "error");
      return;
    }

    showNotification("Order submitted successfully!", "success");

    if (typeof window !== "undefined" && window.bootstrap) {
      const modalEl = document.getElementById("successModal");
      if (modalEl) {
        const modal = new window.bootstrap.Modal(modalEl);
        modal.show();
      }
    }
  };

  const goToStep = (step) => {
    if (step === 2 && !uploadedImage) {
      showNotification("Please upload an image first", "warning");
      return;
    }
    setCurrentStep(step);
  };

  const getSummaryFrameSize = () => {
    switch (size) {
      case "8×10":
        return { width: 90, height: 112 };
      case "11×14":
        return { width: 100, height: 127 };
      case "16×20":
        return { width: 110, height: 138 };
      case "20×24":
        return { width: 120, height: 145 };
      case "24×36":
        return { width: 130, height: 180 };
      default:
        return { width: 90, height: 112 };
    }
  };

  const renderStepIndicator = () => (
    <div className={styles.stepIndicator}>
      <div className="container">
        <div className={styles.stepWrapper}>
          {[1, 2, 3].map((step) => (
            <div key={step} className={styles.stepItem}>
              <button
                className={`${styles.stepButton} ${currentStep === step ? styles.active : ""} ${
                  currentStep > step ? styles.completed : ""
                }`}
                onClick={() => goToStep(step)}
                disabled={step > 1 && !uploadedImage}
                type="button"
              >
                <span className={styles.stepNumber}>
                  {currentStep > step ? <i className="bi bi-check-lg"></i> : step}
                </span>
                <span className={styles.stepLabel}>
                  {step === 1 ? "Upload & Edit" : step === 2 ? "Customize" : "Payment"}
                </span>
              </button>

              {step < 3 && (
                <div
                  className={`${styles.stepConnector} ${currentStep > step ? styles.completed : ""}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEditorControls = () => (
    <div className="d-flex gap-2 mt-3 flex-wrap align-items-center">
      <button type="button" className="btn btn-outline-secondary" onClick={handleZoomOut}>
        <i className="bi bi-dash-lg"></i>
      </button>

      <span style={{ minWidth: "64px", textAlign: "center", fontWeight: 600 }}>
        {zoom.toFixed(1)}x
      </span>

      <button type="button" className="btn btn-outline-secondary" onClick={handleZoomIn}>
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
  );

  const renderStep1 = () => (
    <div className={styles.stepContainer}>
      <div className="container">
        <div className="row g-4">
          <div className="col-sm-12 col-md-8">
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
                    <div
                      ref={containerRef}
                      className={styles.imagePreview}
                      style={{
                        overflow: "auto",
                        maxHeight: "500px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "8px",
                        position: "relative",
                      }}
                    >
                      <canvas
                        ref={canvasRef}
                        className={styles.drawingCanvas}
                        style={{
                          transform: `scale(${zoom}) translate(${imageOffset.x / 8}px, ${imageOffset.y / 8}px)`,
                          transformOrigin: "center",
                          transition: isImageDragging ? "none" : "transform 0.2s ease",
                          maxWidth: "100%",
                          height: "auto",
                          display: "block",
                          cursor: isImageDragging ? "grabbing" : "grab",
                        }}
                        onMouseDown={handleImageMouseDown}
                      />
                    </div>

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
                          isDragging ? "bi-file-earmark-arrow-up" : "bi-cloud-upload"
                        }`}
                      ></i>
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

              <div
                style={{
                  position: "relative",
                  width: "100%",
                  minHeight: "480px",
                  borderRadius: "20px",
                  overflow: "hidden",
                  backgroundImage: `url(${roomWallBackground})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: `${frameDimensions[size]?.width || 180}px`,
                    height: `${frameDimensions[size]?.height || 220}px`,
                    border: `${thickness === "3mm" ? 6 : thickness === "5mm" ? 10 : 14}px solid #fff`,
                    borderRadius: "8px",
                    overflow: "hidden",
                    background: "#fff",
                    boxShadow: "0 18px 40px rgba(0,0,0,0.22), 0 4px 10px rgba(0,0,0,0.10)",
                    position: "relative",
                  }}
                >
                  {uploadedImage ? (
                    <img
                      src={uploadedImage}
                      alt="Frame preview"
                      onMouseDown={handleImageMouseDown}
                      draggable={false}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transform: `translate(${imageOffset.x}px, ${imageOffset.y}px) scale(${zoom})`,
                        transformOrigin: "center center",
                        transition: isImageDragging ? "none" : "transform 0.18s ease",
                        userSelect: "none",
                        cursor: isImageDragging ? "grabbing" : "grab",
                      }}
                    />
                  ) : null}
                </div>
              </div>

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
                  <button className={`${styles.optionButton} ${styles.active}`} type="button">
                    Portrait
                  </button>
                </div>
              </div>

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
                <label className={styles.optionLabel}>Check Delivery</label>
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter pincode"
                    value={pincode}
                    onChange={handlePincodeChange}
                    maxLength={6}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={handleCheckDelivery}
                    disabled={deliveryStatus.isChecking}
                  >
                    {deliveryStatus.isChecking ? "Checking..." : "Check"}
                  </button>
                </div>

                {deliveryStatus.message && (
                  <div className={`mt-2 small ${deliveryStatus.type === "success" ? "text-success" : "text-danger"}`}>
                    {deliveryStatus.message}
                    {estimatedDeliveryDate && deliveryStatus.type === "success" && (
                      <div>Est. delivery: {estimatedDeliveryDate}</div>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.optionGroup}>
                <label className={styles.optionLabel}>Price</label>
              </div>

              <div className={styles.priceBreakdown}>
                <div className={styles.priceRow}>
                  <span>Base Price</span>
                  <span>₹{basePrice}</span>
                </div>

                {size !== "8×10" && (
                  <div className={styles.priceRow}>
                    <span>Size Upgrade</span>
                    <span>+₹{sizeOptions.indexOf(size) * 150}</span>
                  </div>
                )}

                {thickness !== "3mm" && (
                  <div className={styles.priceRow}>
                    <span>Thickness Upgrade</span>
                    <span>+₹{thickness === "5mm" ? "150" : "300"}</span>
                  </div>
                )}

                <div className={styles.priceRow}>
                  <span>Quantity</span>
                  <span>{quantity}</span>
                </div>

                <div className={styles.totalRow}>
                  <span>Total</span>
                  <span>₹{calculatePrice()}</span>
                </div>
              </div>

              <div className="d-flex gap-2 mt-4">
                <button
                  className="btn btn-outline-secondary w-50 py-3 fw-bold"
                  onClick={() => goToStep(1)}
                  type="button"
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back
                </button>

                <button
                  className="btn btn-success w-50 py-3 fw-bold"
                  onClick={() => goToStep(3)}
                  type="button"
                >
                  <i className="bi bi-cart-check me-2"></i>
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const totalAmount = calculatePrice();
    const summaryDims = getSummaryFrameSize();

    return (
      <div className={styles.stepContainer}>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4 order-lg-2">
              <div className={styles.summaryCard}>
                <h4 className={styles.summaryTitle}>
                  <i className="bi bi-bag-check me-2"></i>
                  Order Summary
                </h4>

                {uploadedImage && (
                  <div
                    className={styles.summaryImage}
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "220px",
                      borderRadius: "14px",
                      overflow: "hidden",
                      background: "#f3f4f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div
                      style={{
                        width: `${summaryDims.width}px`,
                        height: `${summaryDims.height}px`,
                        border: `${thickness === "3mm" ? 5 : thickness === "5mm" ? 8 : 11}px solid #fff`,
                        borderRadius: "8px",
                        overflow: "hidden",
                        background: "#fff",
                        boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
                        position: "relative",
                      }}
                    >
                      <img
                        src={uploadedImage}
                        alt="Product preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transform: `translate(${imageOffset.x * 0.35}px, ${imageOffset.y * 0.35}px) scale(${zoom})`,
                          transformOrigin: "center center",
                          userSelect: "none",
                          pointerEvents: "none",
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className={styles.summaryDetails}>
                  <div className={styles.summaryRow}>
                    <span>Orientation</span>
                    <span className={styles.summaryValue}>Portrait</span>
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
                        onChange={(e) => setQuantity(Number(e.target.value))}
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

                <div className={styles.summaryTotal}>
                  <span>Total Amount</span>
                  <span>₹{totalAmount}</span>
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
                        maxLength="10"
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
                        className="form-control"
                        value={formData.alternatePhone}
                        onChange={handleInputChange}
                        maxLength="10"
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Address *</label>
                      <textarea
                        name="address"
                        className={`form-control ${formErrors.address ? "is-invalid" : ""}`}
                        rows="2"
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
                        rows="2"
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
                        maxLength="6"
                      />
                      {formErrors.pincode && (
                        <div className="invalid-feedback">{formErrors.pincode}</div>
                      )}
                    </div>

                    <div className="col-12">
                      <label className="form-label">Payment Method</label>
                      <div className="d-flex gap-3 mt-2">
                        <div className="form-check">
                          <input
                            type="radio"
                            className="form-check-input"
                            name="paymentMethod"
                            value="razorpay"
                            checked={formData.paymentMethod === "razorpay"}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label">Razorpay</label>
                        </div>

                        <div className="form-check">
                          <input
                            type="radio"
                            className="form-check-input"
                            name="paymentMethod"
                            value="gpay"
                            checked={formData.paymentMethod === "gpay"}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label">Google Pay</label>
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="bg-light rounded p-3 mt-2">
                        <div className="d-flex justify-content-between py-1">
                          <span>Selected Size</span>
                          <span>{size}</span>
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

                    <div className="col-12 mt-4">
                      {formData.paymentMethod === "razorpay" ? (
                        <RazorpayPayment
                          amount={totalAmount}
                          buttonText={`Pay ₹${totalAmount}`}
                          themeColor="#3496cb"
                          customerDetails={{
                            name: formData.fullName,
                            email: formData.email,
                            phone: formData.phone,
                            address: formData.address,
                            size,
                            thickness,
                            quantity,
                            imageZoom: zoom,
                            imageOffsetX: imageOffset.x,
                            imageOffsetY: imageOffset.y,
                            productType: "portrait",
                            productName: "Portrait Print",
                          }}
                          onSuccess={() => {
                            showNotification(
                              "Payment successful! Thank you for your order.",
                              "success"
                            );

                            if (typeof window !== "undefined" && window.bootstrap) {
                              const modalEl = document.getElementById("successModal");
                              if (modalEl) {
                                const modal = new window.bootstrap.Modal(modalEl);
                                modal.show();
                              }
                            }
                          }}
                          onError={() =>
                            showNotification("Payment failed. Please try again.", "error")
                          }
                        />
                      ) : (
                        <GPayButton
                          amount={totalAmount}
                          onSuccess={() => {
                            showNotification(
                              "Payment successful! Thank you for your order.",
                              "success"
                            );

                            if (typeof window !== "undefined" && window.bootstrap) {
                              const modalEl = document.getElementById("successModal");
                              if (modalEl) {
                                const modal = new window.bootstrap.Modal(modalEl);
                                modal.show();
                              }
                            }
                          }}
                          onError={() =>
                            showNotification("Payment failed. Please try again.", "error")
                          }
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

      {showToast.visible && (
        <div
          className={`toast show position-fixed top-0 end-0 m-3 text-bg-${
            showToast.type === "success"
              ? "success"
              : showToast.type === "error"
              ? "danger"
              : showToast.type === "warning"
              ? "warning"
              : "primary"
          }`}
          role="alert"
          style={{ zIndex: 9999, minWidth: "280px" }}
        >
          <div className="toast-header">
            <strong className="me-auto">{showToast.title}</strong>
            <button
              type="button"
              className="btn-close"
              onClick={() =>
                setShowToast({
                  visible: false,
                  type: "",
                  title: "",
                  message: "",
                })
              }
            ></button>
          </div>
          <div className="toast-body">{showToast.message}</div>
        </div>
      )}

      <div className="modal fade" id="successModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h5 className={styles.modalTitle}>Order Confirmed</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className={styles.modalBody}>
              <div className="text-center py-3">
                <i
                  className="bi bi-check-circle-fill text-success"
                  style={{ fontSize: "64px" }}
                ></i>
                <h4 className="mt-3">Thank you for your order!</h4>
                <p className="mb-1">Your order has been placed successfully.</p>
                <p className="fw-semibold mb-0">Order ID: {orderId}</p>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className="btn btn-primary"
                data-bs-dismiss="modal"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
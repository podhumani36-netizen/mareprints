"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import styles from "../../../assest/style/ProductClient.module.css";
import GPayButton from "../../../Components/GPayButton";
import RazorpayPayment from "../../../Components/payment/Razorpay";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function ProductClientSquare({ product }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [zoom, setZoom] = useState(1);
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

  // Square specific sizes
  const [size, setSize] = useState(product?.defaultSize || "8×8");
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

  // Square size options (equal width and height)
  const sizeOptions = product?.sizeOptions || [
    "8×8",
    "10×10",
    "12×12",
    "16×16",
    "20×20",
    "24×24",
    "30×30",
  ];
  const thicknessOptions = ["3mm", "5mm", "8mm"];

  // Square frame dimensions (width = height)
  const frameDimensions = product?.frameDimensions || {
    "8×8": { width: 180, height: 180 },
    "10×10": { width: 210, height: 210 },
    "12×12": { width: 240, height: 240 },
    "16×16": { width: 300, height: 300 },
    "20×20": { width: 360, height: 360 },
    "24×24": { width: 420, height: 420 },
    "30×30": { width: 510, height: 510 },
  };

  const basePrice = product?.basePrice || 849;
  const roomWallBackground =
    product?.backgroundImage ||
    "https://res.cloudinary.com/dsprfys3x/image/upload/v1773634493/Gemini_Generated_Image_g2ds8ig2ds8ig2ds_puojbl.png";

  // Same functions as other components...
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js")
      .then(() => console.log("Bootstrap JS loaded"))
      .catch((err) => console.error("Failed to load Bootstrap JS:", err));
  }, []);

  useEffect(() => {
    setOrderId(`#ORD${Math.floor(Math.random() * 10000)}`);
  }, []);

  const drawImageOnCanvas = useCallback((imageSrc) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, img.width, img.height);
      showNotification("Image loaded successfully!", "success");
    };

    img.onerror = () => {
      showNotification("Failed to load image", "error");
    };

    img.src = imageSrc;
  }, []);

  useEffect(() => {
    if (uploadedImage) {
      drawImageOnCanvas(uploadedImage);
    }
  }, [uploadedImage, drawImageOnCanvas]);

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

    setShowToast({ visible: true, type, title: notificationTitle, message });
    setTimeout(() => {
      setShowToast({ visible: false, type: "", title: "", message: "" });
    }, 3000);
  };

  const calculatePrice = useCallback(() => {
    let price = basePrice;
    const sizeIndex = sizeOptions.indexOf(size);
    if (sizeIndex > 0) price += sizeIndex * (product?.priceIncrement || 150);
    if (thickness === "5mm") price += 150;
    if (thickness === "8mm") price += 300;
    return price * quantity;
  }, [size, thickness, sizeOptions, basePrice, quantity, product]);

  // Drag and drop handlers
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
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setZoom(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
    showNotification("Image removed successfully", "warning");
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
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Invalid email format";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone))
      errors.phone = "Phone must be 10 digits";
    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.state.trim()) errors.state = "State is required";
    if (!formData.pincode.trim()) errors.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(formData.pincode))
      errors.pincode = "Pincode must be 6 digits";
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

  const renderStepIndicator = () => (
    <div className={styles.stepIndicator}>
      <div className="container">
        <div className={styles.stepWrapper}>
          {[1, 2, 3].map((step) => (
            <div key={step} className={styles.stepItem}>
              <button
                className={`${styles.stepButton} ${currentStep === step ? styles.active : ""} ${currentStep > step ? styles.completed : ""}`}
                onClick={() => goToStep(step)}
                disabled={step > 1 && !uploadedImage}
              >
                <span className={styles.stepNumber}>
                  {currentStep > step ? (
                    <i className="bi bi-check-lg"></i>
                  ) : (
                    step
                  )}
                </span>
                <span className={styles.stepLabel}>
                  {step === 1 ? "Upload" : step === 2 ? "Customize" : "Payment"}
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
                          transform: `scale(${zoom})`,
                          transformOrigin: "center",
                          transition: "transform 0.2s ease",
                          maxWidth: "100%",
                          height: "auto",
                          display: "block",
                        }}
                      />
                      {zoom !== 1 && (
                        <span className={styles.zoomBadge}>
                          <i className="bi bi-search"></i> {zoom.toFixed(1)}x
                        </span>
                      )}
                    </div>

                    <div className={styles.imageControls}>
                      <button
                        className={`${styles.controlButton} ${styles.zoomButton}`}
                        onClick={handleZoomOut}
                        title="Zoom Out"
                      >
                        <i className="bi bi-zoom-out"></i>
                      </button>
                      <span className={styles.zoomLevel}>
                        {Math.round(zoom * 100)}%
                      </span>
                      <button
                        className={`${styles.controlButton} ${styles.zoomButton}`}
                        onClick={handleZoomIn}
                        title="Zoom In"
                      >
                        <i className="bi bi-zoom-in"></i>
                      </button>
                      <button
                        className={`${styles.controlButton} ${styles.dangerButton}`}
                        onClick={handleRemoveImage}
                        title="Remove Image"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.uploadPrompt}>
                    <div className={styles.uploadIcon}>
                      <i
                        className={`bi ${isDragging ? "bi-file-earmark-arrow-up" : "bi-cloud-upload"}`}
                      ></i>
                    </div>
                    <h3 className={styles.uploadTitle}>
                      {isDragging
                        ? "Drop your square image here"
                        : `Upload your ${product?.name || "Square"} image`}
                    </h3>
                    <p className={styles.uploadSubtitle}>
                      {isDragging
                        ? "Release to upload"
                        : "Drag & drop or click to browse"}
                    </p>
                    <button
                      className={styles.browseButton}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <i className="bi bi-folder2-open me-2"></i>
                      Browse Files
                    </button>
                    <p className={styles.uploadHint}>
                      Supported formats: JPG, PNG, GIF (Max 10MB)
                    </p>
                    <p className={styles.uploadHint}>
                      <i className="bi bi-info-circle"></i> Best for
                      square/circular photos
                    </p>
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
                src={
                  product?.infoImage ||
                  "https://res.cloudinary.com/dsprfys3x/image/upload/v1773633339/wmremove-transformed_ouhicx.png"
                }
                alt="info"
                className="img-fluid"
              />
            </div>
          </div>
          <div className="col-sm-12 col-md-4">
            <div className={styles.guideCard}>
              <h4 className={styles.guideTitle}>
                <i className="bi bi-info-circle me-2"></i>
                {product?.name || "Square"} Photo Guide
              </h4>

              <img
                src={
                  product?.guideImage ||
                  "https://res.cloudinary.com/dsprfys3x/image/upload/v1773825342/Gemini_Generated_Image_g2ds8ig2ds8ig2ds_u7pv7w.png"
                }
                alt="Print quality guide"
                className={styles.guideImage}
              />

              <ul className={styles.guideList}>
                {product?.tips?.map((tip, index) => (
                  <li key={index}>
                    <i className="bi bi-check-circle-fill"></i>
                    {tip}
                  </li>
                )) || (
                  <>
                    <li>
                      <i className="bi bi-check-circle-fill"></i>
                      Perfect for Instagram-style photos
                    </li>
                    <li>
                      <i className="bi bi-check-circle-fill"></i>
                      Upload high-resolution square images
                    </li>
                    <li>
                      <i className="bi bi-check-circle-fill"></i>
                      Ideal for portraits and symmetrical compositions
                    </li>
                    <li>
                      <i className="bi bi-check-circle-fill"></i>
                      Great for social media prints
                    </li>
                  </>
                )}
                <li className={styles.warning}>
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  Poor quality images affect final print
                </li>
              </ul>

              <button
                className={styles.nextButton}
                onClick={() => goToStep(2)}
                disabled={!uploadedImage}
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
    const dims = frameDimensions[size] || { width: 200, height: 200 };

    return (
      <div className={styles.stepContainer}>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-8">
              <div className={styles.previewCard}>
                <h4 className={styles.previewTitle}>
                  <i className="bi bi-eye me-2"></i>
                  Live Preview - {product?.name || "Square"} Acrylic Wall Photo
                </h4>

                <div className={styles.mockupWrapper}>
                  <div
                    className={styles.mockupBackground}
                    style={{
                      backgroundImage: `url(${product?.mockupBackground || "https://res.cloudinary.com/dsprfys3x/image/upload/v1773637296/wmremove-transformed_f1xtnt.jpg"})`,
                    }}
                  >
                    <div className={styles.mockupOverlay}></div>

                    <div
                      className={styles.frameMockup}
                      style={{
                        width: `${dims.width}px`,
                        height: `${dims.height}px`,
                        left: "50%",
                        top: "40%",
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <div className={styles.frameContent}>
                        <img
                          src={uploadedImage || roomWallBackground}
                          alt="Frame preview"
                          className={styles.frameImage}
                          style={{ objectFit: "cover" }}
                        />
                        <div className={styles.frameGlare}></div>
                        <div
                          className={styles.frameEdge}
                          style={{
                            borderWidth:
                              thickness === "3mm"
                                ? "2px"
                                : thickness === "5mm"
                                  ? "4px"
                                  : "6px",
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className={styles.previewLabels}>
                      <span className={styles.sizeLabel}>
                        {size} ({Math.round(dims.width * 2.54)} x{" "}
                        {Math.round(dims.height * 2.54)} cm)
                      </span>
                      <span className={styles.thicknessLabel}>{thickness}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className={styles.optionsCard}>
                <h4 className={styles.optionsTitle}>
                  <i className="bi bi-sliders2 me-2"></i>
                  Customize Your {product?.name || "Square"} Print
                </h4>

                <div className={styles.optionGroup}>
                  <label className={styles.optionLabel}>
                    Acrylic Sizes (Inches)
                  </label>
                  <div className={styles.sizeGrid}>
                    {sizeOptions.map((opt) => (
                      <button
                        key={opt}
                        className={`${styles.sizeButton} ${size === opt ? styles.active : ""}`}
                        onClick={() => setSize(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.optionGroup}>
                  <label className={styles.optionLabel}>
                    Acrylic Thickness
                  </label>
                  <div className={styles.buttonGroup}>
                    {thicknessOptions.map((opt) => (
                      <button
                        key={opt}
                        className={`${styles.optionButton} ${thickness === opt ? styles.active : ""}`}
                        onClick={() => setThickness(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.optionGroup}>
                  <label className={styles.optionLabel}>Delivery Pincode</label>
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
                      disabled={
                        pincode.length !== 6 || deliveryStatus.isChecking
                      }
                    >
                      {deliveryStatus.isChecking ? (
                        <span className={styles.spinner}></span>
                      ) : (
                        "Check"
                      )}
                    </button>
                  </div>

                  {deliveryStatus.message && (
                    <div
                      className={`${styles.deliveryMessage} ${styles[deliveryStatus.type]}`}
                    >
                      <i
                        className={`bi ${deliveryStatus.type === "success" ? "bi-check-circle" : "bi-exclamation-circle"}`}
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
                  {size !== sizeOptions[0] && (
                    <div className={styles.priceRow}>
                      <span>Size Upgrade</span>
                      <span>
                        +₹
                        {sizeOptions.indexOf(size) *
                          (product?.priceIncrement || 150)}
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
                Order Summary - {product?.name || "Square"}
              </h4>

              {uploadedImage && (
                <div className={styles.summaryImage}>
                  <img src={uploadedImage} alt="Product preview" />
                </div>
              )}

              <div className={styles.summaryDetails}>
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
                  style={{ width: "66%" }}
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
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back
                </button>
              </div>

              <form
                onSubmit={handleSubmitOrder}
                className={styles.shippingForm}
              >
                {/* Form fields same as portrait */}
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
                          className={`${styles.formInput} ${formErrors.fullName ? styles.error : ""}`}
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
                          className={`${styles.formInput} ${formErrors.email ? styles.error : ""}`}
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
                          className={`${styles.formInput} ${formErrors.phone ? styles.error : ""}`}
                          placeholder="10-digit mobile number"
                          value={formData.phone}
                          onChange={handleInputChange}
                          maxLength="10"
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
                        <i className={`bi bi-phone ${styles.inputIcon}`}></i>
                        <input
                          type="tel"
                          name="alternatePhone"
                          className={styles.formInput}
                          placeholder="Optional"
                          value={formData.alternatePhone}
                          onChange={handleInputChange}
                          maxLength="10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.formSection}>
                  <h5 className={styles.sectionTitle}>Shipping Address</h5>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className={styles.fieldLabel}>Address *</label>
                      <div className={styles.inputWrapper}>
                        <i className={`bi bi-geo-alt ${styles.inputIcon}`}></i>
                        <textarea
                          name="address"
                          className={`${styles.formInput} ${styles.textarea} ${formErrors.address ? styles.error : ""}`}
                          placeholder="Enter your complete address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows="2"
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
                        <i className={`bi bi-geo-alt ${styles.inputIcon}`}></i>
                        <textarea
                          name="alternateAddress"
                          className={styles.formInput}
                          placeholder="Optional"
                          value={formData.alternateAddress}
                          onChange={handleInputChange}
                          rows="2"
                        />
                      </div>
                    </div>

                    <div className="col-md-4">
                      <label className={styles.fieldLabel}>City *</label>
                      <input
                        type="text"
                        name="city"
                        className={`${styles.formInput} ${formErrors.city ? styles.error : ""}`}
                        placeholder="City"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                      {formErrors.city && (
                        <span className={styles.errorMessage}>
                          {formErrors.city}
                        </span>
                      )}
                    </div>

                    <div className="col-md-4">
                      <label className={styles.fieldLabel}>State *</label>
                      <input
                        type="text"
                        name="state"
                        className={`${styles.formInput} ${formErrors.state ? styles.error : ""}`}
                        placeholder="State"
                        value={formData.state}
                        onChange={handleInputChange}
                      />
                      {formErrors.state && (
                        <span className={styles.errorMessage}>
                          {formErrors.state}
                        </span>
                      )}
                    </div>

                    <div className="col-md-4">
                      <label className={styles.fieldLabel}>Pincode *</label>
                      <input
                        type="text"
                        name="pincode"
                        className={`${styles.formInput} ${formErrors.pincode ? styles.error : ""}`}
                        placeholder="6-digit pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        maxLength="6"
                      />
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
                    </label>
                  </div>

                  <div className={styles.paymentButton}>
                    {formData.paymentMethod === "razorpay" ? (
                      <RazorpayPayment
                        amount={calculatePrice()}
                        buttonText={`Pay ₹${calculatePrice()}`}
                        themeColor="#3496cb"
                        customerDetails={{
                          name: formData.fullName,
                          email: formData.email,
                          phone: formData.phone,
                          address: formData.address,
                          size,
                          thickness,
                          productType: product?.type || "square",
                        }}
                        onSuccess={() =>
                          showNotification(
                            "Payment successful! Thank you for your order.",
                            "success",
                          )
                        }
                        onError={() =>
                          showNotification(
                            "Payment failed. Please try again.",
                            "error",
                          )
                        }
                      />
                    ) : (
                      <GPayButton
                        amount={calculatePrice()}
                        onSuccess={() =>
                          showNotification(
                            "Payment successful! Thank you for your order.",
                            "success",
                          )
                        }
                        onError={() =>
                          showNotification(
                            "Payment failed. Please try again.",
                            "error",
                          )
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

  return (
    <>
      <div className={styles.productClient}>
        {renderStepIndicator()}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        {/* Success Modal */}
        <div
          className="modal fade"
          id="successModal"
          tabIndex="-1"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h5 className={styles.modalTitle}>
                  <i className="bi bi-check-circle-fill me-2"></i>
                  Order Confirmed!
                </h5>
                <button
                  type="button"
                  className={styles.modalClose}
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.modalIcon}>
                  <i className="bi bi-check-circle-fill"></i>
                </div>
                <h6 className={styles.modalThankYou}>
                  Thank you for your order!
                </h6>
                <p className={styles.modalMessage}>
                  Your {product?.name || "Square"} acrylic photo order has been
                  placed successfully. You will receive a confirmation email
                  shortly.
                </p>
                <div className={styles.modalOrderDetails}>
                  <div className={styles.modalDetailRow}>
                    <span>Order ID</span>
                    <span className={styles.modalDetailValue}>
                      {orderId || "Loading..."}
                    </span>
                  </div>
                  <div className={styles.modalDetailRow}>
                    <span>Total Amount</span>
                    <span className={styles.modalDetailValue}>
                      ₹{calculatePrice()}
                    </span>
                  </div>
                  <div className={styles.modalDetailRow}>
                    <span>Estimated Delivery</span>
                    <span className={styles.modalDetailValue}>
                      {estimatedDeliveryDate || "3-5 business days"}
                    </span>
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.modalButton}
                  data-bs-dismiss="modal"
                >
                  <i className="bi bi-check me-2"></i>
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>

        {showToast.visible && (
          <div className={`${styles.toast} ${styles[showToast.type]}`}>
            <div className={styles.toastIcon}>
              <i
                className={`bi ${
                  showToast.type === "success"
                    ? "bi-check-circle"
                    : showToast.type === "error"
                      ? "bi-exclamation-circle"
                      : showToast.type === "warning"
                        ? "bi-exclamation-triangle"
                        : "bi-info-circle"
                }`}
              ></i>
            </div>
            <div className={styles.toastContent}>
              <strong className={styles.toastTitle}>{showToast.title}</strong>
              <p className={styles.toastMessage}>{showToast.message}</p>
            </div>
            <button
              className={styles.toastClose}
              onClick={() =>
                setShowToast({
                  visible: false,
                  type: "",
                  title: "",
                  message: "",
                })
              }
            >
              <i className="bi bi-x"></i>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import styles from "../../../assest/style/ProductClient.module.css";
import GPayButton from "../../../Components/GPayButton";
import RazorpayPayment from "../../../Components/payment/Razorpay";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function ProductClient({ product }) {
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

  const [size, setSize] = useState(product?.defaultSize || "8x10");
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

  const sizeOptions = product?.sizeOptions || [
    "8x10",
    "11x14",
    "16x20",
    "20x24",
    "24x36",
  ];

  const thicknessOptions = product?.thicknessOptions || ["3mm", "5mm", "8mm"];

  const frameDimensions = product?.frameDimensions || {
    "8x10": { width: 180, height: 220 },
    "11x14": { width: 220, height: 280 },
    "16x20": { width: 280, height: 340 },
    "20x24": { width: 320, height: 380 },
    "24x36": { width: 360, height: 480 },
  };

  const basePrice = product?.basePrice || 799;
  const priceIncrement = product?.priceIncrement || 150;
  const themeColor = product?.themeColor || "#3496cb";
  const roomWallBackground =
    product?.backgroundImage ||
    "https://res.cloudinary.com/dsprfys3x/image/upload/v1773634493/Gemini_Generated_Image_g2ds8ig2ds8ig2ds_puojbl.png";

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js").catch((err) =>
      console.error("Failed to load Bootstrap JS:", err)
    );
  }, []);

  useEffect(() => {
    setOrderId(`#ORD${Math.floor(Math.random() * 10000)}`);
  }, []);

  useEffect(() => {
    setSize(product?.defaultSize || "8x10");
  }, [product]);

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

    if (sizeIndex > 0) price += sizeIndex * priceIncrement;
    if (thickness === "5mm") price += 150;
    if (thickness === "8mm") price += 300;

    return price * quantity;
  }, [basePrice, size, sizeOptions, thickness, quantity, priceIncrement]);

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
    setCurrentStep(1);
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
    setFormData((prev) => ({ ...prev, pincode: value }));
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

    showNotification("Details saved successfully!", "success");
  };

  const goToStep = (step) => {
    if (step === 2 && !uploadedImage) {
      showNotification("Please upload an image first", "warning");
      return;
    }

    if (step === 3) {
      const errors = validateForm();
      if (!uploadedImage) {
        showNotification("Please upload an image first", "warning");
        return;
      }
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        showNotification("Please fill all required fields correctly", "error");
        return;
      }
    }

    setCurrentStep(step);
  };

  const getSummaryFrameSize = () => {
    const dim = frameDimensions[size];
    if (!dim) return { width: 90, height: 112 };

    const scale = 0.5;
    return {
      width: Math.max(80, dim.width * scale),
      height: Math.max(100, dim.height * scale),
    };
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
                type="button"
              >
                <span className={styles.stepNumber}>
                  {currentStep > step ? <i className="bi bi-check-lg"></i> : step}
                </span>
                <span className={styles.stepLabel}>
                  {step === 1
                    ? "Upload & Edit"
                    : step === 2
                    ? "Customize"
                    : "Payment"}
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
      <div className="container py-4">
        <div className="row g-4">
          <div className="col-lg-7">
            <div className={styles.uploadCard}>
              <h2 className="mb-3">{product?.name || "Product Customization"}</h2>
              <p className="text-muted">{product?.description || "Upload and customize your photo."}</p>

              <div
                ref={dropZoneRef}
                className={`${styles.uploadZone} ${isDragging ? styles.dragging : ""}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
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
                        padding: "20px",
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

                    <div className="d-flex gap-2 mt-3">
                      <button
                        className="btn btn-outline-danger"
                        onClick={handleRemoveImage}
                        type="button"
                      >
                        Remove Image
                      </button>

                      <button
                        className="btn btn-primary"
                        onClick={() => goToStep(2)}
                        type="button"
                      >
                        Go to Customize Step
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.uploadPrompt}>
                    <div className={styles.uploadIcon}>
                      <i className={`bi ${isDragging ? "bi-file-earmark-arrow-up" : "bi-cloud-upload"}`}></i>
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
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h4 className="mb-3">Live Preview</h4>
                <div
                  style={{
                    backgroundImage: `url(${roomWallBackground})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    minHeight: "420px",
                    borderRadius: "12px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {uploadedImage ? (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: `${getSummaryFrameSize().width}px`,
                          height: `${getSummaryFrameSize().height}px`,
                          border: "10px solid #fff",
                          boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
                          backgroundImage: `url(${uploadedImage})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          borderRadius: "6px",
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        height: "100%",
                        minHeight: "420px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "#fff",
                        fontWeight: 600,
                        background: "rgba(0,0,0,0.25)",
                      }}
                    >
                      Upload an image to preview
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  <h5 className="mb-2">Product</h5>
                  <p className="mb-1"><strong>Name:</strong> {product?.name}</p>
                  <p className="mb-1"><strong>Base Price:</strong> ₹{basePrice}</p>
                  <p className="mb-0"><strong>Order ID:</strong> {orderId}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className={styles.stepContainer}>
      <div className="container py-4">
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h3 className="mb-4">Customize Your Order</h3>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Size</label>
                    <select
                      className="form-select"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                    >
                      {sizeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Thickness</label>
                    <select
                      className="form-select"
                      value={thickness}
                      onChange={(e) => setThickness(e.target.value)}
                    >
                      {thicknessOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Quantity</label>
                    <input
                      className="form-control"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Pincode</label>
                    <div className="d-flex gap-2">
                      <input
                        className="form-control"
                        type="text"
                        value={pincode}
                        onChange={handlePincodeChange}
                        placeholder="Enter pincode"
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
                      <div
                        className={`mt-2 small ${
                          deliveryStatus.type === "success"
                            ? "text-success"
                            : "text-danger"
                        }`}
                      >
                        {deliveryStatus.message}
                      </div>
                    )}
                    {estimatedDeliveryDate && (
                      <div className="small text-muted mt-1">
                        Estimated delivery: {estimatedDeliveryDate}
                      </div>
                    )}
                  </div>
                </div>

                <hr className="my-4" />

                <h4 className="mb-3">Customer Details</h4>
                <form onSubmit={handleSubmitOrder}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <input
                        className="form-control"
                        placeholder="Full Name"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                      />
                      {formErrors.fullName && (
                        <div className="text-danger small mt-1">{formErrors.fullName}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <input
                        className="form-control"
                        placeholder="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                      {formErrors.email && (
                        <div className="text-danger small mt-1">{formErrors.email}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <input
                        className="form-control"
                        placeholder="Phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                      {formErrors.phone && (
                        <div className="text-danger small mt-1">{formErrors.phone}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <input
                        className="form-control"
                        placeholder="Alternate Phone"
                        name="alternatePhone"
                        value={formData.alternatePhone}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="col-12">
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                      />
                      {formErrors.address && (
                        <div className="text-danger small mt-1">{formErrors.address}</div>
                      )}
                    </div>

                    <div className="col-12">
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Alternate Address"
                        name="alternateAddress"
                        value={formData.alternateAddress}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="col-md-4">
                      <input
                        className="form-control"
                        placeholder="City"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                      {formErrors.city && (
                        <div className="text-danger small mt-1">{formErrors.city}</div>
                      )}
                    </div>

                    <div className="col-md-4">
                      <input
                        className="form-control"
                        placeholder="State"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                      />
                      {formErrors.state && (
                        <div className="text-danger small mt-1">{formErrors.state}</div>
                      )}
                    </div>

                    <div className="col-md-4">
                      <input
                        className="form-control"
                        placeholder="Pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                      />
                      {formErrors.pincode && (
                        <div className="text-danger small mt-1">{formErrors.pincode}</div>
                      )}
                    </div>
                  </div>

                  <div className="d-flex gap-2 mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => goToStep(1)}
                    >
                      Back
                    </button>

                    <button type="submit" className="btn btn-outline-primary">
                      Save Details
                    </button>

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => goToStep(3)}
                    >
                      Go to Payment Step
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h4 className="mb-3">Order Summary</h4>
                <p className="mb-2"><strong>Product:</strong> {product?.name}</p>
                <p className="mb-2"><strong>Size:</strong> {size}</p>
                <p className="mb-2"><strong>Thickness:</strong> {thickness}</p>
                <p className="mb-2"><strong>Quantity:</strong> {quantity}</p>
                <p className="mb-0"><strong>Total:</strong> ₹{calculatePrice()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className={styles.stepContainer}>
      <div className="container py-4">
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h3 className="mb-4">Payment</h3>

                <div className="mb-4">
                  <p className="mb-2"><strong>Product:</strong> {product?.name}</p>
                  <p className="mb-2"><strong>Size:</strong> {size}</p>
                  <p className="mb-2"><strong>Thickness:</strong> {thickness}</p>
                  <p className="mb-2"><strong>Quantity:</strong> {quantity}</p>
                  <p className="mb-2"><strong>Name:</strong> {formData.fullName}</p>
                  <p className="mb-2"><strong>Phone:</strong> {formData.phone}</p>
                  <p className="mb-2"><strong>Address:</strong> {formData.address}</p>
                  <h4 className="mt-3">Total: ₹{calculatePrice()}</h4>
                </div>

                <div className="mb-3">
                  <label className="form-label">Select Payment Method</label>
                  <select
                    className="form-select"
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        paymentMethod: e.target.value,
                      }))
                    }
                  >
                    <option value="razorpay">Razorpay</option>
                    <option value="gpay">Google Pay</option>
                  </select>
                </div>

                <div className="d-flex gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => goToStep(2)}
                  >
                    Back
                  </button>
                </div>

                <div className="mt-4">
                  {formData.paymentMethod === "razorpay" ? (
                    <RazorpayPayment
                      amount={calculatePrice()}
                      buttonText={`Pay ₹${calculatePrice()}`}
                      themeColor={themeColor}
                      customerDetails={{
                        name: formData.fullName,
                        fullName: formData.fullName,
                        email: formData.email,
                        phone: formData.phone,
                        address: formData.address,
                        city: formData.city,
                        state: formData.state,
                        pincode: formData.pincode,
                        size,
                        thickness,
                        quantity,
                        productType: "portrait",
                        productName: product?.name || "Portrait Print",
                      }}
                      onSuccess={() => alert("Payment Success")}
                      onError={(msg) => alert(msg || "Payment Failed")}
                    />
                  ) : (
                    <GPayButton amount={calculatePrice()} />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h4 className="mb-3">Final Preview</h4>
                <div
                  style={{
                    backgroundImage: `url(${roomWallBackground})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    minHeight: "420px",
                    borderRadius: "12px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {uploadedImage ? (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: `${getSummaryFrameSize().width}px`,
                          height: `${getSummaryFrameSize().height}px`,
                          border: "10px solid #fff",
                          boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
                          backgroundImage: `url(${uploadedImage})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          borderRadius: "6px",
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        height: "100%",
                        minHeight: "420px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "#fff",
                        fontWeight: 600,
                        background: "rgba(0,0,0,0.25)",
                      }}
                    >
                      No image uploaded
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {showToast.visible && (
          <div
            className={`toast show position-fixed bottom-0 end-0 m-3 text-bg-${
              showToast.type === "success"
                ? "success"
                : showToast.type === "error"
                ? "danger"
                : showToast.type === "warning"
                ? "warning"
                : "primary"
            }`}
            role="alert"
            style={{ zIndex: 9999 }}
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
              />
            </div>
            <div className="toast-body">{showToast.message}</div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.productClient}>
      {renderStepIndicator()}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
    </div>
  );
}
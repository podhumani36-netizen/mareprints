"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import styles from "../../../assest/style/ProductClient.module.css";
import GPayButton from "../../../Components/GPayButton";
import RazorpayPayment from "../../../Components/payment/Razorpay";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function ProductClientCutout({ product }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [showToast, setShowToast] = useState({
    visible: false,
    type: "",
    title: "",
    message: "",
  });

  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  const [backgroundRemoved, setBackgroundRemoved] = useState(false);

  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const displayImageRef = useRef(null);

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

  const thicknessOptions = ["3mm", "5mm", "8mm"];
  const basePrice = product?.basePrice || 999;

  const BACKGROUND_REMOVAL_API_KEY = "4ZYh4wnqm1XNzeFEPMcpsYMk";
  const BACKGROUND_REMOVAL_API_URL = "https://api.remove.bg/v1.0/removebg";

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js")
      .then(() => console.log("Bootstrap JS loaded"))
      .catch((err) => console.error("Failed to load Bootstrap JS:", err));
  }, []);

  useEffect(() => {
    setOrderId(`#ORD${Math.floor(Math.random() * 10000)}`);
  }, []);

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

    if (sizeIndex > 0) {
      price += sizeIndex * (product?.priceIncrement || 200);
    }

    if (thickness === "5mm") price += 150;
    if (thickness === "8mm") price += 300;

    return price * quantity;
  }, [size, thickness, sizeOptions, basePrice, quantity, product]);

  const totalAmount = calculatePrice() + (product?.cutoutPremium || 199);

  const autoRemoveBackground = async (imageDataURL) => {
    setIsRemovingBackground(true);

    try {
      const blob = await fetch(imageDataURL).then((res) => res.blob());

      const bgFormData = new FormData();
      bgFormData.append("image_file", blob, "image.png");
      bgFormData.append("size", "auto");

      const response = await fetch(BACKGROUND_REMOVAL_API_URL, {
        method: "POST",
        headers: {
          "X-Api-Key": BACKGROUND_REMOVAL_API_KEY,
        },
        body: bgFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.errors?.[0]?.title || "Background removal failed"
        );
      }

      const resultBlob = await response.blob();

      const reader = new FileReader();
      const resultDataURL = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(resultBlob);
      });

      setUploadedImage(resultDataURL);
      setBackgroundRemoved(true);
      showNotification("Background removed successfully!", "success");
    } catch (error) {
      console.error("Background removal failed:", error);
      showNotification("Using original image", "warning");
      setUploadedImage(imageDataURL);
    } finally {
      setIsRemovingBackground(false);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const processFile = (file) => {
    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target.result;
      setOriginalImage(result);
      autoRemoveBackground(result);
      setIsProcessing(false);
    };

    reader.onerror = () => {
      setIsProcessing(false);
      showNotification("Failed to read file. Please try again.", "error");
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

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

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setOriginalImage(null);
    setBackgroundRemoved(false);

    if (fileInputRef.current) fileInputRef.current.value = "";

    setCurrentStep(1);
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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      errors.phone = "Phone must be 10 digits";
    }

    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.state.trim()) errors.state = "State is required";

    if (!formData.pincode.trim()) {
      errors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      errors.pincode = "Pincode must be 6 digits";
    }

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
    if ((step === 2 || step === 3) && !uploadedImage && !originalImage) {
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
                disabled={step > 1 && !uploadedImage && !originalImage}
                type="button"
              >
                <span className={styles.stepNumber}>
                  {currentStep > step ? <i className="bi bi-check-lg"></i> : step}
                </span>
                <span className={styles.stepLabel}>
                  {step === 1
                    ? "Upload"
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

  const renderUploadSection = () => (
    <div className={styles.uploadCard}>
      <h4 className="mb-3">
        <i className="bi bi-image me-2"></i>
        Upload Your Photo
      </h4>

      <div
        ref={dropZoneRef}
        className={styles.uploadZone}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ minHeight: "400px", cursor: "pointer" }}
      >
        {!uploadedImage && !originalImage ? (
          <div className="text-center p-5">
            <div className="mb-3">
              <i className="bi bi-cloud-upload fs-1 text-primary"></i>
            </div>
            <h5>Upload your photo</h5>
            <p className="text-muted">Drag & drop or click to browse</p>

            <button
              className="btn btn-primary"
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              <i className="bi bi-folder2-open me-2"></i>
              Browse Files
            </button>

            <small className="text-muted mt-3 d-block">
              JPG, PNG, GIF (Max 10MB)
            </small>

            {isProcessing && (
              <div className="mt-3">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Processing image...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3">
            <div className="position-relative">
              <img
                ref={displayImageRef}
                src={uploadedImage || originalImage || ""}
                className="img-fluid rounded"
                style={{
                  maxHeight: "400px",
                  width: "100%",
                  objectFit: "contain",
                  backgroundColor: "#f5f5f5",
                  display: uploadedImage || originalImage ? "block" : "none",
                }}
                alt="Preview"
              />

              <button
                className="position-absolute top-0 end-0 btn btn-danger btn-sm m-2"
                onClick={handleRemoveImage}
                type="button"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {isRemovingBackground && (
              <div className="mt-3 text-center">
                <div className="spinner-border text-success" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Removing background...</p>
              </div>
            )}

            {backgroundRemoved && !isRemovingBackground && (
              <div className="mt-3 p-2 bg-success bg-opacity-10 rounded text-success small text-center">
                <i className="bi bi-check-circle-fill me-1"></i>
                Background removed successfully!
              </div>
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
  );

  const renderSummaryCard = () => (
    <div className={styles.optionsCard}>
      <h4 className="mb-3">
        <i className="bi bi-receipt me-2"></i>
        Order Summary
      </h4>

      <div className="bg-light rounded p-3">
        <div className="d-flex justify-content-between py-2">
          <span>Base Price</span>
          <span>₹{calculatePrice()}</span>
        </div>

        <div className="d-flex justify-content-between py-2">
          <span>Cutout Premium</span>
          <span>₹{product?.cutoutPremium || 199}</span>
        </div>

        <hr className="my-2" />

        <div className="d-flex justify-content-between fw-bold fs-5 py-2">
          <span>Total</span>
          <span className="text-primary">₹{totalAmount}</span>
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="container py-4">
      <div className="row g-4">
        <div className="col-lg-7">{renderUploadSection()}</div>

        <div className="col-lg-5">
          <div className={styles.optionsCard}>
            <h4 className="mb-3">
              <i className="bi bi-stars me-2"></i>
              Upload & Continue
            </h4>

            <p className="text-muted">
              First upload your photo. After that you can customize size,
              thickness, shipping and payment.
            </p>

            {renderSummaryCard()}

            <button
              className="btn btn-primary w-100 mt-4 py-3 fw-bold"
              onClick={() => goToStep(2)}
              disabled={!uploadedImage && !originalImage}
              type="button"
            >
              Next Step
              <i className="bi bi-arrow-right ms-2"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="container py-4">
      <div className="row g-4">
        <div className="col-lg-6">{renderUploadSection()}</div>

        <div className="col-lg-6">
          <div className={styles.optionsCard}>
            <h4 className="mb-3">
              <i className="bi bi-sliders2 me-2"></i>
              Customize Your {product?.name || "Photo Print"}
            </h4>

            <div className="mb-4">
              <label className="form-label fw-bold">Acrylic Size (Inches)</label>
              <div className="d-flex flex-wrap gap-2 mt-2">
                {sizeOptions.map((opt) => (
                  <button
                    key={opt}
                    className={`btn ${
                      size === opt ? "btn-primary" : "btn-outline-primary"
                    }`}
                    onClick={() => setSize(opt)}
                    type="button"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold">Thickness</label>
              <div className="d-flex flex-wrap gap-2 mt-2">
                {thicknessOptions.map((opt) => (
                  <button
                    key={opt}
                    className={`btn ${
                      thickness === opt ? "btn-dark" : "btn-outline-dark"
                    }`}
                    onClick={() => setThickness(opt)}
                    type="button"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold">Quantity</label>
              <div className="d-flex align-items-center gap-3 mt-2">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  type="button"
                >
                  <i className="bi bi-dash-lg"></i>
                </button>

                <span className="fw-bold fs-5">{quantity}</span>

                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  type="button"
                >
                  <i className="bi bi-plus-lg"></i>
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold">Price</label>

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
                <div className="mt-2 small text-muted">
                  Estimated delivery: {estimatedDeliveryDate}
                </div>
              )}
            </div>

            <div className="bg-light rounded p-3">
              <div className="d-flex justify-content-between py-2">
                <span>Base Price</span>
                <span>₹{calculatePrice()}</span>
              </div>

              <div className="d-flex justify-content-between py-2">
                <span>Cutout Premium</span>
                <span>₹{product?.cutoutPremium || 199}</span>
              </div>

              <hr className="my-2" />

              <div className="d-flex justify-content-between fw-bold fs-5 py-2">
                <span>Total</span>
                <span className="text-primary">₹{totalAmount}</span>
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
                disabled={!uploadedImage && !originalImage}
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
  );

  const renderStep3 = () => (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-10">
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
                    className={`form-control ${
                      formErrors.fullName ? "is-invalid" : ""
                    }`}
                    value={formData.fullName}
                    onChange={handleInputChange}
                  />
                  {formErrors.fullName && (
                    <div className="invalid-feedback">
                      {formErrors.fullName}
                    </div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    className={`form-control ${
                      formErrors.email ? "is-invalid" : ""
                    }`}
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
                    className={`form-control ${
                      formErrors.phone ? "is-invalid" : ""
                    }`}
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
                    className={`form-control ${
                      formErrors.address ? "is-invalid" : ""
                    }`}
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
                    className={`form-control ${
                      formErrors.city ? "is-invalid" : ""
                    }`}
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
                    className={`form-control ${
                      formErrors.state ? "is-invalid" : ""
                    }`}
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
                    className={`form-control ${
                      formErrors.pincode ? "is-invalid" : ""
                    }`}
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
                        productType: product?.type || "cutout",
                        productName: product?.name || "Cutout Print",
                      }}
                      onSuccess={() => {
                        showNotification(
                          "Payment successful! Thank you for your order.",
                          "success"
                        );

                        if (typeof window !== "undefined" && window.bootstrap) {
                          const modalEl =
                            document.getElementById("successModal");
                          if (modalEl) {
                            const modal = new window.bootstrap.Modal(modalEl);
                            modal.show();
                          }
                        }
                      }}
                      onError={() =>
                        showNotification(
                          "Payment failed. Please try again.",
                          "error"
                        )
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
                          const modalEl =
                            document.getElementById("successModal");
                          if (modalEl) {
                            const modal = new window.bootstrap.Modal(modalEl);
                            modal.show();
                          }
                        }
                      }}
                      onError={() =>
                        showNotification(
                          "Payment failed. Please try again.",
                          "error"
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
  );

  return (
    <>
      <div className={styles.productClient}>
        {renderStepIndicator()}

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>

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

              <h6 className={styles.modalThankYou}>Thank you for your order!</h6>

              <p className={styles.modalMessage}>
                Your {product?.name || "Photo"} acrylic cutout order has been
                placed successfully. You will receive a confirmation email
                shortly.
              </p>

              <div className={styles.modalOrderDetails}>
                <div className={styles.orderDetailRow}>
                  <span>Order ID:</span>
                  <strong>{orderId}</strong>
                </div>

                <div className={styles.orderDetailRow}>
                  <span>Total Amount:</span>
                  <strong>₹{totalAmount}</strong>
                </div>

                <div className={styles.orderDetailRow}>
                  <span>Estimated Delivery:</span>
                  <strong>{estimatedDeliveryDate || "3-5 business days"}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </>
  );
}
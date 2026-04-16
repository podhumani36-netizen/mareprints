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

  const [orientation, setOrientation] = useState("portrait");

  const [size, setSize] = useState("20x24");
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

  // Derived values for the currently active image — keeps the rest of the code unchanged
  const uploadedImage = uploadedImages[currentImageIndex] ?? null;
  const zoom = imageStates[currentImageIndex]?.zoom ?? 1;
  const imageOffset = imageStates[currentImageIndex]?.offset ?? { x: 0, y: 0 };

  // Use a ref so event-listener closures always read the current index without stale closure issues
  const currentImageIndexRef = useRef(currentImageIndex);
  useEffect(() => { currentImageIndexRef.current = currentImageIndex; }, [currentImageIndex]);

  const setZoom = (val) => {
    setImageStates((prev) => {
      const updated = [...prev];
      const cur = updated[currentImageIndexRef.current] ?? { zoom: 1, offset: { x: 0, y: 0 } };
      updated[currentImageIndexRef.current] = {
        ...cur,
        zoom: typeof val === "function" ? val(cur.zoom) : val,
      };
      return updated;
    });
  };

  const setImageOffset = (val) => {
    setImageStates((prev) => {
      const updated = [...prev];
      const cur = updated[currentImageIndexRef.current] ?? { zoom: 1, offset: { x: 0, y: 0 } };
      updated[currentImageIndexRef.current] = {
        ...cur,
        offset: typeof val === "function" ? val(cur.offset) : val,
      };
      return updated;
    });
  };

  const sizeOptions = {
    portrait:  ["8x10", "10x12", "12x16", "16x18", "18x22", "20x24", "20x30", "23x34", "custom"],
    landscape: ["10x8", "12x10", "16x12", "18x16", "22x18", "24x20", "30x20", "34x23", "custom"],
    circle:    ["12x12", "15x15", "18x18", "22x22", "custom"],
    square:    ["12x12", "15x15", "18x18", "22x22", "custom"],
    heart:     ["12x12", "15x15", "18x18", "22x22", "custom"],
  };

  const thicknessOptions = ["3mm", "5mm", "8mm"];

  const frameDimensions = {
    // portrait
    "8x10":  { width: 80,  height: 100 },
    "10x12": { width: 100, height: 120 },
    "12x16": { width: 120, height: 160 },
    "16x18": { width: 160, height: 180 },
    "18x22": { width: 180, height: 220 },
    "20x24": { width: 200, height: 240 },
    "20x30": { width: 200, height: 300 },
    "23x34": { width: 230, height: 340 },
    // landscape (flipped)
    "10x8":  { width: 100, height: 80  },
    "12x10": { width: 120, height: 100 },
    "16x12": { width: 160, height: 120 },
    "18x16": { width: 180, height: 160 },
    "22x18": { width: 220, height: 180 },
    "24x20": { width: 240, height: 200 },
    "30x20": { width: 300, height: 200 },
    "34x23": { width: 340, height: 230 },
    // square / circle
    "12x12": { width: 120, height: 120 },
    "15x15": { width: 150, height: 150 },
    "18x18": { width: 180, height: 180 },
    "22x22": { width: 220, height: 220 },
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
    };
  }, [uploadedImage, currentImageIndex]);

  useEffect(() => {
    if (orientation === "portrait") setSize("20x24");
    else if (orientation === "landscape") setSize("24x20");
    else setSize("18x18"); // circle / square / heart
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

  const generateMailPreviewImageFor = async (imgSrc, imgZoom, imgOffset) => {
    try {
      if (!imgSrc) return "";

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imgSrc;

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

      const drawHeartPath = (ctx, x, y, w, h) => {
        const mx = x + w / 2;
        ctx.moveTo(mx, y + h * 0.88);
        ctx.bezierCurveTo(x + w * 0.1, y + h * 0.70, x, y + h * 0.55, x, y + h * 0.35);
        ctx.bezierCurveTo(x, y + h * 0.10, x + w * 0.20, y, x + w * 0.40, y);
        ctx.bezierCurveTo(x + w * 0.46, y, mx, y + h * 0.25, mx, y + h * 0.25);
        ctx.bezierCurveTo(mx, y + h * 0.25, x + w * 0.54, y, x + w * 0.60, y);
        ctx.bezierCurveTo(x + w * 0.80, y, x + w, y + h * 0.10, x + w, y + h * 0.35);
        ctx.bezierCurveTo(x + w, y + h * 0.55, x + w * 0.90, y + h * 0.70, mx, y + h * 0.88);
        ctx.closePath();
      };

      // 1. Depth / thickness layer — same gradient as live preview, offset bottom-right
      ctx.save();
      ctx.beginPath();
      if (orientation === "circle") {
        ctx.ellipse(fx + depthPx + frameW / 2, fy + depthPx + frameH / 2, frameW / 2, frameH / 2, 0, 0, Math.PI * 2);
      } else if (orientation === "heart") {
        drawHeartPath(ctx, fx + depthPx, fy + depthPx, frameW, frameH);
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
      } else if (orientation === "heart") {
        drawHeartPath(ctx, fx, fy, frameW, frameH);
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
      } else if (orientation === "heart") {
        drawHeartPath(ctx, fx, fy, frameW, frameH);
      } else {
        ctx.rect(fx, fy, frameW, frameH);
      }
      ctx.clip();

      // objectFit: contain — same as the CSS in the live preview
      const baseScale  = Math.min(frameW / img.width, frameH / img.height);
      const finalScale = baseScale * imgZoom;
      const drawWidth  = img.width  * finalScale;
      const drawHeight = img.height * finalScale;
      const dx = fx + (frameW - drawWidth)  / 2 + imgOffset.x * S;
      const dy = fy + (frameH - drawHeight) / 2 + imgOffset.y * S;

      ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
      ctx.restore();

      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Preview capture failed:", error);
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

    reader.onload = (event) => {
      const dataUrl = event.target.result;
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
      showNotification("Image added successfully!", "success");
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

    const files = Array.from(e.dataTransfer.files || []);
    if (!files.length) return;

    let hasInvalid = false;
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) { hasInvalid = true; return; }
      if (file.size > 10 * 1024 * 1024) {
        showNotification(`${file.name} exceeds 10MB limit`, "error");
        return;
      }
      processFile(file);
    });
    if (hasInvalid) showNotification("Only image files are supported", "error");
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        showNotification(`${file.name} exceeds 10MB limit`, "error");
        return;
      }
      if (!file.type.startsWith("image/")) {
        showNotification("Please upload an image file", "error");
        return;
      }
      processFile(file);
    });
    // Reset so the same file(s) can be re-selected later
    e.target.value = "";
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3));
    setIsPaymentReady(false);
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 1));
    setIsPaymentReady(false);
  };

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

  const previews = await generateAllMailPreviewImages();
  setMailPreviewImages(previews);
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
        previewImage: mailPreviewImages[0] || "",
        uploadedImage: uploadedImages[0] || "",
        previewImages: mailPreviewImages,
        uploadedImages,
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
    if (step === 2 && uploadedImages.length === 0) {
      showNotification("Please upload at least one image first", "warning");
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
                disabled={step > 1 && uploadedImages.length === 0}
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
    <div style={{
      marginTop: "10px",
      padding: "10px 14px",
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
      borderRadius: "14px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      flexWrap: "wrap",
    }}>
      {/* Zoom out */}
      <button type="button" onClick={handleZoomOut} style={{
        width: "34px", height: "34px", borderRadius: "8px",
        border: "1.5px solid #e2e8f0", background: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "14px", cursor: "pointer", color: "#334155", flexShrink: 0,
      }}><i className="bi bi-dash-lg" /></button>

      {/* Zoom slider */}
      <div style={{ flex: 1, minWidth: "80px", display: "flex", alignItems: "center", gap: "8px" }}>
        <input
          type="range" min="1" max="3" step="0.05" value={zoom}
          onChange={(e) => { setZoom(Number(e.target.value)); setIsPaymentReady(false); }}
          style={{ flex: 1, cursor: "pointer", accentColor: "#2563eb" }}
        />
        <span style={{
          fontSize: "11px", fontWeight: 700, color: "#2563eb",
          background: "#eff6ff", border: "1px solid #bfdbfe",
          borderRadius: "6px", padding: "3px 7px", whiteSpace: "nowrap",
        }}>{Math.round(zoom * 100)}%</span>
      </div>

      {/* Zoom in */}
      <button type="button" onClick={handleZoomIn} style={{
        width: "34px", height: "34px", borderRadius: "8px",
        border: "1.5px solid #e2e8f0", background: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "14px", cursor: "pointer", color: "#334155", flexShrink: 0,
      }}><i className="bi bi-plus-lg" /></button>

      {/* Reset */}
      <button type="button" onClick={() => { setZoom(1); setImageOffset({ x: 0, y: 0 }); setIsPaymentReady(false); }} style={{
        height: "34px", borderRadius: "8px",
        border: "1.5px solid #e2e8f0", background: "#fff",
        padding: "0 12px", fontSize: "12px", fontWeight: 600,
        cursor: "pointer", color: "#475569", whiteSpace: "nowrap", flexShrink: 0,
      }}>
        <i className="bi bi-arrow-counterclockwise me-1" />Reset
      </button>
    </div>
  );

  // Heart uses smooth SVG clipPath (defined once in the return JSX)
  const heartClip = "url(#pcHeartClip)";

  const renderBetterPreview = (useWall = false) => {
    const isCircle = orientation === "circle";
    const isHeart  = orientation === "heart";
    const shapeRadius = isCircle ? "50%" : "0px";
    const shapeClip   = isHeart ? heartClip : "none";

    let widthInch, heightInch, frameAR;
    if (size === "custom") {
      widthInch  = parseFloat(customSize.width)  || 10;
      heightInch = parseFloat(customSize.height) || 10;
    } else {
      [widthInch, heightInch] = size.split("x").map(Number);
    }
    frameAR = widthInch / heightInch; // aspect ratio

    const depthPx  = thickness === "3mm" ? 5 : thickness === "5mm" ? 8 : 12;
    const depthBg  = thickness === "3mm"
      ? "linear-gradient(145deg,#c8c8c8,#888)"
      : thickness === "5mm"
      ? "linear-gradient(145deg,#b4b4b4,#777)"
      : "linear-gradient(145deg,#a0a0a0,#646464)";
    const shadowStr = thickness === "3mm"
      ? "0 16px 40px rgba(0,0,0,0.28)"
      : thickness === "5mm"
      ? "0 24px 56px rgba(0,0,0,0.34)"
      : "0 32px 72px rgba(0,0,0,0.42)";

    // Frame occupies 88% of container height (portrait) or 82% width (landscape/square)
    const isLandscape = frameAR > 1;
    const frameDim = isLandscape
      ? { width: "82%", height: "auto" }
      : { width: "auto", height: "88%" };

    return (
      <div
        className={styles.previewBox}
        style={{
          background: useWall
            ? `url('https://res.cloudinary.com/dsprfys3x/image/upload/q_auto/f_auto/v1776247395/BackRound.jpg_kiljam.jpg') center/cover no-repeat`
            : "linear-gradient(160deg,#eef2f7 0%,#dde4ee 100%)",
        }}
      >

        {/* Vignette */}
        {useWall && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
            background: "radial-gradient(ellipse at 50% 30%, transparent 45%, rgba(0,0,0,0.22) 100%)",
          }} />
        )}

        {/* ── Frame ── */}
        <div style={{
          position: "absolute",
          top: "5%",
          left: "50%",
          transform: "translateX(-50%)",
          ...frameDim,
          aspectRatio: `${widthInch} / ${heightInch}`,
          maxWidth: "88%",
          maxHeight: "90%",
          overflow: "visible",
          zIndex: 2,
        }}>
          {/* Depth / shadow layer */}
          <div style={{
            position: "absolute", inset: 0,
            transform: `translate(${depthPx}px, ${depthPx}px)`,
            borderRadius: shapeRadius,
            clipPath: shapeClip,
            background: depthBg,
            boxShadow: shadowStr,
            zIndex: 1,
          }} />

          {/* Front face — draggable */}
          <div
            style={{
              position: "absolute", inset: 0,
              borderRadius: shapeRadius,
              clipPath: shapeClip,
              background: "#fff",
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
                alt="preview"
                draggable={false}
                style={{
                  position: "absolute", top: "50%", left: "50%",
                  width: "100%", height: "100%", objectFit: "contain",
                  transform: `translate(calc(-50% + ${imageOffset.x}px), calc(-50% + ${imageOffset.y}px)) scale(${zoom})`,
                  transformOrigin: "center center",
                  transition: isImageDragging ? "none" : "transform 0.18s ease",
                  userSelect: "none", touchAction: "none", pointerEvents: "none",
                }}
              />
            ) : (
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                background: "linear-gradient(135deg,#f1f5f9,#e2e8f0)",
                color: "#94a3b8", gap: "8px",
              }}>
                <i className="bi bi-image" style={{ fontSize: "clamp(24px,5vw,36px)" }} />
                <span style={{ fontSize: "clamp(10px,2vw,13px)", fontWeight: 500 }}>Upload to preview</span>
              </div>
            )}
          </div>

          {/* Acrylic glass shine */}
          <div style={{
            position: "absolute", inset: 0,
            borderRadius: shapeRadius,
            clipPath: shapeClip,
            background: "linear-gradient(135deg,rgba(255,255,255,0.22) 0%,rgba(255,255,255,0.04) 50%,rgba(255,255,255,0.12) 100%)",
            pointerEvents: "none", zIndex: 3,
          }} />
        </div>

        {/* Info badges */}
        <div style={{
          position: "absolute", bottom: "10px", left: 0, right: 0,
          display: "flex", justifyContent: "center", gap: "8px",
          flexWrap: "wrap", padding: "0 10px", zIndex: 5,
        }}>
          {[
            size === "custom"
              ? `${customSize.width || "?"}×${customSize.height || "?"} in`
              : `${widthInch}×${heightInch} in`,
            thickness,
            orientation.charAt(0).toUpperCase() + orientation.slice(1),
          ].map((txt) => (
            <span key={txt} style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(8px)",
              padding: "4px 11px",
              borderRadius: "999px",
              fontSize: "clamp(9px,2vw,11px)",
              fontWeight: 600,
              color: "#0f172a",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              border: "1px solid rgba(255,255,255,0.7)",
            }}>{txt}</span>
          ))}
        </div>

      </div>
    );
  };

const renderSummaryPreview = () => {
  if (!uploadedImage) return null;
  return (
    <div style={{ width: "100%", marginBottom: "12px" }}>
      {renderBetterPreview(false)}
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
                {uploadedImages.length > 0 ? (
                  <div className={styles.previewContainer}>
                    {renderBetterPreview(false)}
                    {renderEditorControls()}

                    {/* Thumbnail strip */}
                    <div style={{
                      display: "flex", gap: "8px", flexWrap: "wrap",
                      marginTop: "10px", alignItems: "center",
                    }}>
                      {uploadedImages.map((src, i) => (
                        <div key={i} style={{ position: "relative", flexShrink: 0 }}>
                          <img
                            src={src}
                            alt={`Image ${i + 1}`}
                            onClick={() => { setCurrentImageIndex(i); setIsPaymentReady(false); }}
                            style={{
                              width: "52px", height: "52px", objectFit: "cover",
                              borderRadius: "8px", cursor: "pointer",
                              border: i === currentImageIndex
                                ? "2.5px solid #2563eb"
                                : "2px solid #e2e8f0",
                              opacity: i === currentImageIndex ? 1 : 0.7,
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(i)}
                            title="Remove"
                            style={{
                              position: "absolute", top: "-6px", right: "-6px",
                              width: "18px", height: "18px", borderRadius: "50%",
                              background: "#ef4444", color: "#fff", border: "none",
                              fontSize: "10px", cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              lineHeight: 1,
                            }}
                          >×</button>
                        </div>
                      ))}

                      {/* Add more button */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        title="Add another image"
                        style={{
                          width: "52px", height: "52px", borderRadius: "8px",
                          border: "2px dashed #94a3b8", background: "#f8fafc",
                          color: "#64748b", fontSize: "22px", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >+</button>
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
                      {isDragging ? "Drop your images here" : "Upload your images"}
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
                      Supported formats: JPG, PNG, GIF (Max 10MB each)
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
                  multiple
                  className="d-none"
                />
              </div>
            </div>

            {/* Mobile-only: Continue button below upload zone */}
            <div className="d-block d-lg-none mt-3">
              <button
                className={styles.nextButton}
                onClick={() => goToStep(2)}
                disabled={uploadedImages.length === 0}
                type="button"
                style={{ width: "100%" }}
              >
                Continue to Customize & Payment
                <i className="bi bi-arrow-right ms-2"></i>
              </button>
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

              {/* Desktop-only: Continue button inside guide card */}
              <button
                className={`${styles.nextButton} d-none d-lg-flex`}
                onClick={() => goToStep(2)}
                disabled={uploadedImages.length === 0}
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
      { value: "circle",    label: "Round",     icon: "bi-circle" },
      { value: "square",    label: "Square",    icon: "bi-square" },
      { value: "heart",     label: "Heart",     icon: "bi-heart" },
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
        <div className="container-fluid" style={{ maxWidth: "1400px" }}>
          <div className="row g-3 align-items-start">

            {/* ── LEFT: sticky live preview ── */}
            <div className={`col-12 col-lg-5 ${styles.step2PreviewCol}`}>
              <div style={{ ...sectionCardStyle, padding: "clamp(12px,3vw,20px)" }}>
                {sectionHeader("bi-display", "Live Preview", "Drag · pinch or slide to zoom")}
                {renderBetterPreview(true)}
                {renderEditorControls()}
              </div>
            </div>

            {/* ── RIGHT: all controls stacked ── */}
            <div className="col-12 col-lg-7">
              <div className="d-flex flex-column gap-3">

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

              {/* ── Order Summary + Contact (was right column) ── */}
              <div className="d-flex flex-column gap-3">

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
                            previewImages={mailPreviewImages}
                            uploadedImages={uploadedImages}
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

              </div>{/* end Order Summary + Contact column */}

              </div>{/* end right col flex wrapper */}
            </div>{/* end right col-lg-7 */}

          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* SVG clip-path defs — heart uses smooth bezier in objectBoundingBox coords */}
      <svg style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
        <defs>
          <clipPath id="pcHeartClip" clipPathUnits="objectBoundingBox">
            <path d="M 0.5 0.26 C 0.5 0.20, 0.45 0.12, 0.35 0.12 C 0.19 0.12, 0.08 0.26, 0.08 0.42 C 0.08 0.59, 0.21 0.71, 0.50 0.88 C 0.79 0.71, 0.92 0.59, 0.92 0.42 C 0.92 0.26, 0.81 0.12, 0.65 0.12 C 0.55 0.12, 0.50 0.20, 0.50 0.26 Z" />
          </clipPath>
        </defs>
      </svg>

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
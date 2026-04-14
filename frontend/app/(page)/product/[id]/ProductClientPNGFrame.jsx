"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "../../../assest/style/ProductClient.module.css";
import RazorpayPayment from "../../../Components/payment/Razorpay";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const WALL_MOCKUP =
  "https://res.cloudinary.com/dsprfys3x/image/upload/v1773637296/wmremove-transformed_f1xtnt.jpg";

const FRAMES = [
  { file: "tree-family-1.png", label: "Family Tree" },
  { file: "tree-family-2.png", label: "Family Tree II" },
  { file: "floral-round.png", label: "Floral Round" },
  { file: "leaf-tree-rounded.png", label: "Leaf Tree" },
  { file: "swirl-tree.png", label: "Swirl Tree" },
  { file: "birds-tree.png", label: "Birds & Tree" },
  { file: "full-tree-collage.png", label: "Full Tree Collage" },
  { file: "family-home-grid.png", label: "Family Home" },
  { file: "family-script-grid.png", label: "Family Script" },
  { file: "family-wide-2.png", label: "Family Wide" },
  { file: "gift-lasts-forever.png", label: "Gift Forever" },
  { file: "heart-family.png", label: "Heart Family" },
  { file: "vertical-family-grid.png", label: "Vertical Grid" },
  { file: "family-center-gridfamily-center-grid.png", label: "Family Center" },
  { file: "family-wide-1..png", label: "Family Wide I" },
  { file: "bottom-stand-grid.png", label: "Stand Grid" },
];

export default function ProductClientPNGFrame({ product }) {
  const router = useRouter();

  // ── Flow state ─────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFrame, setSelectedFrame] = useState(null);

  // ── Image state ────────────────────────────────────────────────────────────
  const [uploadedImage, setUploadedImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isImageDragging, setIsImageDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // ── Order / payment state ──────────────────────────────────────────────────
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

  // ── Refs ───────────────────────────────────────────────────────────────────
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // ── Product config ─────────────────────────────────────────────────────────
  const sizeOptions = product?.sizeOptions || ["8x10", "11x14", "16x20", "20x24"];
  const frameDimensions = product?.frameDimensions || {
    "8x10": { width: 180, height: 220 },
    "11x14": { width: 220, height: 280 },
    "16x20": { width: 280, height: 340 },
    "20x24": { width: 320, height: 380 },
  };
  const basePrice = product?.basePrice || 1299;
  const defaultSize = product?.defaultSize || sizeOptions[0];

  // ── Customize state ────────────────────────────────────────────────────────
  const [size, setSize] = useState(defaultSize);
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
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "razorpay",
  });
  const [formErrors, setFormErrors] = useState({});

  // ── Bootstrap JS ───────────────────────────────────────────────────────────
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js").catch(() => {});
  }, []);

  // ── Order ID ───────────────────────────────────────────────────────────────
  useEffect(() => {
    setOrderId(`#ORD${Math.floor(Math.random() * 9000 + 1000)}`);
  }, []);

  // ── Auth guard + pre-fill ──────────────────────────────────────────────────
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

  // ── Image drag (mouse + touch) ─────────────────────────────────────────────
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isImageDragging) return;
      setImageOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    };
    const handleTouchMove = (e) => {
      if (!isImageDragging || !e.touches?.length) return;
      const t = e.touches[0];
      setImageOffset({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y });
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

  // ── Helpers ────────────────────────────────────────────────────────────────
  const showNotification = (message, type = "info", title = "") => {
    const titles = { success: "Success", error: "Error", warning: "Warning" };
    setShowToast({
      visible: true,
      type,
      title: title || titles[type] || "Info",
      message,
    });
    setTimeout(
      () => setShowToast({ visible: false, type: "", title: "", message: "" }),
      3000
    );
  };

  const openSuccessModal = () => {
    if (typeof window !== "undefined" && window.bootstrap) {
      const el = document.getElementById("pngFrameSuccessModal");
      if (el) new window.bootstrap.Modal(el).show();
    }
  };

  const calculatePrice = useCallback(() => {
    let price = basePrice;
    const idx = sizeOptions.indexOf(size);
    if (idx > 0) price += idx * 150;
    if (thickness === "5mm") price += 150;
    if (thickness === "8mm") price += 300;
    return price * quantity;
  }, [basePrice, sizeOptions, size, thickness, quantity]);

  // Canvas export: user photo + frame PNG overlay
  const generateMailPreviewImage = async () => {
    try {
      if (!uploadedImage) return "";
      const dims = frameDimensions[size] || { width: 200, height: 200 };
      const S = 4;
      const frameW = dims.width * S;
      const frameH = dims.height * S;

      const canvas = document.createElement("canvas");
      canvas.width = frameW;
      canvas.height = frameH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return "";
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // 1. Draw user photo
      const photoImg = new Image();
      photoImg.crossOrigin = "anonymous";
      photoImg.src = uploadedImage;
      await new Promise((res, rej) => {
        photoImg.onload = res;
        photoImg.onerror = rej;
      });

      const baseScale = Math.min(
        frameW / photoImg.width,
        frameH / photoImg.height
      );
      const finalScale = baseScale * zoom;
      const drawW = photoImg.width * finalScale;
      const drawH = photoImg.height * finalScale;
      const dx = (frameW - drawW) / 2 + imageOffset.x * S;
      const dy = (frameH - drawH) / 2 + imageOffset.y * S;
      ctx.drawImage(photoImg, dx, dy, drawW, drawH);

      // 2. Draw frame PNG overlay on top
      if (selectedFrame) {
        const frameImg = new Image();
        frameImg.src = `/frames/${selectedFrame.file}`;
        await new Promise((res) => {
          frameImg.onload = res;
          frameImg.onerror = res;
        });
        ctx.drawImage(frameImg, 0, 0, frameW, frameH);
      }

      return canvas.toDataURL("image/png");
    } catch (err) {
      console.error("Preview capture failed:", err);
      return "";
    }
  };

  // ── File handling ──────────────────────────────────────────────────────────
  const processFile = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showNotification("File size must be less than 50MB", "error");
      return;
    }
    if (!file.type.startsWith("image/")) {
      showNotification("Please upload an image file", "error");
      return;
    }
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result);
      setZoom(1);
      setImageOffset({ x: 0, y: 0 });
      setIsProcessing(false);
      setIsPaymentReady(false);
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
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) processFile(file);
    else showNotification("Please upload an image file", "error");
  };
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleZoomIn = () => {
    setZoom((p) => Math.min(p + 0.1, 3));
    setIsPaymentReady(false);
  };
  const handleZoomOut = () => {
    setZoom((p) => Math.max(p - 0.1, 1));
    setIsPaymentReady(false);
  };
  const handleRemoveImage = () => {
    setUploadedImage(null);
    setZoom(1);
    setImageOffset({ x: 0, y: 0 });
    setIsPaymentReady(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    showNotification("Image removed", "warning");
  };

  const handleImageMouseDown = (e) => {
    e.preventDefault();
    if (!uploadedImage) return;
    setIsImageDragging(true);
    setDragStart({ x: e.clientX - imageOffset.x, y: e.clientY - imageOffset.y });
  };
  const handleImageTouchStart = (e) => {
    if (!uploadedImage || !e.touches?.length) return;
    const t = e.touches[0];
    setIsImageDragging(true);
    setDragStart({ x: t.clientX - imageOffset.x, y: t.clientY - imageOffset.y });
  };
  const handleImageTouchMove = (e) => {
    if (!isImageDragging || !e.touches?.length) return;
    e.preventDefault();
    const t = e.touches[0];
    setImageOffset({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y });
  };
  const handleImageTouchEnd = () => setIsImageDragging(false);

  // ── Form ───────────────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === "phone" || name === "alternatePhone")
      v = value.replace(/\D/g, "").slice(0, 10);
    if (name === "pincode") v = value.replace(/\D/g, "").slice(0, 6);
    setFormData((prev) => ({ ...prev, [name]: v }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
    if (name !== "paymentMethod") setIsPaymentReady(false);
  };

  const validateForm = () => {
    const e = {};
    if (!formData.fullName.trim()) e.fullName = "Full name is required";
    if (!formData.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Invalid email format";
    if (!formData.phone.trim()) e.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone)) e.phone = "Phone must be 10 digits";
    if (formData.alternatePhone?.trim() && !/^\d{10}$/.test(formData.alternatePhone))
      e.alternatePhone = "Alternate phone must be 10 digits";
    if (!formData.address.trim()) e.address = "Address is required";
    if (!formData.city.trim()) e.city = "City is required";
    if (!formData.state.trim()) e.state = "State is required";
    if (!formData.pincode.trim()) e.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(formData.pincode)) e.pincode = "Pincode must be 6 digits";
    return e;
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
    if (typeof window !== "undefined") {
      const existing = localStorage.getItem("mareprints_orders");
      const orders = existing ? JSON.parse(existing) : [];
      orders.unshift({
        id: Date.now(),
        order: orderId,
        date: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        status: "Confirmed",
        productName: `${selectedFrame?.label || "Framed"} Print (${size})`,
        size,
        thickness,
        quantity,
        amount: calculatePrice(),
        payment_id: paymentData?.razorpay_payment_id || "",
      });
      localStorage.setItem("mareprints_orders", JSON.stringify(orders));
    }
    showNotification("Payment successful! Thank you for your order.", "success");
    openSuccessModal();
    setIsPaymentReady(false);
  };

  const handlePaymentError = () =>
    showNotification("Payment failed. Please try again.", "error");

  const goToStep = (step) => {
    if (step === 2 && !selectedFrame) {
      showNotification("Please select a frame first", "warning");
      return;
    }
    if (step === 3 && !uploadedImage) {
      showNotification("Please upload an image first", "warning");
      return;
    }
    setCurrentStep(step);
  };

  // ── Shared styles ──────────────────────────────────────────────────────────
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
        style={{ marginTop: "6px", fontSize: "13px", color: "#dc2626", fontWeight: 600 }}
      >
        {formErrors[field]}
      </div>
    ) : null;

  // ── Frame preview (photo behind + frame PNG overlay) ───────────────────────
  const renderFramePreview = (useWall = false) => {
    const dims = frameDimensions[size] || { width: 200, height: 200 };
    const [widthInch, heightInch] = size.split("x").map(Number);
    const depth = thickness === "3mm" ? 4 : thickness === "5mm" ? 5 : 7;

    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          minHeight: "520px",
          borderRadius: "28px",
          overflow: "hidden",
          background: useWall
            ? undefined
            : "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          backgroundImage: useWall ? `url(${WALL_MOCKUP})` : undefined,
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

        {/* glass inner border */}
        <div
          style={{
            position: "absolute",
            inset: "24px",
            borderRadius: "24px",
            border: "1px solid rgba(255,255,255,0.55)",
            pointerEvents: "none",
          }}
        />

        {/* frame container */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "45%",
            width: `${dims.width}px`,
            height: `${dims.height}px`,
            transform: "translate(-50%, -50%)",
            overflow: "visible",
            maxWidth: "92%",
            maxHeight: "78%",
          }}
        >
          {/* depth layer */}
          <div
            style={{
              position: "absolute",
              top: `${depth}px`,
              left: `${depth}px`,
              right: `-${depth}px`,
              bottom: `-${depth}px`,
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

          {/* print surface */}
          <div
            style={{
              position: "absolute",
              inset: 0,
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
              {/* User photo — sits behind the frame overlay */}
              {uploadedImage ? (
                <img
                  src={uploadedImage}
                  alt="Your photo"
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
                    zIndex: 1,
                  }}
                />
              ) : (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#94a3b8",
                    gap: 8,
                    zIndex: 1,
                  }}
                >
                  <i className="bi bi-image" style={{ fontSize: 32 }} />
                  <span style={{ fontSize: 12, fontWeight: 600 }}>
                    Upload your photo
                  </span>
                </div>
              )}

              {/* Frame PNG overlay — on top of the photo */}
              {selectedFrame && (
                <img
                  src={`/frames/${selectedFrame.file}`}
                  alt={selectedFrame.label}
                  draggable={false}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "fill",
                    zIndex: 3,
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* info pills */}
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
          {selectedFrame && (
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
              {selectedFrame.label}
            </span>
          )}
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
            {size} &bull; {(widthInch * 2.54).toFixed(2)} x{" "}
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
            <i className="bi bi-dash-lg" />
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
            <i className="bi bi-plus-lg" />
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
          style={{ borderRadius: "12px", padding: "8px 14px", fontSize: "13px" }}
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
          style={{ width: "100%", cursor: "pointer", accentColor: "#0f172a" }}
        />
      </div>
    </div>
  );

  // ── Step indicator ─────────────────────────────────────────────────────────
  const renderStepIndicator = () => {
    const steps = [
      { step: 1, label: "Choose Frame" },
      { step: 2, label: "Upload Photo" },
      { step: 3, label: "Customize & Pay" },
    ];
    return (
      <div className={styles.stepIndicator}>
        <div className="container">
          <div
            className={styles.stepWrapper}
            style={{ maxWidth: "900px" }}
          >
            {steps.map(({ step, label }, idx) => (
              <div key={step} className={styles.stepItem}>
                <button
                  className={`${styles.stepButton} ${
                    currentStep === step ? styles.active : ""
                  } ${currentStep > step ? styles.completed : ""}`}
                  onClick={() => goToStep(step)}
                  disabled={
                    (step === 2 && !selectedFrame) ||
                    (step === 3 && !uploadedImage)
                  }
                  type="button"
                >
                  <span className={styles.stepNumber}>
                    {currentStep > step ? (
                      <i className="bi bi-check-lg" />
                    ) : (
                      step
                    )}
                  </span>
                  <span className={styles.stepLabel}>{label}</span>
                </button>
                {idx < steps.length - 1 && (
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
  };

  // ── Step 1: Frame selection gallery ───────────────────────────────────────
  const renderStep1 = () => (
    <div className={styles.stepContainer}>
      <div className="container">
        <div style={sectionCardStyle}>
          <h3
            style={{
              fontWeight: 800,
              color: "#0f172a",
              marginBottom: 6,
              fontSize: 24,
            }}
          >
            Choose Your Frame
          </h3>
          <p style={{ color: "#64748b", marginBottom: 24, fontSize: 14 }}>
            Select a decorative frame overlay for your photo print
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: 16,
            }}
          >
            {FRAMES.map((frame) => {
              const isSelected = selectedFrame?.file === frame.file;
              return (
                <div
                  key={frame.file}
                  onClick={() => setSelectedFrame(frame)}
                  style={{
                    cursor: "pointer",
                    borderRadius: 16,
                    overflow: "hidden",
                    border: isSelected
                      ? "3px solid #0f172a"
                      : "3px solid transparent",
                    boxShadow: isSelected
                      ? "0 0 0 2px #0f172a"
                      : "0 4px 12px rgba(0,0,0,0.08)",
                    background: "#f8fafc",
                    transition: "all 0.2s",
                    transform: isSelected ? "scale(1.03)" : "scale(1)",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      paddingBottom: "100%",
                      background: "#f1f5f9",
                    }}
                  >
                    <img
                      src={`/frames/${frame.file}`}
                      alt={frame.label}
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        padding: 8,
                      }}
                    />
                    {isSelected && (
                      <div
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: "#0f172a",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                        }}
                      >
                        <i className="bi bi-check-lg" />
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      padding: "8px 10px",
                      textAlign: "center",
                      fontWeight: 600,
                      fontSize: 12,
                      color: isSelected ? "#0f172a" : "#475569",
                      background: isSelected ? "#f0f9ff" : "#fff",
                      borderTop: "1px solid #f1f5f9",
                    }}
                  >
                    {frame.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 28,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              className={styles.nextButton}
              onClick={() => goToStep(2)}
              disabled={!selectedFrame}
              type="button"
            >
              Continue with {selectedFrame?.label || "selected frame"}
              <i className="bi bi-arrow-right ms-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Step 2: Upload photo ───────────────────────────────────────────────────
  const renderStep2 = () => (
    <div className={styles.stepContainer}>
      <div className="container">
        <div className="row g-4">
          <div className="col-sm-12 col-lg-8">
            <div className={styles.uploadCard}>
              <div
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
                    {renderFramePreview(false)}
                    {renderEditorControls()}
                    <div className={styles.imageControls}>
                      <button
                        className={`${styles.controlButton} ${styles.dangerButton}`}
                        onClick={handleRemoveImage}
                        title="Remove Image"
                        type="button"
                      >
                        <i className="bi bi-trash" />
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
                      />
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
                      <i className="bi bi-folder2-open me-2" />
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

            {/* Selected frame reminder */}
            {selectedFrame && (
              <div
                style={{
                  marginTop: 16,
                  padding: "12px 16px",
                  background: "#f0f9ff",
                  border: "1px solid #bae6fd",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <img
                  src={`/frames/${selectedFrame.file}`}
                  alt={selectedFrame.label}
                  style={{
                    width: 48,
                    height: 48,
                    objectFit: "contain",
                    borderRadius: 8,
                    background: "#fff",
                    padding: 4,
                    border: "1px solid #e2e8f0",
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div
                    style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}
                  >
                    Frame: {selectedFrame.label}
                  </div>
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#2563eb",
                      fontSize: 13,
                      padding: 0,
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Change frame
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="col-sm-12 col-lg-4">
            <div className={styles.guideCard}>
              <h4 className={styles.guideTitle}>
                <i className="bi bi-info-circle me-2" />
                Photo Tips
              </h4>
              <ul className={styles.guideList}>
                <li>
                  <i className="bi bi-check-circle-fill" /> Upload
                  high-resolution images
                </li>
                <li>
                  <i className="bi bi-check-circle-fill" /> Drag to reposition
                  your photo
                </li>
                <li>
                  <i className="bi bi-check-circle-fill" /> Use zoom to fit the
                  frame perfectly
                </li>
                <li>
                  <i className="bi bi-check-circle-fill" /> Formats: JPG, PNG,
                  GIF (max 50MB)
                </li>
                <li className={styles.warning}>
                  <i className="bi bi-exclamation-triangle-fill" /> Poor quality
                  images affect final print
                </li>
              </ul>
              <button
                className={styles.nextButton}
                onClick={() => goToStep(3)}
                disabled={!uploadedImage}
                type="button"
              >
                Continue to Customize &amp; Payment
                <i className="bi bi-arrow-right ms-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Step 3: Customize & Payment ────────────────────────────────────────────
  const renderStep3 = () => {
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
            {/* Left: preview + options */}
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
                    onClick={() => goToStep(2)}
                    style={{ borderRadius: "12px" }}
                  >
                    <i className="bi bi-arrow-left me-2" />
                    Back
                  </button>
                </div>

                {renderFramePreview(true)}
                {renderEditorControls()}

                <div style={{ ...sectionCardStyle, marginTop: 20 }}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label style={labelStyle}>Size (inches)</label>
                      <div style={{ position: "relative" }}>
                        <select
                          value={size}
                          onChange={(e) => {
                            setSize(e.target.value);
                            setIsPaymentReady(false);
                          }}
                          style={{
                            ...inputStyle,
                            width: "100%",
                            paddingRight: "40px",
                            appearance: "none",
                            WebkitAppearance: "none",
                            cursor: "pointer",
                          }}
                        >
                          {sizeOptions.map((s) => (
                            <option key={s} value={s}>
                              {s}
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
                          }}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Thickness</label>
                      <div style={{ position: "relative" }}>
                        <select
                          value={thickness}
                          onChange={(e) => {
                            setThickness(e.target.value);
                            setIsPaymentReady(false);
                          }}
                          style={{
                            ...inputStyle,
                            width: "100%",
                            paddingRight: "40px",
                            appearance: "none",
                            WebkitAppearance: "none",
                            cursor: "pointer",
                          }}
                        >
                          {["3mm", "5mm", "8mm"].map((t) => (
                            <option key={t} value={t}>
                              {t}
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
                          }}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => {
                          setQuantity(Math.max(1, Number(e.target.value) || 1));
                          setIsPaymentReady(false);
                        }}
                        style={{ ...inputStyle, width: "100%" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: form + payment */}
            <div className="col-lg-5">
              <form onSubmit={handleSubmitOrder}>
                {/* Order Summary */}
                <div style={{ ...sectionCardStyle, marginBottom: 20 }}>
                  <h4
                    style={{
                      marginBottom: 18,
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    Order Summary
                  </h4>
                  <div
                    style={{
                      display: "grid",
                      gap: 10,
                      fontSize: 15,
                      color: "#334155",
                    }}
                  >
                    {[
                      ["Product", product?.name || "Framed Photo Print"],
                      ["Frame", selectedFrame?.label || "—"],
                      ["Size", `${size} inches`],
                      ["Thickness", thickness],
                      ["Quantity", quantity],
                      ["Total", `₹${totalAmount}`],
                    ].map(([label, val]) => (
                      <div key={label} className="d-flex justify-content-between">
                        <span>{label}</span>
                        <strong>{val}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pincode check */}
                <div style={{ ...sectionCardStyle, marginBottom: 20 }}>
                  <h4
                    style={{
                      marginBottom: 18,
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    Check Delivery
                  </h4>
                  <div className="d-flex gap-2">
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => {
                        setPincode(
                          e.target.value.replace(/\D/g, "").slice(0, 6)
                        );
                        setDeliveryStatus({
                          message: "",
                          type: "",
                          isChecking: false,
                        });
                      }}
                      placeholder="6-digit pincode"
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <button
                      type="button"
                      className="btn btn-dark"
                      onClick={() => {
                        if (pincode.length !== 6) {
                          showNotification(
                            "Please enter a valid 6-digit pincode",
                            "warning"
                          );
                          return;
                        }
                        setDeliveryStatus({
                          message: "",
                          type: "",
                          isChecking: true,
                        });
                        setTimeout(() => {
                          const ok = [
                            "110001",
                            "400001",
                            "700001",
                            "560001",
                            "600001",
                          ].includes(pincode);
                          if (ok) {
                            setDeliveryStatus({
                              type: "success",
                              message: "Delivery available to this pincode.",
                              isChecking: false,
                            });
                            setEstimatedDeliveryDate("3-5 business days");
                            showNotification(
                              "We deliver to this location",
                              "success"
                            );
                          } else {
                            setDeliveryStatus({
                              type: "error",
                              message:
                                "Sorry, we do not deliver to this pincode yet.",
                              isChecking: false,
                            });
                            setEstimatedDeliveryDate("");
                            showNotification(
                              "We don't deliver to this location yet",
                              "error"
                            );
                          }
                        }, 1000);
                      }}
                      style={{
                        borderRadius: "12px",
                        whiteSpace: "nowrap",
                        padding: "12px 18px",
                      }}
                    >
                      {deliveryStatus.isChecking ? "Checking..." : "Check"}
                    </button>
                  </div>
                  {deliveryStatus.message && (
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        color:
                          deliveryStatus.type === "success"
                            ? "#16a34a"
                            : "#dc2626",
                      }}
                    >
                      {deliveryStatus.message}
                      {estimatedDeliveryDate && (
                        <span style={{ marginLeft: 6, color: "#64748b" }}>
                          &bull; {estimatedDeliveryDate}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Customer Details */}
                <div style={{ ...sectionCardStyle, marginBottom: 20 }}>
                  <h4
                    style={{
                      marginBottom: 18,
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    Customer Details
                  </h4>
                  <div className="row g-3">
                    <div className="col-12">
                      <label style={labelStyle}>Full Name *</label>
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
                      <label style={labelStyle}>Email *</label>
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
                      <label style={labelStyle}>Phone *</label>
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
                      <label style={labelStyle}>Pincode *</label>
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
                      <label style={labelStyle}>Address *</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        style={{ ...inputStyle, width: "100%", resize: "none" }}
                      />
                      {renderFieldError("address")}
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>City *</label>
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
                      <label style={labelStyle}>State *</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        style={{ ...inputStyle, width: "100%" }}
                      />
                      {renderFieldError("state")}
                    </div>
                    <div className="col-12">
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

                {/* Pay button / Razorpay */}
                <div style={sectionCardStyle}>
                  {!isPaymentReady ? (
                    <button
                      type="submit"
                      className="btn btn-dark w-100"
                      style={{
                        borderRadius: 14,
                        padding: "14px 18px",
                        fontWeight: 700,
                        fontSize: 16,
                      }}
                    >
                      Verify Details &amp; Pay Now
                    </button>
                  ) : (
                    <RazorpayPayment
                      amount={totalAmount}
                      customerDetails={{
                        ...formData,
                        name: formData.fullName,
                        orderId,
                        productType: "png_frame",
                        productName: `${selectedFrame?.label || "Framed"} Print`,
                        frameName: selectedFrame?.label || "",
                        size,
                        thickness,
                        quantity,
                        amount: totalAmount,
                      }}
                      previewImage={mailPreviewImage}
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

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <>
      {renderStepIndicator()}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      {/* Toast notification */}
      {showToast.visible && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            minWidth: 280,
            maxWidth: 380,
            background: "#fff",
            borderRadius: 16,
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
            <div
              style={{
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: 4,
              }}
            >
              {showToast.title}
            </div>
            <div style={{ fontSize: 14, color: "#475569" }}>
              {showToast.message}
            </div>
          </div>
        </div>
      )}

      {/* Success modal */}
      <div
        className="modal fade"
        id="pngFrameSuccessModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div
            className="modal-content"
            style={{ borderRadius: 24 }}
          >
            <div className="modal-body text-center p-5">
              <div
                style={{
                  width: 72,
                  height: 72,
                  margin: "0 auto 18px",
                  borderRadius: "999px",
                  display: "grid",
                  placeItems: "center",
                  background: "#dcfce7",
                  color: "#16a34a",
                  fontSize: 32,
                }}
              >
                <i className="bi bi-check2" />
              </div>
              <h3
                style={{
                  fontWeight: 800,
                  color: "#0f172a",
                  marginBottom: 10,
                }}
              >
                Payment Successful
              </h3>
              <p style={{ color: "#64748b", marginBottom: 20 }}>
                Your framed photo print order has been received.
              </p>
              <button
                type="button"
                className="btn btn-dark"
                data-bs-dismiss="modal"
                style={{ borderRadius: 14, padding: "12px 24px" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden canvas used for export */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </>
  );
}

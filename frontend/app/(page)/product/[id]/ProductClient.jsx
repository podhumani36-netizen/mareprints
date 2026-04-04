"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "../../../assest/style/ProductClient.module.css";
import RazorpayPayment from "../../../Components/payment/Razorpay";
import GPayButton from "../../../Components/GPayButton";

export default function ProductClient() {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);

  const [orientation, setOrientation] = useState("portrait");
  const [size, setSize] = useState("8x10");
  const [thickness, setThickness] = useState("3mm");
  const [quantity, setQuantity] = useState(1);

  const [zoom, setZoom] = useState(1);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    paymentMethod: "razorpay",
  });

  const basePrice = 799;

  const sizeOptions = {
    portrait: ["8x10", "11x14", "16x20"],
    landscape: ["10x8", "14x11", "20x16"],
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const showNotification = (msg) => {
    alert(msg);
  };

  const renderStep3 = () => (
    <div className={styles.stepContainer}>
      <h3>Payment</h3>

      {/* Payment method */}
      <div>
        <label>
          <input
            type="radio"
            name="paymentMethod"
            value="razorpay"
            checked={formData.paymentMethod === "razorpay"}
            onChange={handleInputChange}
          />
          Razorpay
        </label>

        <label style={{ marginLeft: "20px" }}>
          <input
            type="radio"
            name="paymentMethod"
            value="gpay"
            checked={formData.paymentMethod === "gpay"}
            onChange={handleInputChange}
          />
          GPay
        </label>
      </div>

      {/*  PAYMENT BUTTON */}
      <div style={{ marginTop: "20px" }}>
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
              orientation,
              size,
              thickness,
              quantity,
              imageZoom: zoom,
              imageOffsetX: imageOffset.x,
              imageOffsetY: imageOffset.y,
              productType: orientation,
              productName: "Photo Print",
            }}
            onSuccess={() => {
              showNotification("Payment successful!");
            }}
            onError={() => {
              showNotification("Payment failed");
            }}
          />
        ) : (
          <GPayButton amount={calculatePrice()} />
        )}
      </div>
    </div>
  );

  return (
    <div className="container mt-5">
      <h2>Product Customization</h2>

      {currentStep === 3 && renderStep3()}

      {/* Dummy next button */}
      {currentStep !== 3 && (
        <button onClick={() => setCurrentStep(3)}>
          Go to Payment Step
        </button>
      )}
    </div>
  );
}
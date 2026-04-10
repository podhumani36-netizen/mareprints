"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import styles from "../../../assest/style/ProductClient.module.css";
import GPayButton from "../../../Components/GPayButton";
import RazorpayPayment from "../../../Components/payment/Razorpay";

export default function ProductClientSquare({ product }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [quantity, setQuantity] = useState(1);

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "razorpay",
  });

  const sizeOptions = ["8×8", "10×10", "12×12", "16×16"];
  const thicknessOptions = ["3mm", "5mm", "8mm"];

  const [size, setSize] = useState("8×8");
  const [thickness, setThickness] = useState("3mm");

  const basePrice = 849;

  const calculatePrice = () => {
    let price = basePrice;
    const index = sizeOptions.indexOf(size);
    if (index > 0) price += index * 150;
    if (thickness === "5mm") price += 150;
    if (thickness === "8mm") price += 300;
    return price * quantity;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container py-4">
      <h3 className="mb-3">Square Print</h3>

      {/* Upload */}
      <input type="file" onChange={handleFileUpload} />

      {uploadedImage && (
        <img
          src={uploadedImage}
          alt="preview"
          style={{ width: 200, marginTop: 10 }}
        />
      )}

      {/* Customize */}
      <div className="mt-3">
        <select value={size} onChange={(e) => setSize(e.target.value)}>
          {sizeOptions.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <select
          value={thickness}
          onChange={(e) => setThickness(e.target.value)}
        >
          {thicknessOptions.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Quantity */}
      <div className="mt-3">
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </div>

      {/* Form */}
      <div className="mt-3">
        <input
          placeholder="Name"
          name="fullName"
          onChange={handleInputChange}
        />
        <input placeholder="Email" name="email" onChange={handleInputChange} />
        <input placeholder="Phone" name="phone" onChange={handleInputChange} />
        <input
          placeholder="Address"
          name="address"
          onChange={handleInputChange}
        />
      </div>

      {/* Payment */}
      <div className="mt-4">
        <h5>Total: ₹{calculatePrice()}</h5>

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
              quantity,
              productType: "square",
              productName: product?.name || "Square Print",
            }}
            onSuccess={() => alert("Payment Success")}
            onError={() => alert("Payment Failed")}
          />
        ) : (
          <GPayButton amount={calculatePrice()} />
        )}
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import styles from "../assest/style/ShippingDetails.module.css";
import GPayButton from "./GPayButton";
import RazorpayPayment from "./payment/Razorpay";

export default function ShippingDetails({
  formData,
  setFormData,
  formErrors,
  setFormErrors,
  calculatePrice,
  orientation,
  size,
  thickness,
  quantity = 1, // ✅ default
  productName = "Photo Print", // ✅ default
  onSuccess,
  onError,
  onSubmitOrder,
}) {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitOrder(e);
  };

  return (
    <div className={styles.paymentForm}>
      <h3>Shipping Details</h3>

      <form onSubmit={handleSubmit}>
        {/* ---------------- FORM SAME ---------------- */}

        {/* PAYMENT */}
        <div className={styles.formSection}>
          <h4>Payment Method</h4>

          <div className={styles.paymentOptions}>
            <label className={styles.paymentOption}>
              <input
                type="radio"
                name="paymentMethod"
                value="razorpay"
                checked={formData.paymentMethod === "razorpay"}
                onChange={handleInputChange}
              />
              <span>
                <img
                  src="https://res.cloudinary.com/dsprfys3x/image/upload/v1773377507/razorpay_chzbwv.svg"
                  alt="Razorpay"
                  width="20"
                />
                Razorpay
              </span>
            </label>

            <label className={styles.paymentOption}>
              <input
                type="radio"
                name="paymentMethod"
                value="gpay"
                checked={formData.paymentMethod === "gpay"}
                onChange={handleInputChange}
              />
              <span>
                <i className="bi bi-google"></i> Google Pay
              </span>
            </label>
          </div>

          {/* ✅ RAZORPAY FIX */}
          {formData.paymentMethod === "razorpay" && (
            <div className={styles.paymentButton}>
              <RazorpayPayment
                amount={calculatePrice()}
                buttonText={`Pay ₹${calculatePrice()}`}
                themeColor="#2C7FB8"
                customerDetails={{
                  name: formData.fullName,
                  email: formData.email,
                  phone: formData.phone,
                  address: formData.address,

                  // ✅ IMPORTANT
                  size: size,
                  thickness: thickness,
                  quantity: quantity,

                  // ✅ VERY IMPORTANT
                  productType: orientation || "custom",
                  productName: productName,
                }}
                onSuccess={onSuccess}
                onError={onError}
              />
            </div>
          )}

          {/* GPAY */}
          {formData.paymentMethod === "gpay" && (
            <div className={styles.paymentButton}>
              <GPayButton
                amount={calculatePrice()}
                onSuccess={onSuccess}
                onError={onError}
              />
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
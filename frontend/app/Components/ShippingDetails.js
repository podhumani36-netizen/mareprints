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

    const handlePaymentSuccess = (response) => {
        onSuccess(response);
    };

    const handlePaymentError = (error) => {
        onError(error);
    };

    return (
        <div className={styles.paymentForm}>
            <h3>Shipping Details</h3>

            <form onSubmit={handleSubmit}>
                <div className={styles.formSection}>
                    <h4>Personal Information</h4>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Full Name *</label>
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Enter your full name"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className={formErrors.fullName ? styles.error : ""}
                            />
                            {formErrors.fullName && (
                                <span className={styles.errorText}>{formErrors.fullName}</span>
                            )}
                        </div>
                        <div className={styles.formGroup}>
                            <label>Email *</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={formErrors.email ? styles.error : ""}
                            />
                            {formErrors.email && (
                                <span className={styles.errorText}>{formErrors.email}</span>
                            )}
                        </div>
                        <div className={styles.formGroup}>
                            <label>Phone *</label>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="10-digit mobile number"
                                value={formData.phone}
                                onChange={handleInputChange}
                                maxLength="10"
                                className={formErrors.phone ? styles.error : ""}
                            />
                            {formErrors.phone && (
                                <span className={styles.errorText}>{formErrors.phone}</span>
                            )}
                        </div>
                        <div className={styles.formGroup}>
                            <label>Alternate Phone</label>
                            <input
                                type="tel"
                                name="alternatePhone"
                                placeholder="Optional"
                                value={formData.alternatePhone}
                                onChange={handleInputChange}
                                maxLength="10"
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.formSection}>
                    <h4>Shipping Address</h4>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroupFull}>
                            <label>Address *</label>
                            <textarea
                                name="address"
                                placeholder="Enter your complete address"
                                value={formData.address}
                                onChange={handleInputChange}
                                rows="2"
                                className={formErrors.address ? styles.error : ""}
                            />
                            {formErrors.address && (
                                <span className={styles.errorText}>{formErrors.address}</span>
                            )}
                        </div>
                        <div className={styles.formGroupFull}>
                            <label>Alternate Address</label>
                            <textarea
                                name="alternateAddress"
                                placeholder="Optional"
                                value={formData.alternateAddress}
                                onChange={handleInputChange}
                                rows="2"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>City *</label>
                            <input
                                type="text"
                                name="city"
                                placeholder="City"
                                value={formData.city}
                                onChange={handleInputChange}
                                className={formErrors.city ? styles.error : ""}
                            />
                            {formErrors.city && (
                                <span className={styles.errorText}>{formErrors.city}</span>
                            )}
                        </div>
                        <div className={styles.formGroup}>
                            <label>State *</label>
                            <input
                                type="text"
                                name="state"
                                placeholder="State"
                                value={formData.state}
                                onChange={handleInputChange}
                                className={formErrors.state ? styles.error : ""}
                            />
                            {formErrors.state && (
                                <span className={styles.errorText}>{formErrors.state}</span>
                            )}
                        </div>
                        <div className={styles.formGroup}>
                            <label>Pincode *</label>
                            <input
                                type="text"
                                name="pincode"
                                placeholder="6-digit pincode"
                                value={formData.pincode}
                                onChange={handleInputChange}
                                maxLength="6"
                                className={formErrors.pincode ? styles.error : ""}
                            />
                            {formErrors.pincode && (
                                <span className={styles.errorText}>{formErrors.pincode}</span>
                            )}
                        </div>
                    </div>
                </div>

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

                    {formData.paymentMethod === "razorpay" && (
                        <div className={styles.paymentButton}>
                            <RazorpayPayment
                                amount={calculatePrice()}
                                buttonText={`Pay ₹${calculatePrice()} with Razorpay`}
                                themeColor="#2C7FB8"
                                customerDetails={{
                                    name: formData.fullName,
                                    email: formData.email,
                                    phone: formData.phone,
                                    address: formData.address,
                                    orientation: orientation,
                                    size: size,
                                    thickness: thickness,
                                }}
                                onSuccess={handlePaymentSuccess}
                                onError={handlePaymentError}
                            />
                        </div>
                    )}

                    {formData.paymentMethod === "gpay" && (
                        <div className={styles.paymentButton}>
                            <GPayButton
                                amount={calculatePrice()}
                                onSuccess={handlePaymentSuccess}
                                onError={handlePaymentError}
                            />
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}
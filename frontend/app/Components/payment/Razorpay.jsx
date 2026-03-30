"use client";

import { useState } from "react";
import Script from "next/script";

export default function RazorpayPayment({
  amount,
  onSuccess,
  onError,
  buttonText = "Pay Now",
  buttonClassName = "",
  customerDetails = {},
  themeColor = "#2C7FB8",
}) {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        setScriptLoaded(true);
        resolve(true);
      };
      script.onerror = () => {
        setScriptLoaded(false);
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      setLoading(true);

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error(
          "Failed to load Razorpay SDK. Please check your internet connection.",
        );
      }

      const response = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          customerDetails,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create payment order");
      }

      const order = await response.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "FrameMaster",
        description: "Premium Acrylic Prints",
        image:
          "https://res.cloudinary.com/dsprfys3x/image/upload/v1771497121/logo.png",
        order_id: order.id,

        handler: function (response) {
          console.log("Payment Success:", response);

          if (onSuccess) {
            onSuccess({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              amount: amount,
            });
          }

          alert("Payment Successful! Your order has been confirmed.");
        },

        prefill: {
          name: customerDetails.name || "Customer",
          email: customerDetails.email || "customer@example.com",
          contact: customerDetails.phone || "9999999999",
        },

        notes: {
          address: customerDetails.address || "No address provided",
          size: customerDetails.size || "",
          thickness: customerDetails.thickness || "",
        },

        theme: {
          color: themeColor,
        },

        modal: {
          ondismiss: function () {
            setLoading(false);
            if (onError) {
              onError("Payment cancelled by user");
            }
          },
          confirm_close: true,
        },

        retry: {
          enabled: true,
          max_count: 3,
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.error("Payment Failed:", response.error);
        setLoading(false);
        if (onError) {
          onError(response.error.description || "Payment failed");
        }
        alert(`Payment failed: ${response.error.description}`);
      });

      razorpay.open();
    } catch (error) {
      console.error("Payment Error:", error);
      setLoading(false);
      if (onError) {
        onError(error.message);
      }
      alert(
        error.message || "An error occurred during payment. Please try again.",
      );
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => setScriptLoaded(true)}
        onError={() => {
          setScriptLoaded(false);
          console.error("Failed to load Razorpay SDK");
        }}
      />

      <button
        onClick={handlePayment}
        disabled={loading || !scriptLoaded}
        className={`${buttonClassName} ${loading ? "loading" : ""}`}
        style={{
          backgroundColor: themeColor,
          color: "white",
          border: "none",
          padding: "12px 24px",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: loading || !scriptLoaded ? "not-allowed" : "pointer",
          opacity: loading || !scriptLoaded ? 0.7 : 1,
          transition: "all 0.3s ease",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        {loading ? (
          <>
            <span
              className="spinner"
              style={{
                width: "20px",
                height: "20px",
                border: "3px solid rgba(255,255,255,0.3)",
                borderRadius: "50%",
                borderTopColor: "white",
                animation: "spin 1s ease-in-out infinite",
              }}
            ></span>
            Processing...
          </>
        ) : !scriptLoaded ? (
          <>
            <i className="bi bi-hourglass-split"></i>
            Loading Payment...
          </>
        ) : (
          <>
            <i className="bi bi-shield-check"></i>
            {buttonText} ₹{amount}
          </>
        )}
      </button>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}

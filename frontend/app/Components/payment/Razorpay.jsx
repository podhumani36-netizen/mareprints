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
      if (typeof window !== "undefined" && window.Razorpay) {
        setScriptLoaded(true);
        resolve(true);
        return;
      }

      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );

      if (existingScript && typeof window !== "undefined" && window.Razorpay) {
        setScriptLoaded(true);
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;

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
        throw new Error("Failed to load Razorpay SDK");
      }

      const createOrderResponse = await fetch(
        "https://mareprints.com/api/payments/create-order/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount,
          }),
        }
      );

      const createOrderText = await createOrderResponse.text();

      let orderData;
      try {
        orderData = JSON.parse(createOrderText);
      } catch (error) {
        console.error("Create order API returned non-JSON:", createOrderText);
        throw new Error("Server returned HTML instead of JSON");
      }

      if (!createOrderResponse.ok) {
        throw new Error(orderData.error || "Failed to create payment order");
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Mare Prints",
        description: "Premium Acrylic Prints",
        image:
          "https://res.cloudinary.com/dsprfys3x/image/upload/v1771497121/logo.png",
        order_id: orderData.id,

        handler: async function (response) {
          try {
            const verifyResponse = await fetch(
              "https://mareprints.com/api/payments/verify/",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  order_id: response.razorpay_order_id,
                  payment_id: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                }),
              }
            );

            const verifyText = await verifyResponse.text();

            let verifyData;
            try {
              verifyData = JSON.parse(verifyText);
            } catch (error) {
              console.error("Verify API returned non-JSON:", verifyText);
              throw new Error("Verification API returned invalid response");
            }

            if (!verifyResponse.ok) {
              throw new Error(
                verifyData.error || "Payment verification failed"
              );
            }

            if (onSuccess) {
              onSuccess({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                amount,
              });
            }

            alert("Payment Successful! Your order has been confirmed.");
          } catch (error) {
            console.error("Verification Error:", error);

            if (onError) {
              onError(error.message);
            }

            alert(error.message || "Payment succeeded, but verification failed.");
          } finally {
            setLoading(false);
          }
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
        error.message || "An error occurred during payment. Please try again."
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
        type="button"
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
          width: "100%",
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
            />
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
            {buttonText}
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
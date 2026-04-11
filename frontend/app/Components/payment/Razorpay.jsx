"use client";

import { useState, useEffect } from "react";
import Script from "next/script";

export default function RazorpayPayment({
  amount,
  onSuccess,
  onError,
  buttonText = "Pay Now",
  buttonClassName = "",
  customerDetails = {},
  previewImage = "",
  themeColor = "#2C7FB8",
  disabled = false,
}) {
  const [loading, setLoading] = useState(false);
  // If Razorpay is already loaded (e.g. after re-verify), start as true so the button isn't disabled.
  const [scriptLoaded, setScriptLoaded] = useState(
    () => typeof window !== "undefined" && !!window.Razorpay
  );

  useEffect(() => {
    if (typeof window !== "undefined" && window.Razorpay) {
      setScriptLoaded(true);
    }
  }, []);

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

      if (disabled) {
        throw new Error("Please verify details before payment");
      }

      if (!previewImage) {
        throw new Error("Please click 'Verify Details & Continue' first");
      }

      const numericAmount = Number(amount);

      if (!numericAmount || numericAmount <= 0) {
        throw new Error("Invalid payment amount");
      }

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
            amount: numericAmount,
            customerDetails,
          }),
        }
      );

      const createOrderText = await createOrderResponse.text();
      console.log("CREATE ORDER RESPONSE TEXT:", createOrderText);

      let orderData;
      try {
        orderData = JSON.parse(createOrderText);
      } catch (error) {
        console.error("Create order API returned non-JSON:", createOrderText);
        throw new Error("Server returned invalid response instead of JSON");
      }

      if (!createOrderResponse.ok) {
        throw new Error(orderData.error || "Failed to create payment order");
      }

      const razorpayKey =
        orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (!razorpayKey) {
        throw new Error("Razorpay key is missing");
      }

      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Mare Prints",
        description: "Premium Acrylic Prints",
        image:
          "https://res.cloudinary.com/dsprfys3x/image/upload/v1771497121/logo.png",
        order_id: orderData.id,

        handler: async function (response) {
          try {
            console.log("RAZORPAY SUCCESS RESPONSE:", response);
            console.log("VERIFY API CALL STARTED");
            console.log("customerDetails:", customerDetails);
            console.log("previewImage exists:", !!previewImage);
            console.log("previewImage length:", previewImage?.length || 0);

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
                  customerDetails: customerDetails,
                  previewImage: previewImage,
                }),
              }
            );

            console.log("VERIFY RESPONSE STATUS:", verifyResponse.status);

            const verifyText = await verifyResponse.text();
            console.log("VERIFY RESPONSE TEXT:", verifyText);

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

            console.log("VERIFY SUCCESS DATA:", verifyData);

            if (onSuccess) {
              onSuccess({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                amount: numericAmount,
                customerDetails,
                email_sent: verifyData.email_sent,
                email_error: verifyData.email_error,
              });
            }

            if (verifyData.email_sent) {
              alert("Payment Successful! Confirmation email sent.");
            } else {
              alert(
                verifyData.email_error ||
                  "Payment successful, but email was not sent."
              );
            }
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
          name: customerDetails.name || customerDetails.fullName || "Customer",
          email: customerDetails.email || "",
          contact: customerDetails.phone || "",
        },

        notes: {
          address: customerDetails.address || "No address provided",
          size: customerDetails.size || "",
          thickness: customerDetails.thickness || "",
          fullName: customerDetails.fullName || "",
          city: customerDetails.city || "",
          state: customerDetails.state || "",
          pincode: customerDetails.pincode || "",
          quantity: customerDetails.quantity || "",
          orderId: customerDetails.orderId || "",
          productType: customerDetails.productType || "",
          productName: customerDetails.productName || "",
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
        disabled={disabled || loading || !scriptLoaded}
        className={`${buttonClassName} ${loading ? "loading" : ""}`}
        style={{
          backgroundColor: themeColor,
          color: "white",
          border: "none",
          padding: "12px 24px",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "600",
          cursor:
            disabled || loading || !scriptLoaded ? "not-allowed" : "pointer",
          opacity: disabled || loading || !scriptLoaded ? 0.7 : 1,
          width: "100%",
        }}
      >
        {loading
          ? "Processing..."
          : disabled
          ? "Verify Details First"
          : buttonText}
      </button>
    </>
  );
}
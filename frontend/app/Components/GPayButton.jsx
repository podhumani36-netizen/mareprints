"use client";
import { useEffect, useRef, useState } from "react";

export default function GPayButton({
  amount = 1,
  onSuccess,
  onError,
  disabled,
}) {
  const buttonRef = useRef(null);
  const paymentsClientRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (window.google) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://pay.google.com/gp/p/js/pay.js";
    script.async = true;

    script.onload = () => {
      setScriptLoaded(true);
    };

    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (scriptLoaded) {
      initializeGooglePay();
    }
  }, [scriptLoaded]);

  const initializeGooglePay = () => {
    if (!window.google) return;

    paymentsClientRef.current = new window.google.payments.api.PaymentsClient({
      environment: "TEST",
    });

    const isReadyToPayRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [
        {
          type: "CARD",
          parameters: {
            allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
            allowedCardNetworks: ["MASTERCARD", "VISA", "RUPAY"],
          },
        },
      ],
    };

    paymentsClientRef.current
      .isReadyToPay(isReadyToPayRequest)
      .then((response) => {
        if (response.result) {
          addGooglePayButton();
        }
      })
      .catch((err) => console.error("GPay readiness error:", err));
  };

  const addGooglePayButton = () => {
    if (!paymentsClientRef.current || !buttonRef.current) return;

    const button = paymentsClientRef.current.createButton({
      onClick: onGooglePaymentButtonClicked,
      buttonType: "pay",
      buttonColor: "black",
    });

    buttonRef.current.innerHTML = "";
    buttonRef.current.appendChild(button);
  };

  const getPaymentDataRequest = () => ({
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [
      {
        type: "CARD",
        parameters: {
          allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
          allowedCardNetworks: ["MASTERCARD", "VISA", "RUPAY"],
        },
        tokenizationSpecification: {
          type: "PAYMENT_GATEWAY",
          parameters: {
            gateway: "example",
            gatewayMerchantId: "exampleMerchantId",
          },
        },
      },
    ],
    merchantInfo: {
      merchantName: "Acrylic Prints Shop",
    },
    transactionInfo: {
      totalPriceStatus: "FINAL",
      totalPrice: String(amount),
      currencyCode: "INR",
      countryCode: "IN",
    },
  });

  const onGooglePaymentButtonClicked = () => {
    const paymentDataRequest = getPaymentDataRequest();

    paymentsClientRef.current
      .loadPaymentData(paymentDataRequest)
      .then((paymentData) => {
        console.log("Payment Success", paymentData);

        onSuccess?.(paymentData);
      })
      .catch((err) => {
        console.error("Payment Error", err);

        onError?.(err);
      });
  };

  return (
    <div
      ref={buttonRef}
      style={{
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? "none" : "auto",
      }}
    />
  );
}
import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req) {
  try {
    const body = await req.json();
    const { amount, customerDetails = {} } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const receiptId = `rcpt_${uuidv4().substring(0, 8)}`;

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: receiptId,
      payment_capture: 1,
      notes: {
        customer_name: customerDetails.name || "",
        customer_email: customerDetails.email || "",
        customer_phone: customerDetails.phone || "",
        ...customerDetails,
      },
    };

    const order = await razorpay.orders.create(options);

    console.log("Razorpay Order Created:", {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
    });
  } catch (error) {
    console.error("Razorpay API Error:", error);

    if (error.code === "BAD_REQUEST_ERROR") {
      return NextResponse.json(
        { error: "Invalid payment request. Please check your input." },
        { status: 400 },
      );
    }

    if (error.code === "GATEWAY_ERROR") {
      return NextResponse.json(
        { error: "Payment gateway error. Please try again later." },
        { status: 502 },
      );
    }

    if (error.code === "AUTHENTICATION_ERROR") {
      console.error("Razorpay Authentication Failed - Check your API keys");
      return NextResponse.json(
        { error: "Payment service configuration error" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 },
    );
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { order_id, payment_id, signature } = body;

    const crypto = require("crypto");
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(order_id + "|" + payment_id)
      .digest("hex");

    if (generated_signature === signature) {
      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
      });
    } else {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 },
    );
  }
}

"use client";

export default function Gpay() {
  const payWithUPI = () => {
    const upiLink = "upi://pay?pa=merchant@upi&pn=FrameMaster&am=500&cu=INR";

    window.location.href = upiLink;
  };

  return <button onClick={payWithUPI}>Pay with Google Pay</button>;
}

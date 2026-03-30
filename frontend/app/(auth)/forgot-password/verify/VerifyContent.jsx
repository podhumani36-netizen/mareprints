"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get("email");
  const [otp, setOtp] = useState("");

  const handleVerify = (e) => {
    e.preventDefault();

    if (otp.length === 6) {
      router.push(`/forgot-password/reset?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div>
      <h2>Verify OTP</h2>
      <p>Email: {email}</p>

      <form onSubmit={handleVerify}>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <button type="submit">Verify</button>
      </form>
    </div>
  );
}

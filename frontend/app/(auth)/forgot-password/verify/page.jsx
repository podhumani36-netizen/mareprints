// "use client";

// import { useState, useEffect, useRef } from "react";
// import Link from "next/link";
// import { useRouter, useSearchParams } from "next/navigation";
// import styles from "../../../assest/style/forgot-password.module.css";

// const VerifyOTPPage = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const email = searchParams.get("email") || "your email";

//   const [otp, setOtp] = useState(["", "", "", "", "", ""]);
//   const [timer, setTimer] = useState(60);
//   const [canResend, setCanResend] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [isLoading, setIsLoading] = useState(false);
//   const [isVerified, setIsVerified] = useState(false);

//   const inputRefs = useRef([]);

//   // Timer for resend OTP
//   useEffect(() => {
//     if (timer > 0 && !canResend) {
//       const interval = setInterval(() => {
//         setTimer((prev) => prev - 1);
//       }, 1000);
//       return () => clearInterval(interval);
//     } else if (timer === 0) {
//       setCanResend(true);
//     }
//   }, [timer, canResend]);

//   // Auto-focus next input
//   const handleOtpChange = (index, value) => {
//     if (isNaN(value)) return;

//     const newOtp = [...otp];
//     newOtp[index] = value.slice(-1);
//     setOtp(newOtp);

//     // Auto-focus next input
//     if (value && index < 5) {
//       inputRefs.current[index + 1].focus();
//     }

//     // Clear error when typing
//     if (errors.otp) {
//       setErrors({});
//     }
//   };

//   const handleKeyDown = (index, e) => {
//     // Handle backspace
//     if (e.key === "Backspace" && !otp[index] && index > 0) {
//       inputRefs.current[index - 1].focus();
//     }
//   };

//   const handlePaste = (e) => {
//     e.preventDefault();
//     const pastedData = e.clipboardData.getData("text/plain").slice(0, 6);
//     if (/^\d+$/.test(pastedData)) {
//       const pastedOtp = pastedData.split("");
//       const newOtp = [...otp];
//       pastedOtp.forEach((value, index) => {
//         if (index < 6) newOtp[index] = value;
//       });
//       setOtp(newOtp);
//     }
//   };

//   const validateOTP = () => {
//     const newErrors = {};
//     if (otp.some((digit) => !digit)) {
//       newErrors.otp = "Please enter complete OTP";
//     }
//     return newErrors;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const newErrors = validateOTP();

//     if (Object.keys(newErrors).length === 0) {
//       setIsLoading(true);

//       // Simulate OTP verification
//       setTimeout(() => {
//         setIsLoading(false);
//         setIsVerified(true);

//         // Show success and redirect
//         setTimeout(() => {
//           router.push(
//             `/forgot-password/reset?email=${encodeURIComponent(email)}`,
//           );
//         }, 2000);
//       }, 1500);
//     } else {
//       setErrors(newErrors);
//     }
//   };

//   const handleResend = () => {
//     setTimer(60);
//     setCanResend(false);
//     setOtp(["", "", "", "", "", ""]);

//     // Show resend toast
//     const toast = document.createElement("div");
//     toast.className = styles.resendToast;
//     toast.innerHTML = `
//       <i class="bi bi-check-circle-fill"></i>
//       <span>OTP resent successfully!</span>
//     `;
//     document.body.appendChild(toast);

//     setTimeout(() => {
//       toast.remove();
//     }, 3000);
//   };

//   return (
//     <div className={styles.forgotPasswordWrapper}>
//       {/* Animated Background */}
//       <div className={styles.animatedBg}>
//         <div className={`${styles.bgShape} ${styles.shape1}`}></div>
//         <div className={`${styles.bgShape} ${styles.shape2}`}></div>
//         <div className={`${styles.bgShape} ${styles.shape3}`}></div>
//       </div>

//       {/* Success Overlay */}
//       {isVerified && (
//         <div className={styles.successOverlay}>
//           <div className={styles.successAnimation}>
//             <svg className={styles.checkmark} viewBox="0 0 52 52">
//               <circle
//                 className={styles.checkmarkCircle}
//                 cx="26"
//                 cy="26"
//                 r="25"
//                 fill="none"
//               />
//               <path
//                 className={styles.checkmarkCheck}
//                 fill="none"
//                 d="M14.1 27.2l7.1 7.2 16.7-16.8"
//               />
//             </svg>
//             <h3>OTP Verified!</h3>
//             <p>Redirecting to reset password...</p>
//             <div className={styles.loadingDots}>
//               <span></span>
//               <span></span>
//               <span></span>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className={styles.forgotContainer}>
//         <div className={`${styles.forgotCard} ${styles.verifyCard}`}>
//           {/* Back Button */}
//           <button onClick={() => router.back()} className={styles.backButton}>
//             <i className="bi bi-arrow-left"></i>
//             Back
//           </button>

//           {/* Progress Steps */}
//           <div className={styles.progressSteps}>
//             <div className={`${styles.step} ${styles.completed}`}>
//               <span className={styles.stepNumber}>
//                 <i className="bi bi-check-lg"></i>
//               </span>
//               <span className={styles.stepLabel}>Email</span>
//             </div>
//             <div className={`${styles.stepLine} ${styles.active}`}></div>
//             <div className={`${styles.step} ${styles.active}`}>
//               <span className={styles.stepNumber}>2</span>
//               <span className={styles.stepLabel}>Verify</span>
//             </div>
//             <div className={styles.stepLine}></div>
//             <div className={styles.step}>
//               <span className={styles.stepNumber}>3</span>
//               <span className={styles.stepLabel}>Reset</span>
//             </div>
//           </div>

//           {/* Email Info with Animation */}
//           <div className={styles.emailInfo}>
//             <div className={styles.emailIconWrapper}>
//               <i className="bi bi-envelope-check-fill"></i>
//             </div>
//             <div className={styles.emailDetails}>
//               <p>Verification code sent to</p>
//               <h4>{decodeURIComponent(email)}</h4>
//             </div>
//           </div>

//           {/* Header */}
//           <div className={styles.forgotHeader}>
//             <h2>Verify OTP</h2>
//             <p>Please enter the 6-digit verification code sent to your email</p>
//           </div>

//           {/* OTP Form */}
//           <form onSubmit={handleSubmit} className={styles.otpForm}>
//             <div className={styles.otpInputs}>
//               {otp.map((digit, index) => (
//                 <input
//                   key={index}
//                   type="text"
//                   maxLength={1}
//                   value={digit}
//                   onChange={(e) => handleOtpChange(index, e.target.value)}
//                   onKeyDown={(e) => handleKeyDown(index, e)}
//                   onPaste={index === 0 ? handlePaste : undefined}
//                   ref={(el) => (inputRefs.current[index] = el)}
//                   className={errors.otp ? styles.error : ""}
//                   disabled={isVerified}
//                   autoFocus={index === 0}
//                 />
//               ))}
//             </div>

//             {errors.otp && (
//               <span className={`${styles.errorMessage} ${styles.centered}`}>
//                 <i className="bi bi-exclamation-circle-fill"></i>
//                 {errors.otp}
//               </span>
//             )}

//             {/* Timer with Animation */}
//             <div className={styles.timerContainer}>
//               <div className={styles.timer}>
//                 <i className="bi bi-clock-history"></i>
//                 <span className={styles.timerText}>
//                   {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
//                 </span>
//               </div>
//               <div className={styles.timerProgress}>
//                 <div
//                   className={styles.timerProgressBar}
//                   style={{ width: `${(timer / 60) * 100}%` }}
//                 ></div>
//               </div>
//             </div>

//             {/* Resend Section */}
//             <div className={styles.resendSection}>
//               <p>Didn't receive the code?</p>
//               {canResend ? (
//                 <button
//                   type="button"
//                   onClick={handleResend}
//                   className={styles.resendBtn}
//                   disabled={isVerified}
//                 >
//                   <i className="bi bi-arrow-repeat"></i>
//                   Resend OTP
//                 </button>
//               ) : (
//                 <span className={styles.resendTimer}>
//                   <i className="bi bi-hourglass-split"></i>
//                   Resend in {timer}s
//                 </span>
//               )}
//             </div>

//             <button
//               type="submit"
//               className={styles.submitBtn}
//               disabled={isLoading || isVerified}
//             >
//               {isLoading ? (
//                 <>
//                   <span className={styles.spinner}></span>
//                   Verifying...
//                 </>
//               ) : isVerified ? (
//                 <>
//                   <i className="bi bi-check-lg"></i>
//                   Verified!
//                 </>
//               ) : (
//                 <>
//                   Verify OTP
//                   <i className="bi bi-check-circle"></i>
//                 </>
//               )}
//             </button>
//           </form>

//           {/* Help Link */}
//           <div className={styles.forgotFooter}>
//             <p>
//               Need help?{" "}
//               <Link href="/contact" className={styles.authLink}>
//                 Contact Support
//               </Link>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VerifyOTPPage;

import { Suspense } from "react";
import VerifyContent from "./VerifyContent";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
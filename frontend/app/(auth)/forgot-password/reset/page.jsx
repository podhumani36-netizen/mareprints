// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { useRouter, useSearchParams } from "next/navigation";
// import styles from "../../../assest/style/forgot-password.module.css";

// const ResetPasswordPage = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const email = searchParams.get("email") || "";

//   const [formData, setFormData] = useState({
//     newPassword: "",
//     confirmPassword: "",
//   });
//   const [showPassword, setShowPassword] = useState({
//     new: false,
//     confirm: false,
//   });
//   const [passwordStrength, setPasswordStrength] = useState(0);
//   const [errors, setErrors] = useState({});
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSuccess, setIsSuccess] = useState(false);

//   // Calculate password strength
//   useEffect(() => {
//     let strength = 0;
//     const password = formData.newPassword;

//     if (password.length > 0) {
//       if (password.length >= 8) strength += 25;
//       if (/[A-Z]/.test(password)) strength += 25;
//       if (/[0-9]/.test(password)) strength += 25;
//       if (/[^A-Za-z0-9]/.test(password)) strength += 25;
//     }

//     setPasswordStrength(strength);
//   }, [formData.newPassword]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//     if (errors[name]) {
//       setErrors({ ...errors, [name]: null });
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.newPassword) {
//       newErrors.newPassword = "New password is required";
//     } else if (formData.newPassword.length < 8) {
//       newErrors.newPassword = "Password must be at least 8 characters";
//     } else if (passwordStrength < 50) {
//       newErrors.newPassword = "Password is too weak";
//     }

//     if (!formData.confirmPassword) {
//       newErrors.confirmPassword = "Please confirm your password";
//     } else if (formData.newPassword !== formData.confirmPassword) {
//       newErrors.confirmPassword = "Passwords do not match";
//     }

//     return newErrors;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const newErrors = validateForm();

//     if (Object.keys(newErrors).length === 0) {
//       setIsLoading(true);

//       // Simulate password reset
//       setTimeout(() => {
//         setIsLoading(false);
//         setIsSuccess(true);

//         // Redirect to login after success
//         setTimeout(() => {
//           router.push("/login?reset=success");
//         }, 3000);
//       }, 1500);
//     } else {
//       setErrors(newErrors);
//     }
//   };

//   const getStrengthColor = () => {
//     if (passwordStrength < 25) return "#ef4444";
//     if (passwordStrength < 50) return "#f59e0b";
//     if (passwordStrength < 75) return "#3b82f6";
//     return "#10b981";
//   };

//   const getStrengthText = () => {
//     if (passwordStrength === 0) return "";
//     if (passwordStrength < 25) return "Very Weak";
//     if (passwordStrength < 50) return "Weak";
//     if (passwordStrength < 75) return "Good";
//     return "Strong";
//   };

//   return (
//     <div className={styles.forgotPasswordWrapper}>
//       {/* Animated Background */}
//       <div className={styles.animatedBg}>
//         <div className={`${styles.bgShape} ${styles.shape1}`}></div>
//         <div className={`${styles.bgShape} ${styles.shape2}`}></div>
//         <div className={`${styles.bgShape} ${styles.shape3}`}></div>
//       </div>

//       {/* Success Modal */}
//       {isSuccess && (
//         <div className={styles.successModal}>
//           <div className={styles.successContent}>
//             <div className={styles.successIconLarge}>
//               <svg viewBox="0 0 52 52">
//                 <circle
//                   className={styles.successCircle}
//                   cx="26"
//                   cy="26"
//                   r="25"
//                   fill="none"
//                 />
//                 <path
//                   className={styles.successCheck}
//                   fill="none"
//                   d="M14.1 27.2l7.1 7.2 16.7-16.8"
//                 />
//               </svg>
//             </div>
//             <h2>Password Reset Successfully!</h2>
//             <p>Your password has been updated. Redirecting to login...</p>
//             <div className={styles.loadingDots}>
//               <span></span>
//               <span></span>
//               <span></span>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className={styles.forgotContainer}>
//         <div className={`${styles.forgotCard} ${styles.resetCard}`}>
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
//             <div className={`${styles.step} ${styles.completed}`}>
//               <span className={styles.stepNumber}>
//                 <i className="bi bi-check-lg"></i>
//               </span>
//               <span className={styles.stepLabel}>Verify</span>
//             </div>
//             <div className={`${styles.stepLine} ${styles.active}`}></div>
//             <div className={`${styles.step} ${styles.active}`}>
//               <span className={styles.stepNumber}>3</span>
//               <span className={styles.stepLabel}>Reset</span>
//             </div>
//           </div>

//           {/* Security Icon */}
//           <div className={styles.securityIcon}>
//             <i className="bi bi-shield-check"></i>
//           </div>

//           {/* Header */}
//           <div className={styles.forgotHeader}>
//             <h2>Reset Password</h2>
//             <p>Create a new strong password for your account</p>
//           </div>

//           {/* Password Requirements */}
//           <div className={styles.passwordRequirements}>
//             <p>Password must contain:</p>
//             <ul>
//               <li
//                 className={formData.newPassword.length >= 8 ? styles.valid : ""}
//               >
//                 <i
//                   className={`bi bi-${formData.newPassword.length >= 8 ? "check-circle-fill" : "circle"}`}
//                 ></i>
//                 At least 8 characters
//               </li>
//               <li
//                 className={
//                   /[A-Z]/.test(formData.newPassword) ? styles.valid : ""
//                 }
//               >
//                 <i
//                   className={`bi bi-${/[A-Z]/.test(formData.newPassword) ? "check-circle-fill" : "circle"}`}
//                 ></i>
//                 One uppercase letter
//               </li>
//               <li
//                 className={
//                   /[0-9]/.test(formData.newPassword) ? styles.valid : ""
//                 }
//               >
//                 <i
//                   className={`bi bi-${/[0-9]/.test(formData.newPassword) ? "check-circle-fill" : "circle"}`}
//                 ></i>
//                 One number
//               </li>
//               <li
//                 className={
//                   /[^A-Za-z0-9]/.test(formData.newPassword) ? styles.valid : ""
//                 }
//               >
//                 <i
//                   className={`bi bi-${/[^A-Za-z0-9]/.test(formData.newPassword) ? "check-circle-fill" : "circle"}`}
//                 ></i>
//                 One special character
//               </li>
//             </ul>
//           </div>

//           {/* Form */}
//           <form onSubmit={handleSubmit} className={styles.resetForm}>
//             {/* New Password */}
//             <div className={styles.inputGroup}>
//               <div className={styles.inputWrapper}>
//                 <i className={`bi bi-lock-fill ${styles.inputIcon}`}></i>
//                 <input
//                   type={showPassword.new ? "text" : "password"}
//                   name="newPassword"
//                   placeholder=" "
//                   value={formData.newPassword}
//                   onChange={handleChange}
//                   className={errors.newPassword ? styles.error : ""}
//                 />
//                 <label className={styles.inputLabel}>New Password</label>
//                 <button
//                   type="button"
//                   className={styles.passwordToggle}
//                   onClick={() =>
//                     setShowPassword({ ...showPassword, new: !showPassword.new })
//                   }
//                 >
//                   <i
//                     className={`bi bi-${showPassword.new ? "eye-slash" : "eye"}`}
//                   ></i>
//                 </button>
//               </div>

//               {/* Strength Meter */}
//               {formData.newPassword && (
//                 <div className={styles.strengthMeter}>
//                   <div className={styles.strengthBar}>
//                     <div
//                       className={styles.strengthFill}
//                       style={{
//                         width: `${passwordStrength}%`,
//                         backgroundColor: getStrengthColor(),
//                       }}
//                     />
//                   </div>
//                   <span
//                     className={styles.strengthText}
//                     style={{ color: getStrengthColor() }}
//                   >
//                     {getStrengthText()}
//                   </span>
//                 </div>
//               )}

//               {errors.newPassword && (
//                 <span className={styles.errorMessage}>
//                   <i className="bi bi-exclamation-circle-fill"></i>
//                   {errors.newPassword}
//                 </span>
//               )}
//             </div>

//             {/* Confirm Password */}
//             <div className={styles.inputGroup}>
//               <div className={styles.inputWrapper}>
//                 <i className={`bi bi-shield-lock-fill ${styles.inputIcon}`}></i>
//                 <input
//                   type={showPassword.confirm ? "text" : "password"}
//                   name="confirmPassword"
//                   placeholder=" "
//                   value={formData.confirmPassword}
//                   onChange={handleChange}
//                   className={errors.confirmPassword ? styles.error : ""}
//                 />
//                 <label className={styles.inputLabel}>Confirm Password</label>
//                 <button
//                   type="button"
//                   className={styles.passwordToggle}
//                   onClick={() =>
//                     setShowPassword({
//                       ...showPassword,
//                       confirm: !showPassword.confirm,
//                     })
//                   }
//                 >
//                   <i
//                     className={`bi bi-${showPassword.confirm ? "eye-slash" : "eye"}`}
//                   ></i>
//                 </button>
//               </div>

//               {/* Match Indicator */}
//               {formData.confirmPassword && (
//                 <div className={styles.matchIndicator}>
//                   {formData.newPassword === formData.confirmPassword ? (
//                     <span className={styles.matchSuccess}>
//                       <i className="bi bi-check-circle-fill"></i> Passwords
//                       match
//                     </span>
//                   ) : (
//                     <span className={styles.matchError}>
//                       <i className="bi bi-exclamation-circle-fill"></i>{" "}
//                       Passwords don't match
//                     </span>
//                   )}
//                 </div>
//               )}

//               {errors.confirmPassword && (
//                 <span className={styles.errorMessage}>
//                   <i className="bi bi-exclamation-circle-fill"></i>
//                   {errors.confirmPassword}
//                 </span>
//               )}
//             </div>

//             <button
//               type="submit"
//               className={styles.submitBtn}
//               disabled={isLoading || isSuccess}
//             >
//               {isLoading ? (
//                 <>
//                   <span className={styles.spinner}></span>
//                   Resetting Password...
//                 </>
//               ) : isSuccess ? (
//                 <>
//                   <i className="bi bi-check-lg"></i>
//                   Success!
//                 </>
//               ) : (
//                 <>
//                   Reset Password
//                   <i className="bi bi-arrow-repeat"></i>
//                 </>
//               )}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ResetPasswordPage;

import { Suspense } from "react";
import ResetPasswordContent from "./ResetPasswordContent";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
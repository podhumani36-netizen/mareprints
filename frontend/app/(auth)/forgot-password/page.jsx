"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../../assest/style/forgot-password.module.css";
const ForgotPasswordPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const validateEmail = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    return newErrors;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateEmail();
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsSent(true);
        setTimeout(() => {
          router.push(
            `/forgot-password/verify?email=${encodeURIComponent(email)}`,
          );
        }, 2000);
      }, 1500);
    } else {
      setErrors(newErrors);
    }
  };
  return (
    <div className={styles.forgotPasswordWrapper}>
      {}
      <div className={styles.animatedBg}>
        <div className={`${styles.bgShape} ${styles.shape1}`}></div>
        <div className={`${styles.bgShape} ${styles.shape2}`}></div>
        <div className={`${styles.bgShape} ${styles.shape3}`}></div>
      </div>
      {}
      {isSent && (
        <div className={styles.successToast}>
          <div className={styles.successIcon}>
            <svg viewBox="0 0 52 52">
              <circle
                className={styles.successCircle}
                cx="26"
                cy="26"
                r="25"
                fill="none"
              />
              <path
                className={styles.successCheck}
                fill="none"
                d="M14.1 27.2l7.1 7.2 16.7-16.8"
              />
            </svg>
          </div>
          <div className={styles.successMessage}>
            <h4>OTP Sent!</h4>
            <p>Check your email for verification code</p>
          </div>
        </div>
      )}
      <div className={styles.forgotContainer}>
        <div className={styles.forgotCard}>
          {}
          <button onClick={() => router.back()} className={styles.backButton}>
            <i className="bi bi-arrow-left"></i>
            Back
          </button>
          {}
          <div className={styles.progressSteps}>
            <div className={`${styles.step} ${styles.active}`}>
              <span className={styles.stepNumber}>1</span>
              <span className={styles.stepLabel}>Email</span>
            </div>
            <div className={styles.stepLine}></div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <span className={styles.stepLabel}>Verify</span>
            </div>
            <div className={styles.stepLine}></div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <span className={styles.stepLabel}>Reset</span>
            </div>
          </div>
          {}
          <div className={styles.lockIconWrapper}>
            <div className={styles.lockIcon}>
              <i className="bi bi-shield-lock-fill"></i>
            </div>
            <div className={styles.rippleEffect}></div>
          </div>
          {}
          <div className={styles.forgotHeader}>
            <h2>Forgot Password?</h2>
            <p>
              Don't worry! Please enter your email address and we'll send you a
              verification code to reset your password.
            </p>
          </div>
          {}
          <form onSubmit={handleSubmit} className={styles.forgotForm}>
            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <i className={`bi bi-envelope-fill ${styles.inputIcon}`}></i>
                <input
                  type="email"
                  placeholder=" "
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({});
                  }}
                  className={errors.email ? styles.error : ""}
                />
                <label className={styles.inputLabel}>Email Address</label>
              </div>
              {errors.email && (
                <span className={styles.errorMessage}>
                  <i className="bi bi-exclamation-circle-fill"></i>
                  {errors.email}
                </span>
              )}
            </div>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner}></span>
                  Sending OTP...
                </>
              ) : (
                <>
                  Send OTP
                  <i className="bi bi-send"></i>
                </>
              )}
            </button>
          </form>
          {}
          <div className={styles.forgotFooter}>
            <p>
              Remember your password?{" "}
              <Link href="/login" className={styles.authLink}>
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ForgotPasswordPage;
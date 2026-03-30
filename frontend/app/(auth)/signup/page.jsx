"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "../../assest/style/login.model.css";

const SignupPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
    if (apiError) setApiError("");
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.first_name?.trim()) newErrors.first_name = "First name is required";
    if (!formData.last_name?.trim()) newErrors.last_name = "Last name is required";
    if (!formData.email?.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.phone?.trim()) newErrors.phone = "Phone number is required";
    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords don't match";
    }
    return newErrors;
  };

  const handleNext = () => {
    const stepErrors = validateStep1();
    if (Object.keys(stepErrors).length === 0) {
      setStep(2);
      setErrors({});
    } else {
      setErrors(stepErrors);
    }
  };

  const handleBack = () => {
    setStep(1);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const stepErrors = validateStep2();

    if (Object.keys(stepErrors).length === 0) {
      setIsLoading(true);
      setApiError("");

      try {
        const response = await fetch("http://127.0.0.1:8000/api/register/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone: formData.phone,
            password: formData.password,
            confirm_password: formData.confirm_password,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          router.push("/login?registered=true");
        } else {
          if (data.errors) {
            const errorMessages = Object.values(data.errors).flat().join(', ');
            setApiError(errorMessages);
          } else {
            setApiError(data.error || "Registration failed");
          }
        }
      } catch (error) {
        setApiError("Network error. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(stepErrors);
    }
  };

  return (
    <div className="modern-auth">
      <div className="split-container reverse">
        <div className="form-side">
          <div className="form-container">
            <div className="progress-steps">
              <div className={`step ${step >= 1 ? "active" : ""}`}>
                <span className="step-number">{step > 1 ? "✓" : "1"}</span>
                <span className="step-label">Account</span>
              </div>
              <div className={`step-line ${step >= 2 ? "active" : ""}`}></div>
              <div className={`step ${step >= 2 ? "active" : ""}`}>
                <span className="step-number">2</span>
                <span className="step-label">Security</span>
              </div>
            </div>

            <div className="form-header">
              <h2>{step === 1 ? "Create Account" : "Secure Your Account"}</h2>
              <p>
                {step === 1
                  ? "Enter your details to get started"
                  : "Choose a strong password"}
              </p>
            </div>

            {apiError && (
              <div className="alert error">
                <i className="bi bi-exclamation-triangle-fill"></i>
                {apiError}
              </div>
            )}

            <form
              onSubmit={step === 2 ? handleSubmit : (e) => e.preventDefault()}
            >
              {step === 1 ? (
                <>
                  <div className="input-field">
                    <input
                      type="text"
                      name="first_name"
                      placeholder=" "
                      value={formData.first_name}
                      onChange={handleChange}
                      className={errors.first_name ? "error" : ""}
                    />
                    <label>First Name</label>
                    <i className="bi bi-person input-icon"></i>
                    {errors.first_name && (
                      <span className="error-hint">{errors.first_name}</span>
                    )}
                  </div>

                  <div className="input-field">
                    <input
                      type="text"
                      name="last_name"
                      placeholder=" "
                      value={formData.last_name}
                      onChange={handleChange}
                      className={errors.last_name ? "error" : ""}
                    />
                    <label>Last Name</label>
                    <i className="bi bi-person input-icon"></i>
                    {errors.last_name && (
                      <span className="error-hint">{errors.last_name}</span>
                    )}
                  </div>

                  <div className="input-field">
                    <input
                      type="email"
                      name="email"
                      placeholder=" "
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? "error" : ""}
                    />
                    <label>Email Address</label>
                    <i className="bi bi-envelope input-icon"></i>
                    {errors.email && (
                      <span className="error-hint">{errors.email}</span>
                    )}
                  </div>

                  <div className="input-field">
                    <input
                      type="tel"
                      name="phone"
                      placeholder=" "
                      value={formData.phone}
                      onChange={handleChange}
                      className={errors.phone ? "error" : ""}
                    />
                    <label>Phone Number</label>
                    <i className="bi bi-phone input-icon"></i>
                    {errors.phone && (
                      <span className="error-hint">{errors.phone}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="submit-btn"
                    onClick={handleNext}
                  >
                    Next Step
                    <i className="bi bi-arrow-right"></i>
                  </button>
                </>
              ) : (
                <>
                  <div className="input-field">
                    <input
                      type="password"
                      name="password"
                      placeholder=" "
                      value={formData.password}
                      onChange={handleChange}
                      className={errors.password ? "error" : ""}
                    />
                    <label>Password</label>
                    <i className="bi bi-lock input-icon"></i>
                    {errors.password && (
                      <span className="error-hint">{errors.password}</span>
                    )}
                  </div>

                  <div className="input-field">
                    <input
                      type="password"
                      name="confirm_password"
                      placeholder=" "
                      value={formData.confirm_password}
                      onChange={handleChange}
                      className={errors.confirm_password ? "error" : ""}
                    />
                    <label>Confirm Password</label>
                    <i className="bi bi-shield-lock input-icon"></i>
                    {errors.confirm_password && (
                      <span className="error-hint">
                        {errors.confirm_password}
                      </span>
                    )}
                  </div>

                  <div className="button-group">
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner"></span>
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <i className="bi bi-check-lg"></i>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>

            {step === 1 && (
              <>
                <div className="social-section">
                  <p className="or-text">Or sign up with</p>
                  <div className="social-buttons">
                    <button className="social-btn google">
                      <svg viewBox="0 0 24 24" width="20" height="20">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Google
                    </button>
                  </div>
                </div>

                <p className="signup-link">
                  Already have an account? <Link href="/login">Sign in</Link>
                </p>
              </>
            )}
          </div>
        </div>

        <div className="brand-side">
          <img
            src="https://res.cloudinary.com/dsprfys3x/image/upload/v1772596832/call-centre-hotline-client-support-online-helpline-problem-solving-remote-assistance-telephone-service-customer-assistant-cartoon-characters_txc1go.png"
            alt="Signup illustration"
            className="img-fluid"
          />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
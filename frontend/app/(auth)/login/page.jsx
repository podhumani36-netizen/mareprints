"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "../../assest/style/login.model.css";

const LoginPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
    if (errors.general) setErrors({ ...errors, general: null });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);

      try {
        const res = await fetch("http://127.0.0.1:8000/api/login/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
       localStorage.setItem("user", JSON.stringify({
    first_name: data.user.first_name,
    last_name: data.user.last_name,
    phone: data.user.phone,
    email: data.user.email  
  }));
  localStorage.setItem("isLoggedIn", "true");
  
 
  window.dispatchEvent(new Event("loginStatusChanged"));
  
  router.push("/");
} else {
          setErrors({
            general: data.error || "Login failed. Please try again.",
          });
        }
      } catch (error) {
        setErrors({
          general: "Unable to connect to server. Please check your connection.",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://127.0.0.1:8000/api/google-login/";
  };

  return (
    <div className="modern-auth">
      <div className="split-container">
        <div className="brand-side">
          <img
            src="https://res.cloudinary.com/dsprfys3x/image/upload/v1772597612/credit-card-payment-concept-landing-page_23-2148310403-removebg-preview_sxs4xv.png"
            alt="Login illustration"
            className="img-fluid"
          />
        </div>

        <div className="form-side">
          <div className="form-container">
            <div className="form-header">
              <h2>Welcome Back</h2>
              <p>Please enter your credentials to continue</p>
            </div>

            {errors.general && (
              <div className="alert error">
                <i className="bi bi-exclamation-triangle-fill"></i>
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="modern-form">
              <div className="input-field">
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder=" "
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "error" : ""}
                  disabled={isLoading}
                />
                <label htmlFor="email">Email Address</label>
                <i className="bi bi-envelope input-icon"></i>
                {errors.email && (
                  <span className="error-hint">
                    <i className="bi bi-exclamation-circle"></i>
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="input-field">
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder=" "
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "error" : ""}
                  disabled={isLoading}
                />
                <label htmlFor="password">Password</label>
                <i className="bi bi-lock input-icon"></i>
                {errors.password && (
                  <span className="error-hint">
                    <i className="bi bi-exclamation-circle"></i>
                    {errors.password}
                  </span>
                )}
              </div>

              <div className="form-actions">
                <label className="checkbox">
                  <input type="checkbox" disabled={isLoading} />
                  <span className="checkmark"></span>
                  Remember me
                </label>
                <Link href="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <i className="bi bi-arrow-right"></i>
                  </>
                )}
              </button>
            </form>

            <div className="social-section">
              <p className="or-text">Or continue with</p>
              <div className="social-buttons">
                <button
                  className="social-btn google"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
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
              Don't have an account? <Link href="/signup">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
"use client";

import { useState, useEffect } from "react";
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
        const res = await fetch("https://mareprints.com/api/login/", {
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

  const handleGoogleResponse = async (response) => {
  try {
    const res = await fetch("https://mareprints.com/api/google-login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        credential: response.credential,
      }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("isLoggedIn", "true");
      window.dispatchEvent(new Event("loginStatusChanged"));
      router.push("/");
    } else {
      setErrors({
        general: data.error || "Google login failed",
      });
    }
  } catch (error) {
    setErrors({
      general: "Unable to connect to server. Please try again.",
    });
  }
};

useEffect(() => {
  const loadGoogleScript = () => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "YOUR_GOOGLE_CLIENT_ID",
          callback: handleGoogleResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("googleSignInDiv"),
          { theme: "outline", size: "large", width: 250 }
        );
      }
    };
    document.body.appendChild(script);
  };

  loadGoogleScript();
}, []);

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
               <div id="googleSignInDiv"></div>
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
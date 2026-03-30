"use client";

import React, { useState } from "react";
import "../assest/style/from.css";

const ContactForm = () => {
  const [status, setStatus] = useState("idle");
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      showNotification("error", "Please enter your name");
      return false;
    }
    if (!formData.email.trim()) {
      showNotification("error", "Please enter your email");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showNotification("error", "Please enter a valid email address");
      return false;
    }
    if (!formData.message.trim()) {
      showNotification("error", "Please enter your message");
      return false;
    }
    if (formData.message.length < 10) {
      showNotification("error", "Message must be at least 10 characters long");
      return false;
    }
    return true;
  };

  const showNotification = (type, message) => {
    setPopupType(type);
    setPopupMessage(message);
    setShowPopup(true);

    setTimeout(() => {
      setShowPopup(false);
    }, 5000);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setStatus("sending");

    const formDataToSend = new FormData();
    formDataToSend.append("access_key", "ccc4e304-e860-452d-973a-f6433db5ed40");
    formDataToSend.append("name", formData.name);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("message", formData.message);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.success) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
        showNotification(
          "success",
          "Message sent successfully! We'll get back to you within 24 hours.",
        );
      } else {
        setStatus("error");
        showNotification(
          "error",
          result.message || "Failed to send message. Please try again.",
        );
      }
    } catch (error) {
      setStatus("error");
      showNotification(
        "error",
        "Network error. Please check your connection and try again.",
      );
    }
  };

  const resetForm = () => {
    setStatus("idle");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <>
      {showPopup && (
        <div className="popup-overlay" onClick={closePopup}>
          <div
            className={`popup-content ${popupType}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="popup-header">
              <div className={`popup-icon ${popupType}`}>
                {popupType === "success" ? "✓" : "!"}
              </div>
              <button className="popup-close" onClick={closePopup}>
                ×
              </button>
            </div>
            <div className="popup-body">
              <h4>{popupType === "success" ? "Success!" : "Error!"}</h4>
              <p>{popupMessage}</p>
            </div>
            <div className="popup-footer">
              <button className="popup-btn" onClick={closePopup}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="contact-form-card">
        {status === "success" ? (
          <div className="success-box animate-in">
            <div className="success-icon">
              <span className="checkmark">✓</span>
            </div>
            <h3>Thank You!</h3>
            <p>Your message has been sent successfully.</p>
            <p className="small-text">We'll get back to you within 24 hours.</p>
            <button
              className="btn-submit"
              onClick={resetForm}
              aria-label="Send another message"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="form-wrapper" noValidate>
            <div className="form-header">
              <h3 className="fw-bold">Get A Quote</h3>
            </div>

            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`custom-input ${status === "error" && !formData.name ? "error" : ""}`}
                placeholder="Enter your Name"
                required
                aria-required="true"
                disabled={status === "sending"}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`custom-input ${status === "error" && !formData.email ? "error" : ""}`}
                placeholder="Enter you Gmail"
                required
                aria-required="true"
                disabled={status === "sending"}
              />
            </div>

            <div className="form-group">
              <label htmlFor="message" className="form-label">
                Your Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                className={`custom-input ${status === "error" && !formData.message ? "error" : ""}`}
                rows="5"
                placeholder="Type your message here..."
                required
                aria-required="true"
                disabled={status === "sending"}
                minLength="10"
              />
              <small className="char-count">
                {formData.message.length}/500 characters
              </small>
            </div>

            <button
              type="submit"
              className={`btn-submit ${status === "sending" ? "loading" : ""}`}
              disabled={status === "sending"}
              aria-label={
                status === "sending" ? "Sending message..." : "Send message"
              }
            >
              {status === "sending" ? (
                <>
                  <span className="spinner"></span>
                  Sending...
                </>
              ) : (
                "SEND MESSAGE"
              )}
            </button>

            <p className="form-footer-text">
              By sending this message, you agree to our{" "}
              <a href="/privacy" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
              .
            </p>
          </form>
        )}
      </div>
    </>
  );
};

export default ContactForm;

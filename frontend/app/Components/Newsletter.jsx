"use client";

import { useState } from "react";
import styles from "../assest/style/Newsletter.module.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function Newsletter() {
  const [status, setStatus] = useState("Submit");
  const [isDisabled, setIsDisabled] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  const showPopup = (msg, type) => {
    setPopup({ show: true, message: msg, type: type });
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 4000);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setIsDisabled(true);
    setStatus("Sending...");

    const formData = new FormData(e.target);
    formData.append("access_key", "ccc4e304-e860-452d-973a-f6433db5ed40");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        showPopup("Success! You've been subscribed.", "success");
        e.target.reset();
      } else {
        showPopup(data.message || "Submission failed.", "error");
      }
    } catch (error) {
      showPopup("Network error. Please try again.", "error");
    } finally {
      setStatus("Submit");
      setIsDisabled(false);
    }
  }

  return (
    <section className={styles.newsletterSection}>
      {popup.show && (
        <div className={`${styles.popup} ${styles[popup.type]}`}>
          <i
            className={
              popup.type === "success"
                ? "bi bi-check-circle-fill"
                : "bi bi-exclamation-triangle-fill"
            }
          ></i>
          <span>{popup.message}</span>
        </div>
      )}

      <div className="container">
        <div className={styles.wrapper}>
          <div className="row g-0 align-items-stretch">
            <div className="col-sm-12 col-md-4 col-lg-5">
              <div className={styles.imageContainer}>
                <img
                  src="https://res.cloudinary.com/dsprfys3x/image/upload/v1773059505/subscribe-bg_ddkehb.jpg"
                  alt="Working on laptop"
                  className={styles.mainImg}
                />
              </div>
            </div>

            <div className="col-sm-12 col-md-8 col-lg-7">
              <div className={styles.blueBox}>
                <h2 className={styles.title}>
                  Subscribe To Our <br /> Newsletter
                </h2>
                <p className={styles.text}>
                  It is a long established fact that a reader will be distracted
                  by the readable content of a page when looking at its layout.
                </p>

                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.inputGroup}>
                    <input
                      type="email"
                      name="email"
                      placeholder="Your email here"
                      className={styles.emailInput}
                      required
                    />
                    <button
                      type="submit"
                      className={styles.submitBtn}
                      disabled={isDisabled}
                    >
                      {status} <i className="bi bi-arrow-right"></i>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

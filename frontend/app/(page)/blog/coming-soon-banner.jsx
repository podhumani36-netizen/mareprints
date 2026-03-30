"use client";

import React, { useState } from "react";
import styles from "../../assest/style/coming-soon.module.css";
import Link from "next/link";

const BlogComingSoon = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("access_key", "ccc4e304-e860-452d-973a-f6433db5ed40");
    formData.append("email", email);
    formData.append("subject", "New Waitlist Subscription");

    setLoading(true);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setShowPopup(true);
        setEmail("");
        setTimeout(() => setShowPopup(false), 4000);
      } else {
        const data = await response.json();
        alert(data.message);
      }
    } catch (error) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupCard}>
            <div className={styles.checkIcon}>✓</div>
            <h4>Welcome to the List!</h4>
            <p>You've successfully joined the waitlist for Mare Enterprise.</p>
            <button
              onClick={() => setShowPopup(false)}
              className={styles.closeBtn}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <div className={styles.sideGraphic}>
        <div className={styles.floatingCard}>
          <div className={styles.line}></div>
          <p>EST. 2026</p>
          <h3 className="text-dark">Mare Enterprise</h3>
        </div>
      </div>

      <div className={styles.contentSide}>
        <nav className={styles.topNav}>
          <Link href="/" className={styles.logo}>
            MARE.
          </Link>
        </nav>

        <main className={styles.mainContent}>
          <span className={styles.upperTitle}>Coming Soon</span>
          <h1 className={styles.title}>
            Knowledge is the <br />
            <span>New Enterprise.</span>
          </h1>
          <p className={styles.text}>
            Our blog is currently being curated by industry experts. Sign up to
            be the first to receive our inaugural whitepaper.
          </p>

          <form onSubmit={handleSubmit} className={styles.inputGroup}>
            <input
              type="email"
              name="email"
              required
              placeholder="Your email address"
              className={styles.minimalInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="submit"
              className={styles.actionBtn}
              disabled={loading}
            >
              {loading ? "Sending..." : "Join Waitlist"}
            </button>
          </form>
        </main>

        <footer className={styles.bottomFooter}>
          <Link href="/" className={styles.backLink}>
            ← Back to main site
          </Link>
        </footer>
      </div>
    </div>
  );
};

export default BlogComingSoon;
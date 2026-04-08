"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../assest/style/nav.module.css";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success"); // 'success' or 'error'
  const [isClosing, setIsClosing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    formData.append("access_key", "ccc4e304-e860-452d-973a-f6433db5ed40");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setPopupType("success");
        setPopupMessage("Success! Your email has been subscribed.");
        setShowPopup(true);
        e.target.reset();
      } else {
        setPopupType("error");
        setPopupMessage("Error: " + data.message);
        setShowPopup(true);
      }
    } catch (error) {
      setPopupType("error");
      setPopupMessage("Something went wrong. Please try again.");
      setShowPopup(true);
    }

    setLoading(false);
  };

  const closePopup = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowPopup(false);
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  // Close on escape key
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape" && showPopup) {
        closePopup();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [showPopup]);

  return (
    <>
      {/* Popup Modal */}
      {showPopup && (
        <div
          className={`${styles.popupOverlay} ${isClosing ? styles.fadeOut : styles.fadeIn}`}
          onClick={closePopup}
        >
          <div
            className={`${styles.popupContent} ${isClosing ? styles.slideDown : styles.slideUp}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.popupHeader}>
              <h3>{popupType === "success" ? "Success!" : "Error!"}</h3>
              <button className={styles.closeButton} onClick={closePopup}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className={styles.popupBody}>
              <div
                className={`${styles.iconWrapper} ${popupType === "success" ? styles.successWrapper : styles.errorWrapper}`}
              >
                <div
                  className={
                    popupType === "success"
                      ? styles.successIcon
                      : styles.errorIcon
                  }
                >
                  {popupType === "success" ? (
                    <i className="bi bi-check-lg"></i>
                  ) : (
                    <i className="bi bi-exclamation-lg"></i>
                  )}
                </div>
              </div>
              <p className={styles.popupMessage}>{popupMessage}</p>
            </div>
            <div className={styles.popupFooter}>
              <button className={styles.okButton} onClick={closePopup}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className={styles.footer}>
        <div className="container pt-5">
          <div className="row g-4">
            {/* Brand Identity */}
            <div className="col-lg-4 col-md-6">
              <div className={styles.brandSection}>
                <h4 className={styles.logo}>
                  <Link href="/" className={styles.logo}>
                    <Image
                      src="https://res.cloudinary.com/dsprfys3x/image/upload/v1773222813/7f83cd09-398d-46d3-9b93-df2a8bdbbf33-removebg-preview_bq3mkg.png"
                      alt="Mare Enterprises"
                        width={200}
                    height={200}
                    style={{ width: "200px", height: "200px" }}
                      priority
                    />
                  </Link>
                </h4>
                <p className={styles.description}>
                  Crafting premium Cutouts and Frames with precision. Based in
                  Chennai, serving quality to your doorstep since 2015.
                </p>
                <div className={styles.socialIcons}>
  <a 
    href="https://www.instagram.com/mare_prints/?utm_source=ig_web_button_share_sheet" 
    target="_blank" 
    rel="noopener noreferrer"
    aria-label="Instagram"
  >
    <i className="bi bi-instagram"></i>
  </a>

  <a 
    href="#" 
    aria-label="YouTube"
  >
    <i className="bi bi-youtube"></i>
  </a>

  <a 
    href="https://www.facebook.com/people/MARE-Prints/61588375887755/" 
    target="_blank" 
    rel="noopener noreferrer"
    aria-label="Facebook"
  >
    <i className="bi bi-facebook"></i>
  </a>
</div>
              </div>
            </div>

            {/* Nav Links Grouped */}
            <div className="col-lg-4 col-md-6">
              <div className="row">
                <div className="col-6">
                  <h6 className={styles.heading}>Quick link</h6>
                  <ul className={styles.list}>
                    <li>
                      <Link href="/">Home</Link>
                    </li>
                    <li>
                      <Link href="/about">About Us</Link>
                    </li>
                    <li>
                      <Link href="/blog">Blog</Link>
                    </li>
                    <li>
                      <Link href="/contact">Contact Us</Link>
                    </li>
                  </ul>
                </div>
                <div className="col-6">
                  <h6 className={styles.heading}>Shop</h6>
                  <ul className={styles.list}>
                    <li>
                      <Link href="/shop">All Products</Link>
                    </li>
                    <li>
                      <Link href="/shop/framed-acrylic-portrait">
                        Framed Acrylic Photo Portrait
                      </Link>
                    </li>
                    <li>
                      <Link href="/shop/framed-acrylic-landscape">
                        Framed Acrylic Photo Landscape
                      </Link>
                    </li>
                    <li>
                      <Link href="/shop/framed-acrylic-cutout">
                        Framed Acrylic Cut Out
                      </Link>
                    </li>
                    <li>
                      <Link href="/shop/framed-acrylic-nameplate">
                        Framed Acrylic Name Plate
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Newsletter / Contact Quick Action */}
            <div className="col-lg-4 col-md-12">
              <h6 className={styles.heading}>Stay Updated</h6>
              <p className={styles.smallText}>
                Subscribe to get offers and new design alerts.
              </p>
              <form className={styles.newsletter} onSubmit={handleSubmit}>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  required
                />

                <button type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Join"}
                </button>
              </form>
            </div>
          </div>

          <div className={styles.bottomBar}>
            <p>
              Copyrights © {currentYear} MARE. All rights Reserved. Powered By
              <a href="https://sagegfx.com" target="_black">
                {" "}
                Sage GFX Digital Solutions
              </a>
              .
            </p>
            <div className={styles.legalLinks}>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms & Conditions</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
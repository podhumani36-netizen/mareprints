"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import styles from "../assest/style/parallax-section.module.css";

const ParallaxBackgroundAnim = () => {
  const bgRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const moveBg = (e) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth) * 30;
      const y = (clientY / window.innerHeight) * 30;

      if (bgRef.current) {
        bgRef.current.style.setProperty("--x", `${x}px`);
        bgRef.current.style.setProperty("--y", `${y}px`);
      }
    };

    window.addEventListener("mousemove", moveBg);
    return () => window.removeEventListener("mousemove", moveBg);
  }, []);

  return (
    <section className={styles.container}>
      <div ref={bgRef} className={styles.bgWrapper}>
        <div className={styles.blobBlue}></div>
        <div className={styles.blobRed}></div>
        <div className={styles.gridOverlay}></div>
        <div
          className={styles.mainImage}
          style={{
            backgroundImage: `url('https://res.cloudinary.com/dsprfys3x/image/upload/v1771823172/wall-pictures-with-orange-background-that-says-love-is-air_604996-943_t8ecoz.jpg')`,
          }}
        />
      </div>

      <div className="container position-relative">
        <div className="row justify-content-center">
          <div
            ref={contentRef}
            className={`col-lg-8 text-center ${styles.content}`}
          >
            <span className={styles.badge}>Interior Design Experts</span>
            <h2 className={styles.title}>
              Need help in <br />
              <span className={styles.gradientText}>
                choosing the right Frame?
              </span>
            </h2>
            <p className={styles.lead}>
              Transform your space with a custom-curated gallery. Our designers
              use your photos to create timeless wall art.
            </p>
            <div className={styles.btnWrapper}>
              <Link href="/contact" className={styles.actionBtn}>
                Connect With Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ParallaxBackgroundAnim;

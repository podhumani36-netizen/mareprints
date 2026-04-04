"use client";

import styles from "../../assest/style/AboutUs.module.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// export default function AboutUss() {
//   const features = [
//     "Precision crafted with care",
//     "Built for every occasion",
//     "Delivered fresh to your door",
//     "Made personal, just for you",
//   ];
export default function AboutUss() {
  const features = [
    "Better quality control",
    "Faster production",
    "Competitive pricing",
    "Custom design flexibility",
  ];

  return (
    <section className={styles.aboutSection}>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-sm-12 mb-lg-0">
            <div className={styles.textContent}>
              <div className="subTitleContainer">
                <span className="subTitle">ABOUT US</span>
              </div>
              <h2 className={styles.mainHeading}>
                We're Crafting Memories Into <span>Stunning Acrylic Art</span>
              </h2>
              <p className={styles.description}>
               Welcome to MARE Prints, a Chennai-based manufacturer of premium acrylic and MDF printing 
solutions with over 12+ years of experience.
              </p>
<p className={styles.description}>
               “Freeze your memories with our prints” — this is the foundation of our work. We combine 
creativity, advanced technology, and precision craftsmanship to deliver products that are both 
visually stunning and long-lasting.
              </p>
              <ul className={styles.featureList}>
                {features.map((item, index) => (
                  <li key={index} className={styles.featureItem}>
                    <div className={styles.checkIcon}>
                      <i className="bi bi-check-circle-fill"></i>
                    </div>
                    
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import styles from "../assest/style/WorkingProcess.module.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const processData = [
  {
    id: "01",
    title: "Upload Your Photo",
    icon: "bi-cloud-upload",
    desc: "Choose and upload your favorite photo through our website. Your image is securely received and prepared for the production process.",
    highlight: false,
  },
  {
    id: "02",
    title: "Design & Acrylic Printing",
    icon: "bi-palette",
    desc: "Our team enhances your image for clarity and color, then prints it on premium acrylic using advanced technology for vibrant and long-lasting results.",
    highlight: true,
  },
  {
    id: "03",
    title: "Quality Check & Delivery",
    icon: "bi-truck",
    desc: "Each product goes through careful quality inspection, is securely packaged, and delivered safely to your doorstep ready to display or gift.",
    highlight: false,
  },
];

export default function WorkingProcess() {
  return (
    <section className={styles.sectionWrapper}>
      <div className="container text-center">
        <div className={styles.header}>
          <span className={styles.subTitle}>WORK PROCESS</span>
          <h2 className={styles.mainTitle}>
            Our Working Process <br /> How We Do
          </h2>
        </div>

        <div className="row g-4 justify-content-center">
          {processData.map((item) => (
            <div key={item.id} className="col-lg-4 col-md-6">
              <div
                className={`${styles.card} ${
                  item.highlight ? styles.activeCard : ""
                }`}
              >
                <div className={styles.cardNumber}>{item.id}</div>

                <div className={styles.contentHeader}>
                  <div className={styles.iconBox}>
                    <i className={`bi ${item.icon}`}></i>
                  </div>
                  <span className={styles.cardSubtitle}>{item.title}</span>
                </div>

                <p className={styles.cardText}>{item.desc}</p>

                <div className={styles.pattern}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

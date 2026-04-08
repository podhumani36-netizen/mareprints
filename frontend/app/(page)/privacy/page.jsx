import styles from "../../assest/style/LegalPage.module.css";

export const metadata = {
  title: "Privacy Policy | MARE Prints",
  description: "Privacy Policy and Shipping Policy for MARE Prints",
};

export default function PrivacyPage() {
  return (
    <div className={styles.legalPage}>
      <div className={styles.wrapper}>
        <div className={styles.heroCard}>
          <span className={styles.badge}>MARE Prints Legal</span>
          <h1 className={styles.heroTitle}>Privacy Policy</h1>
          <p className={styles.heroText}>
            We value your privacy and are committed to protecting your personal
            information. This page explains how we collect, use, and safeguard
            your data, along with our shipping policy for custom-made products.
          </p>
        </div>

        <div className={styles.grid}>
          <aside className={styles.sideCard}>
            <h3 className={styles.sideTitle}>On this page</h3>
            <ul className={styles.sideList}>
              <li><a href="#privacy-policy">Privacy Policy</a></li>
              <li><a href="#information-we-collect">Information We Collect</a></li>
              <li><a href="#how-we-use">How We Use Your Information</a></li>
              <li><a href="#data-protection">Data Protection</a></li>
              <li><a href="#customer-designs">Customer Designs & Photos</a></li>
              <li><a href="#cookies">Cookies & Website Usage</a></li>
              <li><a href="#third-party">Third-Party Services</a></li>
              <li><a href="#shipping-policy">Shipping Policy</a></li>
              <li><a href="#processing-time">Processing Time</a></li>
              <li><a href="#shipping-time">Shipping Time</a></li>
              <li><a href="#packaging">Packaging</a></li>
              <li><a href="#shipping-charges">Shipping Charges</a></li>
              <li><a href="#tracking-delays">Tracking & Delays</a></li>
            </ul>
          </aside>

          <div className={styles.content}>
            <section id="privacy-policy" className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Privacy Policy</h2>
              <p className={styles.sectionIntro}>
                At MARE Prints, we value your privacy and are committed to
                protecting your personal information. This Privacy Policy
                explains how we collect, use, and safeguard your data.
              </p>

              <div id="information-we-collect" className={styles.block}>
                <h3 className={styles.blockTitle}>Information We Collect</h3>
                <p className={styles.blockText}>
                  When you place an order or contact us, we may collect:
                </p>
                <ul className={styles.list}>
                  <li>Name</li>
                  <li>Phone number</li>
                  <li>Email address (if provided)</li>
                  <li>Delivery address</li>
                  <li>Order details such as product, size, and customization</li>
                  <li>Photos, designs, or files shared by you</li>
                </ul>
              </div>

              <div id="how-we-use" className={styles.block}>
                <h3 className={styles.blockTitle}>How We Use Your Information</h3>
                <ul className={styles.list}>
                  <li>Process and fulfill your orders</li>
                  <li>Communicate order updates and delivery details</li>
                  <li>Provide customer support</li>
                  <li>Improve our products and services</li>
                </ul>
              </div>

              <div id="data-protection" className={styles.block}>
                <h3 className={styles.blockTitle}>Data Protection</h3>
                <ul className={styles.list}>
                  <li>Your personal information is kept secure and confidential</li>
                  <li>We do not sell, rent, or share your data with third parties</li>
                  <li>Data is used strictly for business and order-related purposes</li>
                </ul>
              </div>

              <div id="customer-designs" className={styles.block}>
                <h3 className={styles.blockTitle}>Customer Designs & Photos</h3>
                <ul className={styles.list}>
                  <li>All images and designs shared with us are treated as private and confidential</li>
                  <li>We will not use your photos for marketing or promotion without your permission</li>
                </ul>
              </div>

              <div id="cookies" className={styles.block}>
                <h3 className={styles.blockTitle}>Cookies & Website Usage</h3>
                <ul className={styles.list}>
                  <li>Our website may use basic cookies to improve user experience</li>
                  <li>Cookies help us understand website usage and improve services</li>
                </ul>
              </div>

              <div id="third-party" className={styles.block}>
                <h3 className={styles.blockTitle}>Third-Party Services</h3>
                <ul className={styles.list}>
                  <li>We may use trusted third-party services, such as courier partners, for order delivery</li>
                  <li>Only necessary details like name, address, and phone number are shared for shipping purposes</li>
                </ul>
              </div>

              <div className={styles.highlightCard}>
                <h4 className={styles.highlightTitle}>Privacy Commitment</h4>
                <p className={styles.highlightText}>
                  Customer files and customization details are handled with care
                  and used only for business and order-related purposes.
                </p>
              </div>
            </section>

            <section id="shipping-policy" className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Shipping Policy</h2>
              <p className={styles.sectionIntro}>
                At MARE Prints, we ensure safe and timely delivery of all our
                custom-made products.
              </p>

              <div id="processing-time" className={styles.block}>
                <h3 className={styles.blockTitle}>Processing Time</h3>
                <ul className={styles.list}>
                  <li>All orders are custom-made</li>
                  <li>Processing time: 2–5 business days depending on design and quantity</li>
                </ul>
              </div>

              <div id="shipping-time" className={styles.block}>
                <h3 className={styles.blockTitle}>Shipping Time</h3>
                <ul className={styles.list}>
                  <li>Chennai: 3–5 days</li>
                  <li>Tamil Nadu: 5–7 days</li>
                  <li>Rest of India: 5–10 days</li>
                </ul>
              </div>

              <div id="packaging" className={styles.block}>
                <h3 className={styles.blockTitle}>Packaging</h3>
                <p className={styles.blockText}>
                  We use secure, damage-resistant packaging for acrylic and MDF
                  engraved products to ensure safe delivery.
                </p>
              </div>

              <div id="shipping-charges" className={styles.block}>
                <h3 className={styles.blockTitle}>Shipping Charges</h3>
                <ul className={styles.list}>
                  <li>Charges may vary based on product size</li>
                  <li>Charges may vary based on weight</li>
                  <li>Charges may vary based on delivery location</li>
                  <li>Free shipping can be offered for selected orders</li>
                </ul>
              </div>

              <div id="tracking-delays" className={styles.block}>
                <h3 className={styles.blockTitle}>Order Tracking & Delays</h3>
                <ul className={styles.list}>
                  <li>Tracking details will be shared once the order is shipped</li>
                  <li>Delivery may be delayed due to courier issues</li>
                  <li>Delivery may be delayed due to weather conditions</li>
                  <li>Delivery may be delayed during peak seasons</li>
                </ul>
              </div>

              <div className={styles.highlightCard}>
                <h4 className={styles.highlightTitle}>Shipping Note</h4>
                <p className={styles.highlightText}>
                  Delivery timelines may vary slightly because every order is
                  custom-made and packed carefully for safe transit.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
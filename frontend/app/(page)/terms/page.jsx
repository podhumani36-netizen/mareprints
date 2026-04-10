import styles from "../../assest/style/LegalPage.module.css";

export const metadata = {
  title: "Terms & Conditions | MARE Prints",
  description: "Terms and Conditions and Return & Refund Policy for MARE Prints",
};

export default function TermsPage() {
  return (
    <div className={styles.legalPage}>
      <div className={styles.wrapper}>
        <div className={styles.heroCard}>
          <span className={styles.badge}>MARE Prints Legal</span>
          <h1 className={styles.heroTitle}>Terms & Conditions</h1>
          <p className={styles.heroText}>
            By placing an order with MARE Prints, you agree to the following
            terms regarding order approval, pricing, cancellations, liability,
            returns, refunds, and support.
          </p>
        </div>

        <div className={styles.grid}>
          <aside className={styles.sideCard}>
            <h3 className={styles.sideTitle}>On this page</h3>
            <ul className={styles.sideList}>
              <li><a href="#terms-conditions">Terms & Conditions</a></li>
              <li><a href="#manufacturer-rights">Manufacturer Rights</a></li>
              <li><a href="#orders">Orders</a></li>
              <li><a href="#design-approval">Design Approval</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#cancellations">Cancellations</a></li>
              <li><a href="#liability">Liability</a></li>
              <li><a href="#product-nature">Product Nature</a></li>
              <li><a href="#return-refund">Return & Refund Policy</a></li>
              <li><a href="#returns">Returns</a></li>
              <li><a href="#proof-requirement">Proof Requirement</a></li>
              <li><a href="#refunds">Refunds</a></li>
              <li><a href="#non-returnable">Non-Returnable Items</a></li>
              <li><a href="#cancellation-window">Cancellation Window</a></li>
              <li><a href="#how-to-cancel">How to Cancel</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </aside>

          <div className={styles.content}>
            <section id="terms-conditions" className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Terms & Conditions</h2>
              <p className={styles.sectionIntro}>
                Welcome to MARE Prints. By placing an order, you agree to the
                following terms.
              </p>

              <div id="manufacturer-rights" className={styles.block}>
                <h3 className={styles.blockTitle}>Manufacturer Rights</h3>
                <ul className={styles.list}>
                  <li>MARE Prints is a direct manufacturer of Acrylic & MDF products</li>
                  <li>We reserve the right to refuse any order if required</li>
                  <li>We may modify pricing or services without prior notice</li>
                </ul>
              </div>

              <div id="orders" className={styles.block}>
                <h3 className={styles.blockTitle}>Orders</h3>
                <ul className={styles.list}>
                  <li>All orders are customized as per customer requirements</li>
                  <li>Customers must verify design previews before approval</li>
                </ul>
              </div>

              <div id="design-approval" className={styles.block}>
                <h3 className={styles.blockTitle}>Design Approval</h3>
                <ul className={styles.list}>
                  <li>Once approved, no changes can be made</li>
                  <li>MARE Prints is not responsible for errors approved by the customer</li>
                </ul>
              </div>

              <div id="pricing" className={styles.block}>
                <h3 className={styles.blockTitle}>Pricing</h3>
                <ul className={styles.list}>
                  <li>Prices are subject to change without prior notice</li>
                  <li>Full or partial advance payment may be required</li>
                </ul>
              </div>

              <div id="cancellations" className={styles.block}>
                <h3 className={styles.blockTitle}>Cancellations</h3>
                <ul className={styles.list}>
                  <li>Orders cannot be cancelled once production starts</li>
                </ul>
              </div>

              <div id="liability" className={styles.block}>
                <h3 className={styles.blockTitle}>Liability</h3>
                <ul className={styles.list}>
                  <li>We are not responsible for minor color variations due to screen vs print differences</li>
                  <li>We are not responsible for courier delays</li>
                </ul>
              </div>

              <div id="product-nature" className={styles.block}>
                <h3 className={styles.blockTitle}>Product Nature</h3>
                <ul className={styles.list}>
                  <li>Slight variations may occur as products are custom-made</li>
                </ul>
              </div>

              <div className={styles.highlightCard}>
                <h4 className={styles.highlightTitle}>Important Note</h4>
                <p className={styles.highlightText}>
                  Customers are requested to review previews carefully before
                  final approval, since approved custom orders cannot be changed
                  later.
                </p>
              </div>
            </section>

            <section id="return-refund" className={styles.sectionCard}>
              <h1 className={styles.sectionTitle}>Return & Refund Policy</h1>
              <p className={styles.sectionIntro}>
                Every product is custom-made with precision and care. Since our
                products are personalized, we follow a strict but fair return policy.
              </p>

              <div id="returns" className={styles.block}>
                <h3 className={styles.blockTitle}>Returns</h3>
                <ul className={styles.list}>
                  <li>
                    We do not accept returns on customized or personalized
                    products unless there is a defect or error from our side
                  </li>
                  <li>Returns are only eligible if the product is damaged during delivery</li>
                  <li>Returns are only eligible if there is a manufacturing defect</li>
                  <li>Returns are only eligible if the product is different from the confirmed order</li>
                </ul>
              </div>

              <div id="proof-requirement" className={styles.block}>
                <h3 className={styles.blockTitle}>Proof Requirement</h3>
                <ul className={styles.list}>
                  <li>Provide an unboxing video</li>
                  <li>Share clear photos of the issue within 24 hours of delivery</li>
                  <li>Without proper proof, returns may not be accepted</li>
                </ul>
              </div>

              <div id="refunds" className={styles.block}>
                <h3 className={styles.blockTitle}>Refunds</h3>
                <ul className={styles.list}>
                  <li>Once the issue is verified, replacement is the preferred option</li>
                  <li>Partial or full refund may be provided based on the situation</li>
                  <li>Approved refunds will be processed within 5–7 business days</li>
                </ul>
              </div>

              <div className={styles.block}>
                <h3 className={styles.blockTitle}>Shipping Issues</h3>
                <ul className={styles.list}>
                  <li>We are not responsible for delays caused by courier services</li>
                  <li>However, we will support you in tracking and resolving delivery issues</li>
                </ul>
              </div>

              <div id="non-returnable" className={styles.block}>
                <h3 className={styles.blockTitle}>Non-Returnable Items</h3>
                <ul className={styles.list}>
                  <li>Customized acrylic & MDF prints</li>
                  <li>Engraved products</li>
                  <li>Name boards and personalized items</li>
                  <li>Orders approved by the customer before production</li>
                </ul>
              </div>

              <div id="cancellation-window" className={styles.block}>
                <h3 className={styles.blockTitle}>Cancellation Window</h3>
                <ul className={styles.list}>
                  <li>Orders can be cancelled within 2 days (48 hours) of placing the order</li>
                  <li>Cancellation is allowed only if production has not started</li>
                  <li>Once the design is approved or production begins, cancellation is not possible</li>
                  <li>If cancelled within 48 hours and before production, full refund will be processed</li>
                  <li>If work has already started, cancellation will not be accepted</li>
                </ul>
              </div>

              <div id="how-to-cancel" className={styles.block}>
                <h3 className={styles.blockTitle}>How to Cancel</h3>
                <p className={styles.blockText}>To cancel your order, contact us with:</p>
                <ul className={styles.list}>
                  <li>Order details</li>
                  <li>Reason for cancellation</li>
                  <li>Clear photos & videos of the issue</li>
                </ul>
              </div>

              <div id="contact" className={styles.contactBox}>
                <h4>Contact MARE Prints</h4>
                <p>
                  <strong>Phone:</strong> <a href="tel:+918148040202">+91 8148040202</a>
                  <br />
                  <strong>Email:</strong>{" "}
                  <a href="mailto:mareenterprises0@gmail.com">
                    mareenterprises0@gmail.com
                  </a>
                  <br />
                  WhatsApp support available
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
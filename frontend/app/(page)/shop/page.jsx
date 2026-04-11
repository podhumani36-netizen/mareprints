"use client";

import Link from "next/link";
import styles from "../../assest/style/Shop.module.css";
import { useState, useMemo, lazy, Suspense } from "react";
import { shopData } from "../../data/shopdata";

const Products = lazy(() => import("../../Components/products"));

const portraitProducts = shopData.filter(
  (item) => String(item.type).toLowerCase() === "portrait"
);

const landscapeProducts = shopData.filter(
  (item) => String(item.type).toLowerCase() === "landscape"
);

const cutoutProducts = shopData.filter(
  (item) => String(item.type).toLowerCase() === "cutout"
);

const useNewsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setSubmitStatus({
        type: "error",
        message: "Please enter your email address",
      });
      return;
    }

    if (!validateEmail(email)) {
      setSubmitStatus({
        type: "error",
        message: "Please enter a valid email address",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: "", message: "" });

    const formData = new FormData();
    formData.append("email", email);
    formData.append("access_key", process.env.NEXT_PUBLIC_WEB3FORMS_KEY);
    formData.append("subject", "Newsletter Subscription - Shop Page");
    formData.append("from_name", "Website Visitor");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: "Successfully subscribed to newsletter!",
        });
        setEmail("");

        setTimeout(() => {
          setSubmitStatus({ type: "", message: "" });
        }, 5000);
      } else {
        setSubmitStatus({
          type: "error",
          message: data.message || "Subscription failed. Please try again.",
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Network error. Please check your connection.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    email,
    setEmail,
    isSubmitting,
    submitStatus,
    handleSubmit,
  };
};

const HeroStats = ({ stats }) => (
  <div className={styles.heroStats}>
    {stats.map((stat, index) => (
      <div key={index} className={styles.heroStat}>
        <span className={styles.statValue}>{stat.value}</span>
        <div className={styles.statInfo}>
          <span className={styles.statLabel}>{stat.label}</span>
          <span className={styles.statDesc}>{stat.description}</span>
        </div>
      </div>
    ))}
  </div>
);

const HeroVisual = () => {
  const heroImages = useMemo(
    () => [
      {
        href: "/shop/framed-acrylic-portrait",
        src: "https://res.cloudinary.com/dsprfys3x/image/upload/v1773834379/ChatGPT_Image_Mar_18__2026__05_16_04_PM_i4t6od.png",
        alt: "Acrylic art piece",
      },
      {
        href: "/shop/framed-acrylic-landscape",
        src: "https://res.cloudinary.com/dsprfys3x/image/upload/v1773837286/ChatGPT_Image_Mar_18__2026__06_04_06_PM_ae1aln.png",
        alt: "Modern acrylic frame",
      },
      {
        href: "/shop/framed-acrylic-cutout",
        src: "https://res.cloudinary.com/dsprfys3x/image/upload/v1773848543/ChatGPT_Image_Mar_18__2026__06_11_53_PM_xfuyyc.png",
        alt: "Custom acrylic cutout",
      },
      {
        href: "/shop/framed-acrylic-nameplate",
        src: "https://res.cloudinary.com/dsprfys3x/image/upload/v1773834015/ChatGPT_Image_Mar_18__2026__04_39_13_PM_avrfk5.png",
        alt: "Acrylic nameplate",
      },
    ],
    []
  );

  return (
    <div className={styles.heroVisual}>
      <div className={styles.visualGrid}>
        {heroImages.map((image, index) => (
          <div key={index} className={styles.visualItem}>
            <Link href={image.href}>
              <img
                src={image.src}
                alt={image.alt}
                className={styles.visualImage}
                loading={index === 0 ? "eager" : "lazy"}
              />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProductSection = ({ title, type, data = [], limit = 8 }) => {
  const productData = useMemo(() => {
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  }, [data]);

  if (!Array.isArray(productData) || productData.length === 0) return null;

  return (
    <div className="row mt-4">
      <div className="col-12">
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.sectionTag}>Collection</span>
            <h2 className={styles.sectionTitle}>{title}</h2>
          </div>
          <Link
            href={`/category/${String(type).toLowerCase()}`}
            className={styles.viewAllLink}
          >
            View All <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
        <Suspense
          fallback={
            <div className={styles.loadingContainer}>Loading products...</div>
          }
        >
          <Products
            title={type}
            data={productData}
            limit={limit}
            link="/product"
          />
        </Suspense>
      </div>
    </div>
  );
};

const EditorialSection = () => (
  <section className={styles.editorial}>
    <div className="container-fluid px-lg-5">
      <div className={styles.editorialGrid}>
        <div className={styles.editorialContent}>
          <span className={styles.editorialTag}>Craftsmanship</span>
          <h2 className={styles.editorialTitle}>
            Where Precision Meets
            <br />
            Artistry
          </h2>
          <p className={styles.editorialText}>
            Each piece in our collection is carefully crafted by skilled
            artisans, combining traditional techniques with modern technology to
            create timeless pieces that elevate any space.
          </p>

          <div className={styles.craftStats}>
            {[
              { number: "8", label: "Hours of\ncraftsmanship" },
              { number: "3", label: "Quality\nchecks" },
              { number: "∞", label: "Attention\nto detail" },
            ].map((stat, index) => (
              <div key={index} className={styles.craftStat}>
                <span className={styles.craftNumber}>{stat.number}</span>
                <span className={styles.craftLabel}>{stat.label}</span>
              </div>
            ))}
          </div>

          <Link href="/contact" className={styles.editorialLink}>
            Discover Our Process
            <i className="bi bi-arrow-right"></i>
          </Link>
        </div>

        <div className={styles.editorialVisual}>
          <div className={styles.visualStack}>
            {[
              "https://res.cloudinary.com/dsprfys3x/image/upload/v1771497121/image1_mjecqe.avif",
              "https://res.cloudinary.com/dsprfys3x/image/upload/v1771497121/3d-rendered-photos-family-collage-templates-half-tone-different-designs_1096167-25229_rjv27k.jpg",
            ].map((src, index) => (
              <div key={index} className={styles.stackItem}>
                <img
                  src={src}
                  alt={`Crafting process ${index + 1}`}
                  className={styles.stackImage}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

const FeaturedCollections = () => {
  const collections = useMemo(
    () => [
      {
        href: "/",
        src: "https://res.cloudinary.com/dsprfys3x/image/upload/v1773143683/grunge-style-scandi-themed-abstract-wall-art-design_1048-20486_isfsfj.avif",
        title: "Modern Minimalist",
        description: "Clean lines, subtle elegance",
      },
      {
        href: "/",
        src: "https://images.unsplash.com/photo-1612532275423-1b8e7a3d7b5a?w=600&h=800&fit=crop",
        title: "Vintage Revival",
        description: "Classic designs reimagined",
      },
      {
        href: "/",
        src: "https://res.cloudinary.com/dsprfys3x/image/upload/v1773145221/luxury-brand-label_1017-1854_lnfb9i.avif",
        title: "Luxury Edition",
        description: "Premium materials, exceptional finish",
      },
    ],
    []
  );

  return (
    <section className={styles.featuredCollections}>
      <div className="container-fluid px-lg-5">
        <div className={styles.collectionsHeader}>
          <h2 className={styles.collectionsTitle}>Curated Collections</h2>
          <p className={styles.collectionsDesc}>
            Discover our specially curated collections for every space
          </p>
        </div>

        <div className={styles.collectionsGrid}>
          {collections.map((collection, index) => (
            <Link
              key={index}
              href={collection.href}
              className={styles.collectionCard}
            >
              <div className={styles.cardImage}>
                <img
                  src={collection.src}
                  alt={collection.title}
                  className={styles.cardImg}
                  loading="lazy"
                />
                <div className={styles.imageOverlay}></div>
              </div>
              <div className={styles.cardContent}>
                <h3>{collection.title}</h3>
                <p>{collection.description}</p>
                <span className={styles.cardLink}>
                  Explore <i className="bi bi-arrow-right"></i>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

const NewsletterSection = ({
  email,
  setEmail,
  isSubmitting,
  submitStatus,
  handleSubmit,
}) => (
  <section className={styles.minimalNewsletter}>
    <div className="container">
      <div className={styles.newsletterInner}>
        <div className={styles.newsletterHeader}>
          <span className={styles.newsletterTag}>Stay Connected</span>
          <h2 className={styles.newsletterTitle}>Join the Inner Circle</h2>
          <p className={styles.newsletterDesc}>
            Be the first to know about new collections, exclusive offers, and
            design inspiration
          </p>
        </div>

        {submitStatus.message && (
          <div
            className={`${styles.newsletterStatus} ${styles[submitStatus.type]}`}
            role="alert"
          >
            <i
              className={`bi ${
                submitStatus.type === "success"
                  ? "bi-check-circle"
                  : "bi-exclamation-circle"
              }`}
            ></i>
            {submitStatus.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.minimalForm}>
          <div className={styles.formGroup}>
            <input
              type="email"
              placeholder="Your email address"
              className={styles.minimalInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
              aria-label="Email address for newsletter"
            />
            <button
              type="submit"
              className={styles.minimalSubmit}
              disabled={isSubmitting}
              aria-label="Subscribe to newsletter"
            >
              {isSubmitting ? (
                <span className={styles.spinner} aria-hidden="true"></span>
              ) : (
                "Subscribe"
              )}
            </button>
          </div>
        </form>

        <p className={styles.privacyNote}>
          By subscribing, you agree to our Privacy Policy. Unsubscribe at any
          time.
        </p>
      </div>
    </div>
  </section>
);

export default function Shop() {
  const { email, setEmail, isSubmitting, submitStatus, handleSubmit } =
    useNewsletter();

  const stats = useMemo(
    () => [
      {
        value: "25+",
        label: "Products",
        description: "Custom Acrylic Designs",
      },
      { value: "50+", label: "Happy Clients", description: "Across India" },
      { value: "24/7", label: "Support", description: "Dedicated Assistance" },
    ],
    []
  );

  const productSections = useMemo(
    () => [
      {
        title: "Framed Acrylic Photo Portrait",
        type: "Portrait",
        data: portraitProducts,
        limit: 8,
      },
      {
        title: "Framed Acrylic Photo Landscape",
        type: "Landscape",
        data: landscapeProducts,
        limit: 4,
      },
      {
        title: "Framed Acrylic Photo Cutout",
        type: "Cutout",
        data: cutoutProducts,
        limit: 4,
      },
    ],
    []
  );

  return (
    <main className={styles.luxuryShop}>
      <section className={styles.luxuryHero}>
        <div className={styles.heroContent}>
          <span className={styles.heroTag}>Since 2013</span>

          <h1 className={styles.heroTitle}>
            The Art of <br />
            <span className={styles.highlight}>Precision</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Handcrafted acrylic creations designed for those who value elegance,
            detail, and timeless craftsmanship.
          </p>

          <HeroStats stats={stats} />
        </div>

        <HeroVisual />
      </section>

      <section className="futuristic-home container">
        {productSections.map((section, index) => (
          <ProductSection key={index} {...section} />
        ))}
      </section>

      <EditorialSection />
      <FeaturedCollections />
      <NewsletterSection
        email={email}
        setEmail={setEmail}
        isSubmitting={isSubmitting}
        submitStatus={submitStatus}
        handleSubmit={handleSubmit}
      />
    </main>
  );
}
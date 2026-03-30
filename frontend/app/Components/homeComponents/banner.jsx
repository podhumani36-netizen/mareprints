"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import styles from "./home.module.css";
import Link from "next/link";

const slides = [
  {
    id: 1,
    title: "Framed Acrylic Photo Portrait",
    description:
      "Relive every moment in a single frame with beautifully curated portrait designs that tell your story.",
    image:
      "https://res.cloudinary.com/dsprfys3x/image/upload/v1773834748/ChatGPT_Image_Mar_18__2026__05_22_03_PM_ytszql.png",
    bgImage:
      "https://res.cloudinary.com/dsprfys3x/image/upload/v1773917307/ChatGPT_Image_Mar_19__2026__04_17_15_PM_hpicrk.png",
    icon: "bi-images",
    color: "#2C7FB8",
  },
  {
    id: 2,
    title: "Framed Acrylic Photo Landscape",
    description:
      "Showcase your best shots with clear, vibrant landscape prints that truly stand out.",
    image:
      "https://res.cloudinary.com/dsprfys3x/image/upload/v1773835036/Coastal_stroll_under_the_sun_boqnie.png",
    bgImage:
      "https://res.cloudinary.com/dsprfys3x/image/upload/v1773920975/ChatGPT_Image_Mar_19__2026__05_19_20_PM_jkluvh.png",
    icon: "bi-camera",
    color: "#E11B22",
  },
  {
    id: 3,
    title: "Framed Acrylic Cut-Out",
    description:
      "Every edge is perfectly crafted with precision cut-outs that highlight what matters most.",
    image:
      "https://res.cloudinary.com/dsprfys3x/image/upload/v1773848554/ChatGPT_Image_Mar_18__2026__06_10_11_PM_o3w4yc.png",
    bgImage:
      "https://res.cloudinary.com/dsprfys3x/image/upload/v1773848543/ChatGPT_Image_Mar_18__2026__06_11_53_PM_xfuyyc.png",
    icon: "bi-border-width",
    color: "#f01731",
  },
  {
    id: 4,
    title: "Framed Acrylic Name Plate",
    description:
      "Simple, stylish, and timeless name plates that add elegance to any space.",
    image:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format",
    bgImage:
      "https://res.cloudinary.com/dsprfys3x/image/upload/v1773854065/ChatGPT_Image_Mar_18__2026__10_44_00_PM_jcshkn.png",
    icon: "bi-square",
    color: "#2C7FB8",
  },
];

const Banner = () => {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const progressInterval = useRef(null);
  const autoPlayInterval = useRef(null);
  const transitionTimeout = useRef(null);
  const bannerRef = useRef(null);

  const totalSlides = slides.length;
  const minSwipeDistance = 50;

  const cleanup = useCallback(() => {
    if (autoPlayInterval.current) {
      clearInterval(autoPlayInterval.current);
      autoPlayInterval.current = null;
    }
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    if (transitionTimeout.current) {
      clearTimeout(transitionTimeout.current);
      transitionTimeout.current = null;
    }
  }, []);

  const nextSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
    setProgress(0);
  }, [isAnimating, totalSlides]);

  const prevSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
    setProgress(0);
  }, [isAnimating, totalSlides]);

  const goToSlide = useCallback(
    (index) => {
      if (isAnimating || index === current) return;
      setIsAnimating(true);
      setCurrent(index);
      setProgress(0);
    },
    [isAnimating, current],
  );

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  useEffect(() => {
    if (transitionTimeout.current) {
      clearTimeout(transitionTimeout.current);
    }

    transitionTimeout.current = setTimeout(() => {
      setIsAnimating(false);
    }, 800);

    return () => {
      if (transitionTimeout.current) {
        clearTimeout(transitionTimeout.current);
      }
    };
  }, [current]);

  useEffect(() => {
    startAutoPlay();

    return () => {
      cleanup();
    };
  }, [cleanup]);

  const startAutoPlay = useCallback(() => {
    cleanup();

    autoPlayInterval.current = setInterval(() => {
      nextSlide();
    }, 8000);

    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + 1;
      });
    }, 80);
  }, [nextSlide, cleanup]);

  const handleMouseEnter = useCallback(() => {
    cleanup();
  }, [cleanup]);

  const handleMouseLeave = useCallback(() => {
    startAutoPlay();
  }, [startAutoPlay]);

  const formatSlideNumber = (num) => {
    return num.toString().padStart(2, "0");
  };

  return (
    <section
      ref={bannerRef}
      className={`position-relative overflow-hidden ${styles.banner}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`position-absolute w-100 h-100 ${styles.slide} 
            ${index === current ? styles.activeSlide : ""}`}
          style={{
            zIndex: index === current ? 2 : 1,
            opacity: index === current ? 1 : 0,
            visibility: index === current ? "visible" : "hidden",
            transition: "opacity 0.8s ease-in-out, visibility 0.8s ease-in-out",
          }}
        >
          <div className="position-absolute w-100 h-100">
            <div
              className="w-100 h-100"
              style={{
                backgroundImage: `url(${slide.bgImage || slide.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                transform: index === current ? "scale(1)" : "scale(1.1)",
                transition: "transform 8s linear",
              }}
            >
              <div className={`w-100 h-100 ${styles.overlay}`}></div>
            </div>
          </div>

          <div className="container h-100 position-relative d-flex align-items-center">
            <div className="row w-100 align-items-center">
              <div className="col-12 col-lg-7 text-white">
                <div className={index === current ? styles.fadeInUp : ""}>
                  <div
                    className={`d-inline-flex align-items-center mb-3 mb-md-4 ${styles.badge}`}
                    style={{
                      backgroundColor: `${slide.color}20`,
                      borderColor: slide.color,
                      color: slide.color,
                    }}
                  >
                    <i className={`bi ${slide.icon} me-2`}></i>
                    <span className="d-none d-sm-inline">Featured Product</span>
                    <span className="d-sm-none">Featured</span>
                  </div>

                  <h1 className={`fw-bold mb-2 mb-md-3 ${styles.title}`}>
                    {slide.title}
                  </h1>

                  <p className={`mb-3 mb-md-4 ${styles.description}`}>
                    {slide.description}
                  </p>

                  <Link
                    href="/contact"
                    className={`btn px-4 px-md-5 py-2 py-md-3 d-inline-flex align-items-center ${styles.contactBtn}`}
                    style={{
                      background: `linear-gradient(135deg, ${slide.color}, ${slide.color}dd)`,
                    }}
                  >
                    <i className="bi bi-envelope-paper me-2"></i>
                    <span className="d-none d-sm-inline">Contact Us</span>
                    <span className="d-sm-none">Contact</span>
                    <i className="bi bi-arrow-right ms-2"></i>
                  </Link>
                </div>
              </div>

              <div className="col-lg-5 d-none d-lg-block">
                <div
                  className={`${styles.imageCard} ${index === current ? styles.scaleIn : ""}`}
                  style={{ borderColor: slide.color }}
                >
                  <div className={styles.imageWrapper}>
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="img-fluid rounded-4"
                      style={{
                        width: "100%",
                        height: "auto",
                        maxWidth: "550px",
                      }}
                    />
                  </div>
                  <div
                    className={`position-absolute ${styles.imageBadge}`}
                    style={{ background: slide.color }}
                  >
                    <i className="bi bi-star-fill text-warning me-1"></i>
                    Premium
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div
        className={`d-lg-none position-absolute ${styles.mobileImagePreview}`}
      >
        <img
          src={slides[current].image}
          alt={slides[current].title}
          className="img-fluid rounded-3"
          style={{
            maxHeight: "200px",
            width: "auto",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          }}
        />
      </div>

      <div className={styles.slideCounter}>
        <span className={styles.currentSlide}>
          {formatSlideNumber(current + 1)}
        </span>
        <span className={styles.counterSeparator}>/</span>
        <span className={styles.totalSlides}>
          {formatSlideNumber(totalSlides)}
        </span>
      </div>

      <div
        className={`d-flex d-lg-none position-absolute ${styles.mobileDots}`}
      >
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`${styles.mobileDot} ${index === current ? styles.activeMobileDot : ""}`}
            style={{
              backgroundColor:
                index === current
                  ? slides[current].color
                  : "rgba(255,255,255,0.3)",
            }}
            disabled={isAnimating}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <button
        onClick={prevSlide}
        className={`position-absolute top-50 start-0 translate-middle-y ms-4 d-none d-lg-flex ${styles.navBtn}`}
        aria-label="Previous slide"
        disabled={isAnimating}
      >
        <i className="bi bi-chevron-left"></i>
      </button>

      <button
        onClick={nextSlide}
        className={`position-absolute top-50 end-0 translate-middle-y me-4 d-none d-lg-flex ${styles.navBtn}`}
        aria-label="Next slide"
        disabled={isAnimating}
      >
        <i className="bi bi-chevron-right"></i>
      </button>

      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className={`d-lg-none ${styles.swipeInstruction}`}>
        <i className="bi bi-arrow-left-right"></i>
        <span>Swipe to navigate</span>
      </div>
    </section>
  );
};

export default Banner;

"use client";

import React, { useEffect, useRef, useState, useCallback, memo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../assest/style/about.css";
import HeroBanner from "../../Components/minbanner";
import AboutUss from "./AboutUs";
import WorkingProcess from "../../Components/WorkingProcess";

const features = [
  "Precision crafted with care",
  "Built for every occasion",
  "Delivered fresh to your door",
  "Made personal, just for you",
];

const STATS_DATA = [
  { value: "10+", label: "Years Experience" },
  { value: "5k+", label: "Happy Clients" },
  { value: "100%", label: "Felt Texture" },
];

const GALLERY_DATA = [
  {
    id: 1,
    url: "https://res.cloudinary.com/dsprfys3x/image/upload/v1771503177/framed-picture-woman-with-silhouette-woman-wooden-background_1160834-13463_zgi8bb.jpg",
    title: "Minimalist Silhouette",
    cat: "Fine Art",
    layout: "span-4",
  },
  {
    id: 2,
    url: "https://res.cloudinary.com/dsprfys3x/image/upload/v1771497120/wall-gallery-with-colorful-frames-various-pictures_1282444-196756_immrbk.jpg",
    title: "Colorful Gallery Wall",
    cat: "Lifestyle",
    layout: "span-8",
  },
  {
    id: 3,
    url: "https://res.cloudinary.com/dsprfys3x/image/upload/v1771497121/visual-personalized-photo-frame-with-family-picture-fathers-day_1314467-138733_aeznef.jpg",
    title: "Personalized Prints",
    cat: "Custom",
    layout: "span-7",
  },
  {
    id: 4,
    url: "https://res.cloudinary.com/dsprfys3x/image/upload/v1771497120/vintage-ornate-picture-frame-sits-rustic-wooden-surface-casting-warm-glow_856795-82601_wznh4z.jpg",
    title: "Vintage Textures",
    cat: "Legacy",
    layout: "span-5",
  },
];

const VIDEO_GALLERY_DATA = [
  {
    id: 1,
    url: "https://res.cloudinary.com/dsprfys3x/video/upload/v1771306294/fridge-magnet-video_rn50lq.mp4",
    title: "Framed Acrylic Photo Portrait",
    description: "Elegant acrylic framing for your cherished memories",
  },
  {
    id: 2,
    url: "https://res.cloudinary.com/dsprfys3x/video/upload/v1771306294/acrylic-name-plate_kv6vdk.mp4",
    title: "Acrylic Framed Acrylic Name Plate",
    description:
      "Personalized Framed Acrylic Name Plates for professional spaces",
  },
  {
    id: 3,
    url: "https://res.cloudinary.com/dsprfys3x/video/upload/v1771306293/acrylic-photo-mini-gallery_jnxz0l.mp4",
    title: "Acrylic Photo Mini Gallery",
    description: "Create stunning photo collections with acrylic displays",
  },
  {
    id: 4,
    url: "https://res.cloudinary.com/dsprfys3x/video/upload/v1771306293/framed-acrylic-photo_uexs43.mp4",
    title: "Transparent Framed Acrylic Photo Portrait",
    description: "Modern transparent frames for contemporary spaces",
  },
];

const WHY_CHOOSE_US = [
  "Direct Manufacturer (Acrylic & MDF)",
  "12+ Years Experience",
  "Premium Quality Materials",
  "Precision Cutting & Engraving",
  "Fast Turnaround Time",
  "Best Pricing (No Middlemen)",
];

const VideoPlayer = memo(({ video, isActive, onLoad, onError, isLoading }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && isActive) {
      videoRef.current.load();
    }
  }, [video.url, isActive]);

  return (
    <div className="video-player-wrapper position-relative w-100 h-100">
      <video
        ref={videoRef}
        key={video.url}
        autoPlay
        loop
        muted
        playsInline
        className="img-fluid rounded-custom shadow-lg w-100"
        style={{
          width: "100%",
          height: "auto",
          minHeight: "300px",
          objectFit: "cover",
          backgroundColor: "#f5f5f5",
          opacity: isLoading ? 0.5 : 1,
          transition: "opacity 0.3s ease",
        }}
        onLoadedData={onLoad}
        onError={onError}
      >
        <source src={video.url} type="video/mp4" />
        <source src={video.url.replace(".mp4", ".webm")} type="video/webm" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
});

VideoPlayer.displayName = "VideoPlayer";

const VideoGallery = () => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);

  const autoPlayIntervalRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const [progress, setProgress] = useState(0);

  const totalVideos = VIDEO_GALLERY_DATA.length;
  const AUTO_PLAY_DELAY = 5000;
  const PROGRESS_UPDATE_INTERVAL = 50;

  const clearAllIntervals = useCallback(() => {
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
      autoPlayIntervalRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const startAutoPlay = useCallback(() => {
    clearAllIntervals();

    if (isAutoPlaying && !isHovered) {
      setProgress(0);

      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            return 0;
          }
          return prev + 100 / (AUTO_PLAY_DELAY / PROGRESS_UPDATE_INTERVAL);
        });
      }, PROGRESS_UPDATE_INTERVAL);

      autoPlayIntervalRef.current = setInterval(() => {
        setCurrentVideoIndex((prev) => (prev + 1) % totalVideos);
        setIsLoading(true);
      }, AUTO_PLAY_DELAY);
    }
  }, [isAutoPlaying, isHovered, totalVideos, clearAllIntervals]);

  const handleNext = useCallback(() => {
    clearAllIntervals();
    setCurrentVideoIndex((prev) => (prev + 1) % totalVideos);
    setIsLoading(true);
    setProgress(0);
  }, [totalVideos, clearAllIntervals]);

  const handlePrevious = useCallback(() => {
    clearAllIntervals();
    setCurrentVideoIndex((prev) => (prev - 1 + totalVideos) % totalVideos);
    setIsLoading(true);
    setProgress(0);
  }, [totalVideos, clearAllIntervals]);

  const handleVideoLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleVideoError = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleTouchStart = useCallback((e) => {
    setTouchStartX(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(
    (e) => {
      if (!touchStartX) return;

      const touchEndX = e.changedTouches[0].clientX;
      const diffX = touchStartX - touchEndX;

      if (Math.abs(diffX) > 50) {
        if (diffX > 0) {
          handleNext();
        } else {
          handlePrevious();
        }
      }

      setTouchStartX(null);
    },
    [touchStartX, handleNext, handlePrevious],
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    clearAllIntervals();
  }, [clearAllIntervals]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  useEffect(() => {
    startAutoPlay();
    return clearAllIntervals;
  }, [startAutoPlay, clearAllIntervals, isAutoPlaying, isHovered]);

  useEffect(() => {
    setIsLoading(true);
  }, [currentVideoIndex]);

  const currentVideo = VIDEO_GALLERY_DATA[currentVideoIndex];

  return (
    <div
      className="video-gallery-container position-relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="composite-image position-relative overflow-hidden rounded-custom">
        <VideoPlayer
          video={currentVideo}
          isActive={true}
          onLoad={handleVideoLoad}
          onError={handleVideoError}
          isLoading={isLoading}
        />
        <div className="video-info position-absolute bottom-0 start-0 p-4 text-white w-100 bg-gradient-dark">
          <h4 className="mb-1 fw-bold text-light">{currentVideo.title}</h4>
          <p className="mb-2 small opacity-75">{currentVideo.description}</p>
        </div>

        <button
          onClick={handlePrevious}
          className="position-absolute top-50 start-0 translate-middle-y btn btn-dark btn-sm rounded-circle ms-3 nav-arrow d-none"
          style={{
            zIndex: 10,
            width: "44px",
            height: "44px",
            padding: 0,
            opacity: 0.9,
            transition: "all 0.3s ease",
            border: "2px solid rgba(255,255,255,0.2)",
          }}
          disabled={isLoading}
          aria-label="Previous video"
        >
          <i className="bi bi-chevron-left fs-5"></i>
        </button>

        <button
          onClick={handleNext}
          className="position-absolute top-50 end-0 translate-middle-y btn btn-dark btn-sm rounded-circle me-3 nav-arrow d-none"
          style={{
            zIndex: 10,
            width: "44px",
            height: "44px",
            padding: 0,
            opacity: 0.9,
            transition: "all 0.3s ease",
            border: "2px solid rgba(255,255,255,0.2)",
          }}
          disabled={isLoading}
          aria-label="Next video"
        >
          <i className="bi bi-chevron-right fs-5"></i>
        </button>
      </div>
    </div>
  );
};

function AboutUs() {
  const sectionRefs = useRef({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" },
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const setSectionRef = useCallback(
    (key) => (el) => {
      if (el) {
        sectionRefs.current[key] = el;
      }
    },
    [],
  );

  return (
    <main className="about-context">
      <HeroBanner
        title="About Us"
        imageUrl="https://res.cloudinary.com/dsprfys3x/image/upload/v1771497120/wall-gallery-with-colorful-frames-various-pictures_1282444-196756_immrbk.jpg"
      />

      <section className="container py-5">
        <div className="row g-5 align-items-center">
          <div
            className="col-lg-6 motion-slide-in"
            ref={setSectionRef("intro")}
          >
            <AboutUss />
          </div>

          <div
            className="col-lg-6 motion-fade-up"
            ref={setSectionRef("hero-img")}
          >
            <VideoGallery />
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="row">
            <div className="col-sm-12">
              <WorkingProcess />
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US SECTION */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div
                className="text-center mb-5 motion-fade-up"
                ref={setSectionRef("why-choose-head")}
              >
                <span
                  className="text-uppercase fw-bold"
                  style={{
                    letterSpacing: "2px",
                    color: "#2C7FB8",
                    fontSize: "14px",
                  }}
                >
                  Why Choose Us
                </span>
                <h2 className="fw-bold display-5 text-dark mt-2">
                  Trusted Quality, Crafted With Care
                </h2>
                <p className="text-secondary fs-5 mb-0">
                  We bring experience, premium materials, and precise
                  craftsmanship together to create products that truly stand out.
                </p>
              </div>

              <div className="row g-4">
                {WHY_CHOOSE_US.map((item, index) => (
                  <div
                    key={index}
                    className="col-md-6 motion-fade-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    ref={setSectionRef(`why-item-${index}`)}
                  >
                    <div
                      className="h-100 d-flex align-items-start gap-3 p-4 rounded-4 shadow-sm"
                      style={{
                        backgroundColor: "#f8fbff",
                        border: "1px solid rgba(44,127,184,0.12)",
                      }}
                    >
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                        style={{
                          width: "48px",
                          height: "48px",
                          backgroundColor: "#2C7FB8",
                          color: "#fff",
                          fontSize: "18px",
                        }}
                      >
                        <i className="bi bi-check-lg"></i>
                      </div>

                      <div>
                        <p className="mb-0 fw-semibold text-dark fs-5">
                          {item}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-light">
        <div className="container">
          <div
            className="d-flex justify-content-between align-items-end motion-fade-up"
            ref={setSectionRef("exh-head")}
          >
            <div>
              <h2 className="fw-bold display-5 text-dark">Exhibition Space</h2>
              <p className="text-secondary mb-0 fs-5">
                Browse our latest tactile curation.
              </p>
            </div>
            <div
              className="d-none d-md-block"
              style={{
                width: "100px",
                height: "2px",
                backgroundColor: "var(--bs-primary)",
              }}
            ></div>
          </div>

          <div className="bento-container">
            {GALLERY_DATA.map((img, i) => (
              <div
                key={img.id}
                className={`bento-cell ${img.layout} motion-fade-up`}
                style={{ animationDelay: `${i * 0.1}s` }}
                ref={setSectionRef(`gal-${img.id}`)}
              >
                <div className="exhibit-card position-relative overflow-hidden rounded-4 shadow-sm">
                  <img
                    src={img.url}
                    alt={img.title}
                    className="exhibit-img w-100 h-100"
                    style={{
                      objectFit: "cover",
                      transition: "transform 0.5s ease",
                    }}
                    loading="lazy"
                  />
                  <div
                    className="exhibit-mask position-absolute top-0 start-0 w-100 h-100 d-flex align-items-end p-4"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 50%)",
                    }}
                  >
                    <div className="exhibit-meta text-white">
                      <span className="badge bg-primary bg-opacity-75 mb-2">
                        {img.cat}
                      </span>
                      <h4 className="h5 mb-0">{img.title}</h4>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .nav-arrow:hover {
          transform: translateY(-50%) scale(1.1) !important;
          background-color: var(--bs-primary) !important;
          border-color: var(--bs-primary) !important;
        }

        .exhibit-card:hover img {
          transform: scale(1.05);
        }
      `}</style>
    </main>
  );
}

export default AboutUs;
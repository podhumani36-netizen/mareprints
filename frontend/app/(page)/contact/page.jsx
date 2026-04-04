"use client";

import React, { useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../assest/style/contact.css";
import HeroBanner from "../../Components/minbanner";
import ContactForm from "../../Components/ContactForm";

const OFFICE_CONFIG = {
  details: [
    {
      id: "loc",
      icon: "bi-geo-alt",
      label: "Our Studio",
      value:
        // "3/55 Matha Kovil street, Dhargas, Naduveerapattu, Kancheepuram, Chennai - 600132.",
        "Chennai, Tamil Nadu.",
      theme: "blue",
    },
    {
      id: "tel",
      icon: "bi-telephone",
      label: "Direct Line",
      value: "8148040202",
      theme: "red",
    },
    {
      id: "em",
      icon: "bi-envelope-at",
      label: "Support Email",
      value: "Mareenterprises0@gmail.com",
      theme: "blue",
    },
  ],

  //  UPDATED SOCIAL LINKS
  socials: [
    {
      name: "facebook",
      icon: "bi-facebook",
      link: "https://www.facebook.com/profile.php?id=61588375887755",
    },
    {
      name: "instagram",
      icon: "bi-instagram",
      link: "https://www.instagram.com/mare_prints/?utm_source=ig_web_button_share_sheet",
    },
    {
      name: "youtube",
      icon: "bi-youtube",
      link: "#",
    },
  ],
};

export default function Contact() {
  const shopStatus = useMemo(() => {
    const hour = new Date().getHours();
    const isOpen = hour >= 9 && hour < 18;
    return {
      text: isOpen
        ? "● We're currently Open"
        : "○ Closed - Still accepting messages",
      variant: isOpen ? "status-open" : "status-closed",
    };
  }, []);

  return (
    <main className="contact-root">
      <HeroBanner
        title="Get In Touch"
        imageUrl="https://res.cloudinary.com/dsprfys3x/image/upload/v1771497131/home-printer-based-toner_cafo7m.jpg"
      />

      <section className="contact-overlap container">
        <div className="contact-card shadow-2xl">
          <div className="row g-0">
            
            {/* LEFT SIDE */}
            <div className="col-lg-5 sidebar-info p-4 p-md-5 text-white">
              <div className="d-flex flex-column h-100">
                
                <header className="mb-5">
                  <div className={`status-pill ${shopStatus.variant} mb-3`}>
                    {shopStatus.text}
                  </div>

                  <h2 className="display-6 fw-bold">
                    <span className="text-white">Get in touch</span> <br />
                    <span className="text-highlight">MARE Prints</span>.
                  </h2>

                  <p className="opacity-75 mt-3">
                    We're just a message away. Get in touch and we'll turn your
                    idea into reality.
                  </p>
                </header>

                {/* CONTACT DETAILS */}
                <div className="info-methods flex-grow-1">
                  {OFFICE_CONFIG.details.map((item) => (
                    <div
                      className="d-flex align-items-center mb-4 method-row"
                      key={item.id}
                    >
                      <div
                        className={`method-icon bg-white text-${
                          item.theme === "red" ? "danger" : "primary"
                        }`}
                      >
                        <i className={`bi ${item.icon}`}></i>
                      </div>

                      <div className="ms-3">
                        <small className="d-block text-white-50 text-uppercase fw-bold ls-1">
                          {item.label}
                        </small>
                        <span className="fw-medium">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/*  SOCIAL ICONS */}
                <footer className="social-footer pt-4 border-top border-white-10">
                  <div className="d-flex gap-3">
                    {OFFICE_CONFIG.socials.map((social) => (
                      <a
                        href={social.link}
                        key={social.name}
                        className="social-btn"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.name}
                      >
                        <i className={`bi ${social.icon}`}></i>
                      </a>
                    ))}
                  </div>
                </footer>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="col-lg-7 p-4 p-md-5">
              <ContactForm />
            </div>

          </div>
        </div>
      </section>


      <section className="map-frame mt-5">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.119763973046!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
        />
      </section>
    </main>
  );
}

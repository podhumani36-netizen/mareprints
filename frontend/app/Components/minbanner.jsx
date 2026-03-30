"use client";

import React from "react";
import Link from "next/link";
import "../assest/style/component.css";

const HeroBanner = ({ title, imageUrl }) => {
  return (
    <div className="">
      <div className="banner-section">
        {" "}
        <section
          className="mare-hero-bg w-100"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="overlay"></div>
          <div className="">
            <div className="container text-center hero-content">
              <h1 className="display-3 hero-title mb-3 text-uppercase">
                {title}
              </h1>

              <nav aria-label="breadcrumb">
                <ol className="breadcrumb justify-content-center bg-transparent">
                  <li className="breadcrumb-item">
                    <Link href="/" className="text-decoration-none">
                      <i className="bi bi-house-door-fill me-1"></i>
                      Home
                    </Link>
                  </li>

                  <li className="">
                    <i className="bi bi-chevron-right mx-2"></i>
                  </li>

                  <li
                    className="breadcrumb-item active text-light text-capitalize"
                    aria-current="page"
                  >
                    {title}
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HeroBanner;

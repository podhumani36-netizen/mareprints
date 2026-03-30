"use client";

import React from "react";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";
import "./assest/style/404.css";

export default function Custom404() {
  return (
    <div className="error-page-wrapper">
      <div className="container d-flex align-items-center justify-content-center">
        <div className="row w-100 justify-content-center">
          <div className="col-lg-8">
            <div className="error-card">
              <div className="glitch-wrapper">
                <div className="glitch-text" data-text="404">
                  404
                </div>
              </div>

              <div className="divider-line"></div>

              <div className="content-section">
                <h2 className="error-subtitle">Oops! Page Not Found</h2>
                <p>
                  This page is currently under development. The content you are
                  looking for will be available soon.
                </p>

                <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center mt-5">
                  <Link href="/" className="btn-modern-primary">
                    Go to Home
                  </Link>
                  <button
                    onClick={() => window.history.back()}
                    className="btn-modern-outline"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

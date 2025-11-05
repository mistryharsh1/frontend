// src/components/Footer.jsx
import React from "react";
import "./Footer.css";

/**
 * Global Footer (matches official eVisa Serbia design)
 * - Blue background with white text
 * - Contains main info, contact, and disclaimer
 * - Fully responsive and centered
 */
export default function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container footer-inner">
        {/* Left side: logo + basic info */}
        <div className="footer-left">
          <div className="footer-logo">

             <img src="/logo.svg" alt="Site logo" className="logo-img" />

          </div>
          <p className="footer-desc">
            Official electronic services portal of the Europe.
          </p>
        </div>

        {/* Middle: navigation / contact */}
        <div className="footer-mid">
          <h4>Useful Links</h4>
          <ul className="footer-links">
            <li>
              <a href="#about">About Portal</a>
            </li>
            <li>
              <a href="#help">Help &amp; Support</a>
            </li>
            <li>
              <a href="#contact">Contact</a>
            </li>
            <li>
              <a href="#terms">Terms &amp; Privacy</a>
            </li>
          </ul>
        </div>

        {/* Right: support contact */}
        <div className="footer-right">
          <h4>Contact</h4>
          <p>Email: <a href="mailto:support@serbia.gov.rs">support@europa.gov.eu</a></p>
          <p>Phone: +381 11 123 4567</p>
          <p>Working hours: 09:00-17:00 CET</p>
        </div>
      </div>

      {/* Bottom line */}
      <div className="footer-bottom">
        <div className="container">
          <p className="footer-para">
            © {new Date().getFullYear()} Government of the European Union.
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

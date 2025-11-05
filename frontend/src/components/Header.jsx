// src/components/Header.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Header.css";

/**
 * Header (updated)
 * - Nav: only Home + country selector
 * - Promo cards: redirect to /login and /register
 * - Auth actions (Login/Register or My Application/Logout)
 */
export default function Header() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const COUNTRIES = [
    "Choose Country", "Austria","Belgium","Croatia","Czech Republic","Denmark","Estonia","Finland",
    "France","Germany","Greece","Hungary","Iceland","Italy","Latvia","Liechtenstein",
    "Lithuania","Luxembourg","Malta","Netherlands","Norway","Poland","Portugal",
    "Slovakia","Slovenia","Spain","Sweden","Switzerland","Serbia"
  ];

  const [country, setCountry] = useState(() => {
    try {
      return localStorage.getItem("site_country") || "Serbia";
    } catch (e) {
      return "Serbia";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("site_country", country);
    } catch (e) {
      // ignore
    }
  }, [country]);

  async function handleLogout() {
    try {
      await logout();
    } catch (e) {
      console.error("Logout failed:", e);
    }
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      /* ignore */
    }
    navigate("/login", { replace: true });
  }

  return (
    <header className="site-header" role="banner" data-country={country}>
      {/* TOP STRIP */}
      <div className="header-top">
        <div className="container header-top-inner">
          {/* Brand / Logo */}
          <div className="header-brand">
            <Link to="/" className="logo-link" aria-label="Homepage">
              <img src="/logo.svg" alt="Site logo" className="logo-img" />

            </Link>
          </div>

          {/* Promo buttons (redirects) */}
          <div className="header-promos">
            <button
              className="promo promo-primary"
              onClick={() => navigate("/login")}
              aria-label="Go to eApplications Visa"
              type="button"
            >
              <div className="promo-caption">Go to</div>
              <div className="promo-title">eApplications Visa</div>
            </button>

            <button
              className="promo promo-secondary"
              onClick={() => navigate("/register")}
              aria-label="Go to eApplications Temporary residence"
              type="button"
            >
              <div className="promo-caption">Go to</div>
              <div className="promo-title">eApplications Temporary residence</div>
            </button>
          </div>

          {/* Auth Buttons */}
          <div className="header-actions">
            {currentUser ? (
              <>
                <button
                  className="pill"
                  onClick={() => navigate("/application")}
                  type="button"
                >
                  My Application
                </button>
                <button className="pill" onClick={handleLogout} type="button">
                  Logout
                </button>
              </>
            ) : (
              <>
                <button className="pill" onClick={() => navigate("/login")} type="button">
                  Login
                </button>
                <button className="pill" onClick={() => navigate("/register")} type="button">
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* NAV BAR: only Home + country selector */}
      <nav className="header-nav" role="navigation" aria-label="Main navigation">
        <div className="container header-nav-inner">
          <ul className="nav-list">
            <li>
              <Link to="/" className="nav-link">Home</Link>
            </li>

            {/* Country selector placed inside the nav */}
            <li className="nav-country-item">
              <label htmlFor="nav-country" className="visually-hidden">Choose country</label>
              <select
                id="nav-country"
                className="country-select nav-country-select"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                aria-label="Choose country"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}

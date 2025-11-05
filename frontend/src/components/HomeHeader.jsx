// src/components/Header.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();

  function handleLogout() {
    try {
      localStorage.removeItem("auth_user");
    } catch (e) { /* ignore */ }
    navigate("/login", { replace: true });
  }

  return (
    <header className="app-header" role="banner">
      <div className="header-inner">
        <div className="brand" onClick={() => navigate("/")}>
          <img src="/logo192.png" alt="Logo" className="brand-logo" />
          <div className="brand-text">
            <div className="brand-title">Portal</div>
            <div className="brand-sub">Visa application</div>
          </div>
        </div>

        <div className="header-actions">
          <button className="btn-secondary header-btn" onClick={() => navigate("/application")}>My Application</button>
          <button className="btn-secondary header-btn" onClick={() => navigate("/register")}>Register</button>
          <button className="btn-primary header-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </header>
  );
}

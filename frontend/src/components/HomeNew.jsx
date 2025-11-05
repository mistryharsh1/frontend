// src/components/HomeNew.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header"; // Assuming Header is in the same directory
import "./HomeNew.css";
import { detail } from "../common";

function getAuth() {
  const token = localStorage.getItem("authToken");  
  
  // Add detailed debugging
  console.log("Auth check in UserMaster:", {
    hasToken: !!token,
    tokenValue: token?.substring(0, 20) + "...", // Show first 20 chars for debugging
    timestamp: new Date().toISOString()
  });
  
  return token ? `Bearer ${token}` : "";
}

function checkIsAdmin() {
  const is_admin = localStorage.getItem("is_admin"); 
  return is_admin ? is_admin : 0;
}

export default function HomeNew() {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem("authToken"));
  const isAdmin = checkIsAdmin();
  
  // New state for applications
  const [applications, setApplications] = useState([]);

  // Function to fetch applications
  const fetchApplications = async () => {
    try {
      const response = await fetch(`${detail.ip}/v1/api/admin/applications?page=1&limit=10`, {
        method: 'GET',
        headers: {
          'Authorization': getAuth()
        }
      });
      const data = await response.json();
      if (data.code === 1) {
        setApplications(data.data.applications); // Set applications state
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  return (
    <div className="home-new">
      <Header />

      {/* Updated button to navigate to applications */}
      <div className="container" style={{ marginTop: 12, textAlign: "right" }}>
          {isLoggedIn && (<button className="btn-primary" onClick={() => navigate("/applications")}>
            Show Applications
          </button>)}
        {isAdmin == 1 || isAdmin == true || isAdmin == 'true' && (<button
          className="btn-primary"
          onClick={() => navigate("/user-master")}
        >
          User Master
        </button>)}
        </div>

      {/* Display applications */}
      {applications.length > 0 && (
        <div className="applications-list">
          <h2>Applications</h2>
          <ul>
            {applications.map(app => (
              <li key={app.id}>
                {app.first_name} {app.last_name} - {app.purpose}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* HERO */}
      <section
        className="home-hero"
        style={{ backgroundImage: "url('/home-hero.jpg')" }}
      >
        <div className="home-hero-overlay">
          <div className="container hero-inner">
            <h1 className="hero-title">Welcome to eServices</h1>
            <p className="hero-sub">
              Use electronic services of diplomatic and consular offices and
              other competent authorities of Europe.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- SERVICES SECTION ---------- */}
      <section className="services-section container">
        <h2 className="section-title">All eServices in one place</h2>

        <div className="services-cards">
          {/* Card 1 */}
          <div className="service-card">
            <div className="left-bar" />
            <div className="card-body">
              <h3>For foreign citizens</h3>
              <p>
                Apply for visa C, visa D or temporary residence approval in the
                Europe. Available services are presented after you
                log in.
              </p>
              <div className="card-actions">
                <button
                  className="btn-primary"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
                <a href="/register" className="link">
                  Register an account
                </a>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="service-card">
            <div className="left-bar" />
            <div className="card-body">
              <h3>For companies in Europe</h3>
              <p>
                Apply if you wish to employ one or more foreign citizens.
                eServices available for companies include group visa D and group
                temporary residence.
              </p>
              <div className="card-actions">
                <a
                  href="https://egov.gov.rs"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                >
                  Open eGovernment Portal
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- YELLOW CALL-OUT BANNER ---------- */}
      <section className="yellow-banner">
        <div className="container banner-inner">
          <div className="banner-left" />
          <div className="banner-right">
            <h3>Did you find the service you are looking for?</h3>
            <p>
              Learn more about the visa regime. Find information, instructions
              and documentation needed on Entry &amp; Stay Regulations.
            </p>
            <button className="btn-primary">
              Entry &amp; Stay Regulations
            </button>
          </div>
        </div>
      </section>

      {/* ---------- SUPPORT SECTION ---------- */}
      <section className="support-section">
        <div className="container support-inner">
          <div className="support-left">
            <h3>Support</h3>
          </div>
          <div className="support-right">
            <p>
              If you have additional questions about the visa regime, permits or
              electronic services, please contact us:
            </p>
            <button className="btn-secondary">Contact</button>
          </div>
        </div>
      </section>
    </div>
  );
}

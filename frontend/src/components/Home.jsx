// src/components/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import HomeHeader from "./HomeHeader";
import { useAuth } from "../contexts/AuthContext";


export default function Home() {
  const nav = useNavigate();
  const { user } = useAuth();
  return (
    <>
    <HomeHeader />
    <main className="home-root">
      <section className="home-hero">
        <div className="home-hero-inner">
          <h1 className="home-title">Welcome to the Visa Portal</h1>
          <p className="home-sub">Start your application, upload documents and track progress — quick and secure.</p>

          <div className="home-ctas">
            <button className="btn-primary" onClick={() => nav("/application")}>Start Application</button>
            {!user && <button className="btn-secondary" onClick={() => nav("/register")}>Register</button>}
          </div>
        </div>
      </section>

      <section className="home-cards">
        <div className="card">
          <h3>Application status</h3>
          <p>Review and continue your saved application.</p>
          <button className="btn-secondary" onClick={() => nav("/application")}>Open</button>
        </div>

        <div className="card">
          <h3>Help & Guides</h3>
          <p>Read our instructions and document checklist to speed up your submission.</p>
          <button className="btn-secondary" onClick={() => nav("/help")}>Open</button>
        </div>

        <div className="card">
          <h3>Payments</h3>
          <p>Pay the application fees securely once you reach the final step.</p>
          <button className="btn-secondary" onClick={() => nav("/application")}>Open</button>
        </div>
      </section>
    </main>
    </>
  );
}

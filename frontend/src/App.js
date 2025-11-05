import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Register from "./components/Register";
import ThankYou from "./components/ThankYou";
import Home from "./components/Home";
import { ToastContainer } from "react-toastify";
import ApplicationForm from "./components/ApplicationForm"; // ✅ add this import


export default function App() {
  return (
    <>
      <div className="app-shell">
        <header className="app-header">
          <div className="container">
            <Link to="/" className="logo">Portal</Link>
            <nav className="nav">
              <Link to="/register">Register</Link>
              <Link to="/">Home</Link>
            </nav>
          </div>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="*" element={<Home />} />
             <Route path="/application" element={<ApplicationForm />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <div className="container">© {new Date().getFullYear()} Portal</div>
        </footer>
      </div>

      <ToastContainer position="top-right" autoClose={3500} />
    </>
  );
}

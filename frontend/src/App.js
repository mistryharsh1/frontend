// src/App.js
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import HomeNew from "./components/HomeNew";
import ApplicationForm from "./components/ApplicationForm";
import Login from "./components/Login";
import Register from "./components/Register";
import ThankYou from "./components/ThankYou";
import ForgotPassword from "./components/ForgotPassword";
import OtpVerify from "./components/OtpVerify";
import ResetPassword from "./components/ResetPassword";
import { AuthProvider } from "./contexts/AuthContext";
import UserMaster from "./components/UserMaster";
import ApplicationList from "./components/ApplicationList";
import "./App.css";

function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/" || location.pathname === "/home";

  return (
    <AuthProvider>
      {/* Header visible on all pages except home */}
      {!isHome && <Header />}

      <main className="main-content">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomeNew />} />
          <Route path="/home" element={<HomeNew />} />
          <Route path="/application" element={<ApplicationForm />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/thankyou" element={<ThankYou />} />

          {/* Password / OTP routes */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/otp-verify" element={<OtpVerify />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/application" element={<ApplicationForm />} />
          <Route path="/user-master" element={<UserMaster />} />
          <Route path="/applications" element={<ApplicationList />} /> {/* New route */}
          {/* other routes */}
        </Routes>
      </main>

      {/* Footer visible on all pages except home */}
      {<Footer />}
    </AuthProvider>
  );
}

export default Layout;

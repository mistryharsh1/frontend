// src/components/OtpVerify.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { otpVerify as apiOtpVerify, resendOtp as apiResendOtp } from "../services/api";
import "./Login.css";

export default function OtpVerify() {
  const nav = useNavigate();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    // read temporary auth token stored after forgot-password
    const t = sessionStorage.getItem("otp_auth_token");
    if (!t) {
      toast.info("Missing OTP session. Please request password reset again.");
      nav("/forgot-password");
      return;
    }
    setAuthToken(t);
  }, [nav]);

  function handleChange(e) {
    const v = e.target.value.replace(/[^0-9]/g, "");
    setOtp(v.slice(0, 4));
    setError("");
  }

  async function handleSubmit(e) {
    e && e.preventDefault && e.preventDefault();
    setError("");
    if (!otp || otp.length !== 4) { setError("Enter the 4-digit OTP"); return; }
    if (!authToken) { setError("Session expired. Request OTP again."); return; }

    setLoading(true);
    try {
      const res = await apiOtpVerify(otp, authToken);
      setLoading(false);
      if (!res || !res.ok) {
        const msg = (res && res.data && (res.data.message || JSON.stringify(res.data))) || "Invalid OTP";
        setError(msg);
        toast.error(msg);
        return;
      }

  toast.success("OTP verified. You may now reset your password.");
  // navigate to reset password screen
  nav("/reset-password");
    } catch (err) {
      setLoading(false);
      const msg = err && err.message ? err.message : "Network error";
      setError(msg);
      toast.error(msg);
    }
  }

  async function handleResend() {
    if (!authToken) { toast.error("Session expired. Please request reset again."); nav("/forgot-password"); return; }
    setResendLoading(true);
    try {
      const res = await apiResendOtp(authToken);
      setResendLoading(false);
      if (!res || !res.ok) {
        const msg = (res && res.data && (res.data.message || JSON.stringify(res.data))) || "Failed to resend OTP";
        toast.error(msg);
        return;
      }
      toast.success(res.data && res.data.message ? res.data.message : "OTP resent");
    } catch (err) {
      setResendLoading(false);
      toast.error(err && err.message ? err.message : "Network error");
    }
  }

  return (
    <main className="login-root">
      <form className="login-box" onSubmit={handleSubmit}>
        <h1 className="login-title">Enter OTP</h1>
        <p style={{ color: "#556b80", marginTop: -8 }}>Enter the 4-digit code sent to your registered email.</p>

        <div className="form-field">
          <label className="label">One-time password (OTP)</label>
          <input className="form-control" value={otp} onChange={handleChange} inputMode="numeric" autoFocus />
        </div>

        {error && <div className="field-error">{error}</div>}

        <div style={{ display:"flex", gap:12, marginTop:16 }}>
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? "Verifying..." : "Verify OTP"}</button>
          <button type="button" className="btn-secondary" onClick={() => nav("/forgot-password")}>Back</button>
        </div>

        <div style={{ marginTop: 12 }}>
          <button type="button" className="btn-link" onClick={handleResend} disabled={resendLoading}>{resendLoading ? "Resending..." : "Resend OTP"}</button>
        </div>
      </form>
    </main>
  );
}

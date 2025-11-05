// src/components/ForgotPassword.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { forgotPassword as apiForgot } from "../services/api";
import "./Login.css";

export default function ForgotPassword() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e && e.preventDefault && e.preventDefault();
    setError("");
    if (!username) { setError("Please enter your email or username"); return; }

    setLoading(true);
    try {
      const res = await apiForgot({ username });
      setLoading(false);
      if (!res || !res.ok) {
        const msg = (res && res.data && (res.data.message || JSON.stringify(res.data))) || "Failed to send reset";
        setError(msg);
        toast.error(msg);
        return;
      }

      // backend returns auth_token for OTP flow — store in session and navigate to OTP entry
      // Accept both shapes: res.data.auth_token or res.data.data.auth_token (depending on API wrapper)
      try {
        // useful for debugging if something goes wrong during dev
        // console.debug("forgot_password response:", res);
        const token = res && res.data && (res.data.auth_token || (res.data.data && res.data.data.auth_token));
        if (token) {
          try { sessionStorage.setItem("otp_auth_token", token); } catch (err) { /* ignore */ }
        }
      } catch (e) {
        // ignore
      }

      toast.success((res && res.data && (res.data.message || (res.data.data && res.data.data.message))) || "Reset initiated");
      // navigate to OTP verify screen
      nav("/otp-verify");
    } catch (err) {
      setLoading(false);
      const msg = err && err.message ? err.message : "Network error";
      setError(msg);
      toast.error(msg);
    }
  }

  return (
    <main className="login-root">
      <form className="login-box" onSubmit={handleSubmit}>
        <h1 className="login-title">Forgot password</h1>
        <div className="form-field">
          <label className="label">E-mail address or username</label>
          <input className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>

        {error && <div className="field-error">{error}</div>}

        <div style={{ display:"flex", gap:12, marginTop:16 }}>
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? "Sending..." : "Send reset link"}</button>
          <button type="button" className="btn-secondary" onClick={() => nav("/login")}>Back to sign in</button>
        </div>
      </form>
    </main>
  );
}

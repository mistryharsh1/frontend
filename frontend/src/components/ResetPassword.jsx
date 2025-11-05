// src/components/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { resetPassword as apiReset } from "../services/api";
import "./Login.css";

function validatePassword(pwd = "") {
  if (!pwd) return "Password is required";
  if (pwd.length < 8 || pwd.length > 20) return "Password must be 8–20 characters";
  if (!/[A-Z]/.test(pwd) || !/[a-z]/.test(pwd)) return "Include upper and lower case letters";
  if (!/\d/.test(pwd)) return "Include at least one number";
  if (!/[\W_]/.test(pwd)) return "Include at least one special character";
  return "";
}

export default function ResetPassword() {
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    const t = sessionStorage.getItem("otp_auth_token");
    if (!t) {
      toast.info("Session expired. Request password reset again.");
      nav("/forgot-password");
      return;
    }
    setAuthToken(t);
  }, [nav]);

  async function handleSubmit(e) {
    e && e.preventDefault && e.preventDefault();
    setError("");
    const pwdErr = validatePassword(password);
    if (pwdErr) { setError(pwdErr); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (!authToken) { setError("Session expired. Request OTP again."); nav("/forgot-password"); return; }

    setLoading(true);
    try {
      const res = await apiReset(password, authToken);
      setLoading(false);
      if (!res || !res.ok) {
        const msg = (res && res.data && (res.data.message || JSON.stringify(res.data))) || "Failed to reset password";
        setError(msg);
        toast.error(msg);
        return;
      }

      // success: clear otp token and navigate to login
      try { sessionStorage.removeItem("otp_auth_token"); } catch (e) { /* ignore */ }
      toast.success(res.data && res.data.message ? res.data.message : "Password reset successfully");
      nav("/login");
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
        <h1 className="login-title">Reset password</h1>
        <div className="form-field">
          <label className="label">New password</label>
          <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="form-field">
          <label className="label">Confirm password</label>
          <input type="password" className="form-control" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>

        {error && <div className="field-error">{error}</div>}

        <div style={{ display:"flex", gap:12, marginTop:16 }}>
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? "Resetting..." : "Reset password"}</button>
          <button type="button" className="btn-secondary" onClick={() => nav("/login")}>Back to sign in</button>
        </div>
      </form>
    </main>
  );
}

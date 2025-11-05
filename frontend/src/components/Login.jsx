// src/components/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { login as apiLogin } from "../services/api";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login: setAuth } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiLogin({ username: email, password: pass });
      const token = res?.data?.data?.auth_token;
      if (token) {
        localStorage.setItem("authToken", token);
        const isAdmin = res?.data?.data?.userDetails?.is_admin ?? 0;
        localStorage.setItem("is_admin", isAdmin);
        setAuth(res.data);
        toast.success("Signed in successfully");
        nav("/", { replace: true });
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Login failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-root">
      <form className="login-box" onSubmit={handleSubmit}>
        <div className="login-icon-wrap">
          <svg
            className="login-icon"
            width="52"
            height="52"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="12" cy="8" r="3.6" stroke="#20364f" strokeWidth="1.6" />
            <path
              d="M4 20c0-3.6 3.6-6 8-6s8 2.4 8 6"
              stroke="#20364f"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <p className="login-info">
          Login with a username and password is a basic security login.{" "}
          <a className="link-inline" href="#learn" onClick={(e) => e.preventDefault()}>
            Find out more.
          </a>
        </p>

        <div className="form-field">
          <label className="label">Username:</label>
          <div className="label-sub">(Email address used for registration)</div>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label className="label">Password:</label>
          <div className="password-input-wrap">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control password-control"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
            />
            <button
              type="button"
              className="show-toggle"
              onClick={() => setShowPassword((s) => !s)}
            >
              {showPassword ? "HIDE" : "SHOW"}
            </button>
          </div>
        </div>

        {error && <div className="field-error">{error}</div>}

        <button type="submit" className="btn-signin" disabled={loading}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <rect x="3" y="6" width="18" height="12" rx="2" fill="#fff" />
            <path
              d="M12 9v6M9 12h6"
              stroke="#0a5428"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{loading ? "Signing in..." : "Sign in"}</span>
        </button>

        <div className="form-links">
          <button
            type="button"
            className="btn-link"
            onClick={() => nav("/forgot-password")}
          >
            Password forgotten
          </button>
        </div>

        <div className="register-hint">
          Don’t have an account at eid.gov.rs?{" "}
          <button
            type="button"
            className="link-inline btn-register"
            onClick={() => nav("/register")}
          >
            Register here.
          </button>
        </div>
      </form>
    </main>
  );
}

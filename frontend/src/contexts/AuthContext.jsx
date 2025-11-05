// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { logout as apiLogout } from "../services/api";

const KEY = "auth_user";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  function login(userObj) {
    try {
      localStorage.setItem(KEY, JSON.stringify(userObj));
    } catch (e) {
      // ignore
    }
    setUser(userObj);
  }

  async function logout() {
    // try to call backend logout if we have a token
    try {
      const token = getTokenFromUser(user);
      if (token) {
        try { await apiLogout(token); } catch (e) { /* ignore network errors */ }
      }
    } catch (e) {
      // ignore
    }

    try {
      localStorage.removeItem(KEY);
    } catch (e) { /* ignore */ }
    setUser(null);
  }

  function getTokenFromUser(u) {
    if (!u || typeof u !== "object") return null;
    return u.auth_token || u.authToken || u.accessToken || u.token || null;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default AuthContext;

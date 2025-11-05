// src/services/api.js
// Centralized API client for frontend
// Uses fetch (no external deps). Base URL configurable via REACT_APP_API_BASE_URL
import { detail } from "../common";
const ip = detail.ip;
const DEFAULT_BASE = ip;
let API_BASE = process.env.REACT_APP_API_BASE_URL || DEFAULT_BASE;
// ensure protocol present and remove trailing slash
if (!/^https?:\/\//i.test(API_BASE)) {
  API_BASE = "http://" + API_BASE;
}
API_BASE = API_BASE.replace(/\/$/, "");

function normalizeResponse(status, body) {
  return body
    .text()
    .then((txt) => {
      if (!txt) return { status, data: null, ok: status >= 200 && status < 300 };
      try {
        const json = JSON.parse(txt);
        return { status, data: json, ok: status >= 200 && status < 300 };
      } catch (e) {
        return { status, data: txt, ok: status >= 200 && status < 300 };
      }
    })
    .catch(() => ({ status, data: null, ok: status >= 200 && status < 300 }));
}

async function doFetch(url, opts = {}) {
  const finalOpts = {
    mode: "cors", // allow cross-origin requests if server supports CORS
    credentials: "omit",
    ...opts,
  };
  console.debug("[api] fetch", url, finalOpts);
  try {
    const res = await fetch(url, finalOpts);
    console.debug("[api] response status", res.status, res.statusText);
    const normalized = await normalizeResponse(res.status, res);
    return normalized;
  } catch (err) {
    // network errors (DNS, refused connection, CORS preflight fail) show up here
    console.error("[api] network error", err);
    throw new Error(err.message || "Network error - Failed to fetch");
  }
}

export async function register(payload = {}, files = []) {
  const url = `${API_BASE}/v1/api/admin/register`;
  const fd = new FormData();

  if (Array.isArray(files) && files.length) {
    files.forEach((f) => {
      fd.append("document", f, f.name);
    });
  }

  Object.keys(payload || {}).forEach((k) => {
    const val = payload[k];
    if (typeof val === "boolean") fd.append(k, val ? "true" : "false");
    else if (val === null || val === undefined) fd.append(k, "");
    else fd.append(k, String(val));
  });

  try {
    const normalized = await doFetch(url, { method: "POST", body: fd });
    return { ok: normalized.ok, status: normalized.status, data: normalized.data };
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function login(credentials = {}) {
  const url = `${API_BASE}/v1/api/admin/login`;
  try {
    const normalized = await doFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return { ok: normalized.ok, status: normalized.status, data: normalized.data };
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function forgotPassword(payload = {}) {
  const url = `${API_BASE}/v1/api/admin/forgot_password`;
  try {
    const normalized = await doFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { ok: normalized.ok, status: normalized.status, data: normalized.data };
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function otpVerify(otp, authToken) {
  const url = `${API_BASE}/v1/api/admin/otp_verify`;
  try {
    const normalized = await doFetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: authToken } : {}),
      },
      body: JSON.stringify({ otp: Number(otp) }),
    });
    return { ok: normalized.ok, status: normalized.status, data: normalized.data };
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function resendOtp(authToken) {
  const url = `${API_BASE}/v1/api/admin/resend_otp`;
  try {
    const normalized = await doFetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: authToken } : {}),
      },
      body: "{}", // avoid sending empty string
    });
    return { ok: normalized.ok, status: normalized.status, data: normalized.data };
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function resetPassword(newPassword, authToken) {
  const url = `${API_BASE}/v1/api/admin/reset_password`;
  try {
    const normalized = await doFetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: authToken } : {}),
      },
      body: JSON.stringify({ password: String(newPassword) }),
    });
    return { ok: normalized.ok, status: normalized.status, data: normalized.data };
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function logout(authToken) {
  const url = `${API_BASE}/v1/api/admin/logout`;
  try {
    const normalized = await doFetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: authToken } : {}),
      },
      body: JSON.stringify({}),
    });
    return { ok: normalized.ok, status: normalized.status, data: normalized.data };
  } catch (err) {
    return Promise.reject(err);
  }
}

export default {
  register,
  login,
  forgotPassword,
  otpVerify,
  resendOtp,
  resetPassword,
  logout,
};

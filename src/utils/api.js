// ===== Robust API base detection (CRA) =====

// 1) Build-time env (Netlify UI -> REACT_APP_API_URL)
const ENV_API = (process.env.REACT_APP_API_URL || "").trim();

// 2) Runtime overrides (no rebuild needed)
//    - window.__API_BASE__
//    - <meta name="x-api-base" content="https://your-api">
//    - localStorage.API_BASE
function runtimeApiBase() {
  if (typeof window === "undefined") return "";
  if (window.__API_BASE__) return String(window.__API_BASE__).trim();

  const meta = document.querySelector('meta[name="x-api-base"]');
  if (meta?.content) return meta.content.trim();

  const fromLS = localStorage.getItem("API_BASE");
  if (fromLS) return fromLS.trim();

  return "";
}

// 3) Smart default:
//    If we're NOT on localhost (i.e., production), use your Render API.
//    Otherwise, use local dev server.
const RENDER_FALLBACK = "https://warehouse-api-2148.onrender.com";
function smartDefault() {
  if (typeof window !== "undefined") {
    const host = window.location.hostname || "";
    if (host !== "localhost" && host !== "127.0.0.1") {
      return RENDER_FALLBACK; // production-safe default
    }
  }
  return "http://localhost:5000";
}

const RAW_BASE = ENV_API || runtimeApiBase() || smartDefault();

// Trim trailing slashes for consistency
export const API_BASE = RAW_BASE.replace(/\/+$/, "");

// ---------- Shared helpers below (unchanged API) ----------

export function getAuthHeaders() {
  const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return { headers };
}

async function jsonFetch(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error || data?.message || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// ---------- SEARCH ----------
export async function searchWarehouses(params = {}) {
  const url = new URL(`${API_BASE}/warehouses/search`);
  Object.entries(params).forEach(([key, value]) => {
    if (value == null) return;
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v != null && String(v).trim() !== "") {
          url.searchParams.append(key, String(v));
        }
      });
    } else {
      const s = String(value).trim();
      if (s !== "") url.searchParams.set(key, s);
    }
  });
  return jsonFetch(url.toString());
}

// ---------- AUTH ----------
const AUTH_BASE = `${API_BASE}/api/auth`;

const TOKEN_KEY = "token";
const USER_KEY = "auth_user";

export function saveAuth({ token, user }) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("auth_token");
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function registerUser({ name, email, password, roles }) {
  const data = await jsonFetch(`${AUTH_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, roles }),
  });
  saveAuth({ token: data.token, user: data.user });
  return data;
}

export async function loginUser({ email, password }) {
  const data = await jsonFetch(`${AUTH_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  saveAuth({ token: data.token, user: data.user });
  return data;
}

export async function getMe() {
  const { headers } = getAuthHeaders();
  return jsonFetch(`${AUTH_BASE}/me`, { headers });
}

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/* =======================
   LISTINGS HELPERS
   ======================= */

function toHttpError(res, data) {
  const msg =
    (data && typeof data.error === "string" && data.error) ||
    (data && data.error && typeof data.error.message === "string" && data.error.message) ||
    (typeof data?.message === "string" && data.message) ||
    `HTTP ${res.status}`;
  const err = new Error(msg);
  err.status = res.status;
  err.data = data;
  err.details = data?.error;
  return err;
}

export async function createListingDraft(initialPayload) {
  const res = await fetch(`${API_BASE}/listings`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(initialPayload),
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!res.ok) throw toHttpError(res, data);
  return data;
}

export async function updateListing(id, patch) {
  const res = await fetch(`${API_BASE}/listings/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(patch),
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!res.ok) throw toHttpError(res, data);
  return data;
}

export async function getListing(id) {
  const res = await fetch(`${API_BASE}/listings/${id}`, {
    headers: authHeaders(),
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!res.ok) throw toHttpError(res, data);
  return data;
}

export async function listMyListings() {
  const res = await fetch(`${API_BASE}/listings`, {
    headers: authHeaders(),
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!res.ok) throw toHttpError(res, data);
  return data.listings || data || [];
}

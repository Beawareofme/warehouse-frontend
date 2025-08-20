// ===== EXISTING =====
// export const API_BASE = "http://localhost:5000"; // Or your backend URL

// ===== PATCHED: read from env (Vite or CRA) with localhost fallback, trim trailing slash =====
const API_FROM_ENV =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) || 
  (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_URL);          

export const API_BASE = (API_FROM_ENV || "http://localhost:5000").replace(/\/+$/, "");

// (rest of your file stays the same)
export function getAuthHeaders() {
  // Be backward-compatible: read either "token" (your current key) or "auth_token" (in case we set it elsewhere)
  const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return { headers };
}

// ---------- PATCHED: robust search for new backend endpoint ----------
// Works with params like:
// { q, city, state, minSqFt, maxSqFt, minPrice, maxPrice, amenities: ['24x7', 'CCTV'], sort, page, pageSize }
export async function searchWarehouses(params = {}) {
  const url = new URL(`${API_BASE}/warehouses/search`);

  // Append query params; support arrays (e.g., amenities[])
  Object.entries(params).forEach(([key, value]) => {
    if (value == null) return;

    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v != null && String(v).trim() !== "") {
          const k = key.endsWith("[]") ? key : key;
          url.searchParams.append(k, String(v));
        }
      });
    } else {
      const s = String(value).trim();
      if (s !== "") url.searchParams.set(key, s);
    }
  });

  return jsonFetch(url.toString());
}

// ===== NEW (ADD) =====

const AUTH_BASE = `${API_BASE}/api/auth`;

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

// ---------- AUTH HELPERS (frontend) ----------

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
   PATCHED LISTINGS HELPERS
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
  return data.listings || [];
}

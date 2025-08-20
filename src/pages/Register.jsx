// src/pages/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import {
  FaWarehouse,
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
} from "react-icons/fa";

const ROLE_MERCHANT = "MERCHANT";
const ROLE_OWNER = "WAREHOUSE_OWNER";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    merchant: false,
    owner: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setError("");
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    const roles = [];
    if (form.merchant) roles.push(ROLE_MERCHANT);
    if (form.owner) roles.push(ROLE_OWNER);

    if (!roles.length) return setError("Please select at least one role.");
    if (!form.name || !form.email || !form.password)
      return setError("Name, email, and password are required.");

    setSubmitting(true);
    try {
      const data = await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        roles,
      });

      // hydrate context + localStorage via helper
      login({ user: data.user, token: data.token });

      // ✅ Your flow: land on Home after registration
      navigate("/", { replace: true });
    } catch (err) {
      const msg =
        err?.data?.error ||
        err?.response?.data?.error ||
        err?.message ||
        "Registration failed. Try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit =
    form.name.trim() &&
    form.email.trim() &&
    form.password &&
    (form.merchant || form.owner) &&
    !submitting;

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 relative
                bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/owner-register-bg.jpg')",
        backgroundSize: "cover",      // ensures it covers whole screen
        backgroundPosition: "center", // keeps image centered
        backgroundRepeat: "no-repeat",
  }}
>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />

      {/* Card */}
      <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-5xl text-white overflow-hidden">
        {/* Animated light sweep */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shine pointer-events-none" />

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: form */}
          <div>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-yellow-500 text-black rounded-full flex items-center justify-center text-3xl shadow-md">
                <FaWarehouse />
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-2 text-center text-yellow-400 drop-shadow">
              Create your account
            </h1>
            <p className="text-center text-sm text-gray-300 mb-6 italic">
              Choose your role(s) to unlock the right features.
            </p>

            {error && (
              <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              {/* Name */}
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  type="text"
                  className="w-full pl-10 pr-4 py-2 bg-white/20 text-white placeholder-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-300"
                  placeholder="Full name"
                  autoComplete="name"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  type="email"
                  className="w-full pl-10 pr-4 py-2 bg-white/20 text-white placeholder-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-300"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-10 pr-10 py-2 bg-white/20 text-white placeholder-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-300"
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                />
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-300"
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              {/* Roles */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Select role(s)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Merchant chip */}
                  <label
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer transition
                      ${
                        form.merchant
                          ? "bg-yellow-500/20 border-yellow-500/50"
                          : "bg-white/10 border-white/20 hover:bg-white/20"
                      }`}
                  >
                    <input
                      type="checkbox"
                      name="merchant"
                      checked={form.merchant}
                      onChange={onChange}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm">Merchant</span>
                    {form.merchant && (
                      <FaCheckCircle className="ml-auto text-yellow-400" />
                    )}
                  </label>

                  {/* Owner chip */}
                  <label
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer transition
                      ${
                        form.owner
                          ? "bg-yellow-500/20 border-yellow-500/50"
                          : "bg-white/10 border-white/20 hover:bg-white/20"
                      }`}
                  >
                    <input
                      type="checkbox"
                      name="owner"
                      checked={form.owner}
                      onChange={onChange}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm">Warehouse Owner</span>
                    {form.owner && (
                      <FaCheckCircle className="ml-auto text-yellow-400" />
                    )}
                  </label>
                </div>
                <p className="mt-2 text-xs text-gray-300/80">
                  You can select both if you plan to use both roles.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {submitting ? "Creating account..." : "Sign up"}
              </button>

              {/* Login link */}
              <p className="text-center text-sm text-gray-300">
                Already have an account?{" "}
                <Link to="/login" className="underline text-yellow-400">
                  Log in
                </Link>
              </p>
            </form>
          </div>

          {/* Right: benefits/CTA */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-6 flex flex-col justify-center">
            <h2 className="text-2xl font-semibold mb-2">Why join WarehouseX?</h2>
            <ul className="space-y-3 text-sm text-gray-200">
              <li className="flex items-start gap-2">
                <FaCheckCircle className="mt-0.5" />
                <span>Role-based dashboards & permissions</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="mt-0.5" />
                <span>Search warehouses by location and capacity</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="mt-0.5" />
                <span>List your space and manage bookings</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="mt-0.5" />
                <span>Secure token authentication</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes shine {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
            100% { transform: translateX(100%); }
          }
          .animate-shine {
            animation: shine 2.5s infinite linear;
          }
        `}
      </style>
    </div>
  );
}

// src/App.js
import "./App.css";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ToastProvider } from "./context/ToastContext.jsx";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Loader from "./components/Loader";
import MerchantDashboard from "./pages/MerchantDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import AddWarehouse from "./pages/AddWarehouse"; // ✅ single import
import AdminDashboard from "./pages/AdminDashboard";
import BookingDetails from "./pages/BookingDetails";
import SearchResults from "./pages/SearchResults";
import Login from "./pages/Login";

// ✅ named exports only
import { ProtectedRoute, RoleRoute } from "./components/ProtectedRoute";

function AppRoutes() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 700); // simulate loading
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      {loading && <Loader />}

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} /> {/* unified login */}
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={<SearchResults />} />

        {/* Redirect old per-role login pages to unified /login */}
        <Route path="/login/merchant" element={<Navigate to="/login" replace />} />
        <Route path="/login/owner" element={<Navigate to="/login" replace />} />
        <Route path="/login/admin" element={<Navigate to="/login" replace />} />

        {/* Protected block: requires valid auth token */}
        <Route element={<ProtectedRoute />}>
          {/* Merchant-only routes */}
          <Route element={<RoleRoute allowed={["MERCHANT"]} />}>
            <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
            <Route path="/merchant/bookings/:id" element={<BookingDetails />} />
          </Route>

          {/* Warehouse Owner-only routes */}
          <Route element={<RoleRoute allowed={["WAREHOUSE_OWNER"]} />}>
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
            <Route path="/dashboard/owner/add" element={<AddWarehouse />} />
            {/* ✅ draft editor route */}
            <Route path="/dashboard/owner/listings/:id/edit" element={<AddWarehouse />} />
          </Route>

          {/* Admin-only routes */}
          <Route element={<RoleRoute allowed={["ADMIN"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Route>

        {/* Backward-compatible shortcuts/redirects */}
        <Route path="/dashboard/merchant" element={<Navigate to="/merchant/dashboard" replace />} />
        <Route path="/dashboard/owner" element={<Navigate to="/owner/dashboard" replace />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/owner" element={<Navigate to="/owner/dashboard" replace />} />
        <Route path="/merchant" element={<Navigate to="/merchant/dashboard" replace />} />

        {/* Fallbacks */}
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  // NOTE: BrowserRouter is already in index.js
  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  );
}

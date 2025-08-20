// src/components/NavBar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userHasRole } from "../utils/roleRoutes";
import { getStoredUser as getStoredUserFromApi, clearAuth } from "../utils/api"; // ⬅️ NEW

export default function Navbar() {
  const navigate = useNavigate();
  let { user, logout } = useAuth() || {};
  let isAuthed = !!user;

  // Fallback if context not yet hydrated (page refresh)
  if (!user) {
    user = getStoredUserFromApi();     // ⬅️ shared util reads "auth_user"
    isAuthed = !!user;
    logout = () => {                   // ⬅️ shared util clears both keys
      clearAuth();
      navigate("/");
    };
  }

  const isOwner = userHasRole(user, "WAREHOUSE_OWNER");
  const isMerchant = userHasRole(user, "MERCHANT");
  const isAdmin = userHasRole(user, "ADMIN");

  return (
    <header className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-md border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src="/logo192.png" alt="Logo" className="h-8 w-8 rounded" />
          <span className="text-white font-bold tracking-wide">WarehouseX</span>
        </div>

        {/* Actions */}
        <nav className="flex items-center gap-4">
          {/* List Your Space: only guests or owners */}
          {(!isAuthed || isOwner) && (
            <Link
              to="/dashboard/owner/add"
              className="rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-2 font-semibold shadow"
            >
              List Your Space
            </Link>
          )}

          {isAuthed ? (
            <>
              {isOwner && (
                <Link
                  to="/owner/dashboard"
                  className="text-white/90 hover:text-yellow-400 px-2 py-2"
                >
                  Owner Dashboard
                </Link>
              )}
              {isMerchant && (
                <Link
                  to="/merchant/dashboard"
                  className="text-white/90 hover:text-yellow-400 px-2 py-2"
                >
                  Merchant Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className="text-white/90 hover:text-yellow-400 px-2 py-2"
                >
                  Admin Dashboard
                </Link>
              )}

              {/* Welcome */}
              <span className="text-white/80 font-medium px-2">
                Welcome, {user?.name || "User"}
              </span>

              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="text-white/90 hover:text-yellow-400 px-2 py-2"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="text-white/90 hover:text-yellow-400 px-2 py-2"
              >
                Sign Up
              </Link>
              <Link
                to="/login"
                className="text-white/90 hover:text-yellow-400 px-2 py-2"
              >
                Login
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

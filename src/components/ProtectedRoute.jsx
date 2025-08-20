// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { userHasRole } from '../utils/roleRoutes';
import { getStoredUser } from '../utils/api';   // ⬅️ NEW

function hasToken() {
  return Boolean(localStorage.getItem('token')); // same key used by AuthContext/utils
}

export function ProtectedRoute() {
  if (!hasToken()) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function RoleRoute({ allowed = [] }) {
  if (!hasToken()) return <Navigate to="/login" replace />;
  const user = getStoredUser();                 // ⬅️ use the shared reader
  const ok = allowed.some((r) => userHasRole(user, r));
  return ok ? <Outlet /> : <Navigate to="/" replace />;
}

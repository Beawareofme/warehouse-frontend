// src/utils/roleRoutes.js

// Normalize any role string to our enum form
// 'owner' | 'warehouse_owner' | 'warehouse-owner' -> 'WAREHOUSE_OWNER'
// 'merchant' | 'mer' -> 'MERCHANT'
// 'admin' -> 'ADMIN'
export function normalizeRole(role) {
  if (!role || typeof role !== 'string') return null;
  const low = role.toLowerCase();
  if (low === 'admin') return 'ADMIN';
  if (low === 'merchant' || low === 'mer') return 'MERCHANT';
  if (low === 'owner' || low === 'warehouse_owner' || low === 'warehouse-owner')
    return 'WAREHOUSE_OWNER';
  return role.toUpperCase(); // already looks like enum, keep it
}

// ✅ Map roles → your actual dashboard paths from App.js
export const ROLE_HOME = {
  ADMIN: '/admin/dashboard',
  MERCHANT: '/merchant/dashboard',
  WAREHOUSE_OWNER: '/owner/dashboard',
};

// Build a normalized, deduped roles array from a user object
export function userRolesNormalized(user) {
  if (!user) return [];
  const raw = [];
  if (user.role) raw.push(user.role);
  if (Array.isArray(user.roles)) raw.push(...user.roles);
  return Array.from(new Set(raw.map(normalizeRole).filter(Boolean)));
}

// True if user has the given role (accepts legacy or enum strings)
export function userHasRole(user, role) {
  const want = normalizeRole(role);
  if (!want) return false;
  return userRolesNormalized(user).includes(want);
}

// Pick a primary role (first normalized one available)
export function pickPrimaryRole(user) {
  const roles = userRolesNormalized(user);
  return roles.length ? roles[0] : null;
}

// Convenience: resolve a user's home path
export function getRoleHome(user) {
  const role = pickPrimaryRole(user);
  return ROLE_HOME[role] || '/';
}

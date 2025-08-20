// warehouse-frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMe, getStoredUser, saveAuth, clearAuth } from "../utils/api";
import { userHasRole } from "../utils/roleRoutes";   // ⬅️ NEW

// Keys must match utils/api.js
const TOKEN_KEY = "token";
const USER_KEY = "auth_user";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(false);

  // On mount or when token changes, refresh the user
  useEffect(() => {
    let ignore = false;
    async function bootstrap() {
      if (!token) return;
      try {
        setIsLoading(true);
        const data = await getMe();
        if (!ignore) {
          setUser(data);
          localStorage.setItem(USER_KEY, JSON.stringify(data));
        }
      } catch {
        if (!ignore) {
          setUser(null);
          setToken(null);
          clearAuth();
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    bootstrap();
    return () => {
      ignore = true;
    };
  }, [token]);

  const login = ({ user, token }) => {
    setUser(user);
    setToken(token);
    saveAuth({ token, user }); // writes to "token" & "auth_user"
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    clearAuth(); // removes "token" & "auth_user"
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      login,
      logout,
      // ⬇️ use shared normalizer
      hasRole: (r) => userHasRole(user, r),
    }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

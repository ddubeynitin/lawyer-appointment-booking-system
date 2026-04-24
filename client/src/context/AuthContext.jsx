import React, { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

const readStoredAuth = () => {
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  return { token, user };
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => readStoredAuth());

  const login = (nextAuth) => {
    const token = nextAuth?.token || null;
    const user = nextAuth?.user || null;
    setAuth({ token, user });
    if (token) localStorage.setItem("token", token);
    if (user) localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = () => {
    setAuth({ token: null, user: null });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
  };

  const updateUser = (nextUser) => {
    setAuth((current) => {
      const updatedUser = typeof nextUser === "function"
        ? nextUser(current.user)
        : nextUser;

      if (updatedUser) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      return {
        ...current,
        user: updatedUser,
      };
    });
  };

  const value = useMemo(
    () => ({ token: auth.token, user: auth.user, login, logout, updateUser }),
    [auth.token, auth.user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};


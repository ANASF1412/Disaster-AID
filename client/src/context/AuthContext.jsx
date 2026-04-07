import React, { createContext, useContext, useState, useCallback } from "react";
import { authAPI } from "../services/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const { data } = await authAPI.login(credentials);
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      setUser(data.data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const { data } = await authAPI.register(credentials);
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      setUser(data.data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Registration failed" };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const isAdmin = user?.role === "admin";
  const isCoordinator = user?.role === "coordinator" || isAdmin;

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isCoordinator }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

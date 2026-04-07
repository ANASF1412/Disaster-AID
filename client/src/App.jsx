import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Centers = lazy(() => import("./pages/Centers.jsx"));
const Inventory = lazy(() => import("./pages/Inventory.jsx"));
const Volunteers = lazy(() => import("./pages/Volunteers.jsx"));
const Dispatch = lazy(() => import("./pages/Dispatch.jsx"));
const Analytics = lazy(() => import("./pages/Analytics.jsx"));
const MapView = lazy(() => import("./pages/MapView.jsx"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
    <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/centers" element={<ProtectedRoute><Centers /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
      <Route path="/volunteers" element={<ProtectedRoute><Volunteers /></ProtectedRoute>} />
      <Route path="/dispatch" element={<ProtectedRoute><Dispatch /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/map" element={<ProtectedRoute><MapView /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </Suspense>
);

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: { borderRadius: "12px", fontSize: "14px" },
              success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

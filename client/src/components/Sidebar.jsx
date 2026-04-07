import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Building2, Package, Users, Truck,
  BarChart3, LogOut, ChevronLeft, ChevronRight, AlertTriangle, Map,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { cn } from "../utils/helpers.js";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/centers", icon: Building2, label: "Relief Centers" },
  { to: "/inventory", icon: Package, label: "Inventory" },
  { to: "/volunteers", icon: Users, label: "Volunteers" },
  { to: "/dispatch", icon: Truck, label: "Dispatch" },
  { to: "/analytics", icon: BarChart3, label: "Analytics", roles: ["admin", "coordinator"] },
  { to: "/map", icon: Map, label: "Map View" },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, isCoordinator } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role)
  );

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative flex flex-col h-screen bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-700 shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-surface-200 dark:border-surface-700">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
          <AlertTriangle size={16} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="font-bold text-sm text-surface-900 dark:text-white whitespace-nowrap overflow-hidden"
            >
              Relief Tracker
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {visibleItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                  : "text-surface-600 dark:text-slate-400 hover:bg-surface-100 dark:hover:bg-surface-800"
              )
            }
          >
            <Icon size={18} className="shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* User info + Logout */}
      <div className="p-2 border-t border-surface-200 dark:border-surface-700 space-y-1">
        {/* User info — only shown when expanded */}
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-surface-800 dark:text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-surface-400 dark:text-slate-500 capitalize">{user?.role}</p>
            </div>
          </div>
        )}

        {/* Logout — icon always visible, label shown when expanded */}
        <button
          onClick={handleLogout}
          title="Logout"
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span className="whitespace-nowrap">Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  );
};

export default Sidebar;

import React from "react";
import { Sun, Moon, Bell } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { cn } from "../utils/helpers.js";

const roleColors = {
  admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  coordinator: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  volunteer: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const Topbar = ({ title }) => {
  const { dark, toggle } = useTheme();
  const { user } = useAuth();

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700 shrink-0">
      <h1 className="text-lg font-semibold text-surface-900 dark:text-white">{title}</h1>
      <div className="flex items-center gap-3">
        <button onClick={toggle} className="btn-ghost p-2 rounded-xl">
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="btn-ghost p-2 rounded-xl relative">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-surface-200 dark:border-surface-700">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold">
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-surface-900 dark:text-white leading-none">{user?.name}</p>
            <span className={cn("badge text-xs mt-0.5", roleColors[user?.role])}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;

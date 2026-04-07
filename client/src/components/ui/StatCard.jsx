import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/helpers.js";

const StatCard = ({ title, value, icon: Icon, trend, color = "primary", loading }) => {
  const colors = {
    primary: "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
    yellow: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400",
  };

  if (loading) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-24 mb-4" />
        <div className="h-8 bg-surface-200 dark:bg-surface-700 rounded w-16" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6 hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-surface-500 dark:text-slate-400">{title}</p>
          <p className="text-3xl font-bold mt-1 text-surface-900 dark:text-white">{value ?? "—"}</p>
          {trend && (
            <p className={cn("text-xs mt-1 font-medium", trend > 0 ? "text-green-600" : "text-red-500")}>
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% from last period
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn("p-3 rounded-xl", colors[color])}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;

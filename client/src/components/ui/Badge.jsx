import React from "react";
import { cn, getStatusColor, getPriorityColor } from "../../utils/helpers.js";

const Badge = ({ label, type = "status" }) => (
  <span className={cn("badge", type === "priority" ? getPriorityColor(label) : getStatusColor(label))}>
    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
    {label}
  </span>
);

export default Badge;

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../utils/helpers.js";

const Pagination = ({ page, total, limit, onChange }) => {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
      <p className="text-sm text-surface-500 dark:text-slate-400">
        Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="p-2 rounded-lg btn-ghost disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => onChange(i + 1)}
            className={cn(
              "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
              page === i + 1
                ? "bg-primary-600 text-white"
                : "btn-ghost"
            )}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="p-2 rounded-lg btn-ghost disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

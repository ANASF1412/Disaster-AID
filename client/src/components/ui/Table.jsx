import React from "react";

const Table = ({ columns, data, loading, emptyMessage = "No data found" }) => {
  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-surface-100 dark:bg-surface-700 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-200 dark:border-surface-700">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left py-3 px-4 text-xs font-semibold text-surface-500 dark:text-slate-400 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-surface-400 dark:text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row._id || i}
                className="border-b border-surface-100 dark:border-surface-700/50 hover:bg-surface-50 dark:hover:bg-surface-700/30 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="py-3 px-4 text-surface-700 dark:text-slate-300">
                    {col.render ? col.render(row) : row[col.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;

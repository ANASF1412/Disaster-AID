export const cn = (...classes) => classes.filter(Boolean).join(" ");

export const formatNumber = (n) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

export const getPriorityColor = (priority) => ({
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
}[priority] ?? "bg-surface-100 text-surface-600");

export const getStatusColor = (status) => ({
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  full: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  inactive: "bg-surface-100 text-surface-500 dark:bg-surface-700 dark:text-surface-400",
  available: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  busy: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  offline: "bg-surface-100 text-surface-500 dark:bg-surface-700 dark:text-surface-400",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  assigned: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  // inventory stock levels
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  low: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  sufficient: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
}[status] ?? "bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-400");

export const exportToCSV = (data, filename) => {
  if (!data.length) return;
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map((r) => Object.values(r).map((v) => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([`${headers}\n${rows}`], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

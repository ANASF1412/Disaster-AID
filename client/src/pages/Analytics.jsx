import React, { useEffect, useState } from "react";
import { AlertTriangle, MapPin, RefreshCw } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import AppLayout from "../layouts/AppLayout.jsx";
import Badge from "../components/ui/Badge.jsx";
import { analyticsAPI } from "../services/api.js";
import toast from "react-hot-toast";

const Analytics = () => {
  const [critical, setCritical] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [critRes, heatRes] = await Promise.all([
        analyticsAPI.getCriticalZones(),
        analyticsAPI.getHeatmap(),
      ]);
      setCritical(critRes.data.data);
      setHeatmap(heatRes.data.data);
    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const heatmapChartData = heatmap.map((h) => ({
    name: h.name?.length > 14 ? h.name.slice(0, 14) + "…" : h.name,
    dispatches: h.activeDispatches,
    load: h.currentLoad,
    capacity: h.capacity,
  }));

  return (
    <AppLayout title="Analytics">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Critical Centers", value: critical?.summary?.criticalCenterCount, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/10" },
          { label: "Critical Inventory Items", value: critical?.summary?.criticalInventoryCount, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/10" },
          { label: "Active Dispatch Zones", value: heatmap.length, color: "text-primary-600", bg: "bg-primary-50 dark:bg-primary-900/10" },
        ].map((s) => (
          <div key={s.label} className={`card p-5 ${s.bg}`}>
            {loading ? (
              <div className="animate-pulse h-8 bg-surface-200 dark:bg-surface-700 rounded w-16" />
            ) : (
              <>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value ?? 0}</p>
                <p className="text-sm text-surface-500 dark:text-slate-400 mt-1">{s.label}</p>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Heatmap Bar Chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-surface-700 dark:text-slate-300">Active Dispatches by Center</h2>
            <button onClick={() => load(true)} className="btn-ghost p-2 rounded-lg" disabled={refreshing}>
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
          {heatmapChartData.length === 0 ? (
            <p className="text-surface-400 text-sm text-center py-12">No active dispatch data</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={heatmapChartData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }} />
                <Bar dataKey="dispatches" name="Active Dispatches" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="load" name="Current Load" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Critical Inventory List */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-surface-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <AlertTriangle size={15} className="text-red-500" /> Critical Inventory Items
          </h2>
          {loading ? (
            <div className="space-y-2 animate-pulse">
              {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-surface-100 dark:bg-surface-700 rounded-lg" />)}
            </div>
          ) : critical?.criticalInventory?.length === 0 ? (
            <p className="text-surface-400 text-sm text-center py-12">All inventory levels are healthy</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(critical?.criticalInventory ?? []).map((item) => (
                <div key={item._id} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-100 dark:border-surface-700">
                  <div>
                    <p className="text-sm font-medium text-surface-800 dark:text-slate-200">{item.itemName}</p>
                    <p className="text-xs text-surface-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} /> {item.centerId?.name ?? "Unknown center"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">{item.quantity} left</p>
                    <p className="text-xs text-surface-400">min: {item.threshold}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Critical Centers Table */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-surface-700 dark:text-slate-300 mb-4">Overloaded Relief Centers</h2>
        {loading ? (
          <div className="space-y-2 animate-pulse">
            {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-surface-100 dark:bg-surface-700 rounded-xl" />)}
          </div>
        ) : critical?.criticalCenters?.length === 0 ? (
          <p className="text-surface-400 text-sm text-center py-8">All centers are within safe capacity</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  {["Center", "Location", "Load", "Capacity", "Usage", "Status"].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(critical?.criticalCenters ?? []).map((c) => {
                  const pct = Math.min(Math.round((c.currentLoad / c.capacity) * 100), 100);
                  return (
                    <tr key={c._id} className="border-b border-surface-100 dark:border-surface-700/50">
                      <td className="py-3 px-4 font-medium">{c.name}</td>
                      <td className="py-3 px-4 text-surface-500 text-xs">
                        {c.location?.lat?.toFixed(3)}, {c.location?.lng?.toFixed(3)}
                      </td>
                      <td className="py-3 px-4">{c.currentLoad}</td>
                      <td className="py-3 px-4">{c.capacity}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full">
                            <div className="h-1.5 rounded-full bg-red-500" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-red-600 font-medium">{pct}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4"><Badge label={c.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Analytics;

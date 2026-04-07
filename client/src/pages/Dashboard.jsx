import React, { useEffect, useState } from "react";
import { Building2, Package, Users, AlertTriangle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import AppLayout from "../layouts/AppLayout.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import { centersAPI, volunteersAPI, analyticsAPI, dispatchAPI } from "../services/api.js";
import { getStatusColor, getPriorityColor } from "../utils/helpers.js";
import Badge from "../components/ui/Badge.jsx";
import toast from "react-hot-toast";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444"];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [critical, setCritical] = useState(null);
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [centersRes, volunteersRes, criticalRes, dispatchRes] = await Promise.all([
          centersAPI.getAll({ limit: 100 }),
          volunteersAPI.getAll({ limit: 100 }),
          analyticsAPI.getCriticalZones(),
          dispatchAPI.getAll({ limit: 100 }),
        ]);

        const centers = centersRes.data.data.centers;
        const volunteers = volunteersRes.data.data.volunteers;

        setStats({
          totalCenters: centersRes.data.data.total,
          activeCenters: centers.filter((c) => c.status === "active").length,
          availableVolunteers: volunteers.filter((v) => v.availability === "available").length,
          totalVolunteers: volunteersRes.data.data.total,
          criticalAlerts:
            criticalRes.data.data.summary.criticalCenterCount +
            criticalRes.data.data.summary.criticalInventoryCount,
          centerStatusData: [
            { name: "Active", value: centers.filter((c) => c.status === "active").length },
            { name: "Full", value: centers.filter((c) => c.status === "full").length },
            { name: "Inactive", value: centers.filter((c) => c.status === "inactive").length },
          ],
          volunteerData: [
            { name: "Available", value: volunteers.filter((v) => v.availability === "available").length },
            { name: "Busy", value: volunteers.filter((v) => v.availability === "busy").length },
            { name: "Offline", value: volunteers.filter((v) => v.availability === "offline").length },
          ],
        });

        setCritical(criticalRes.data.data);
        setDispatches(dispatchRes.data.data.dispatches);
      } catch (err) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const dispatchStatusData = ["pending", "assigned", "completed"].map((s) => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    count: dispatches.filter((d) => d.status === s).length,
  }));

  return (
    <AppLayout title="Dashboard">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Relief Centers" value={stats?.totalCenters} icon={Building2} color="primary" loading={loading} />
        <StatCard title="Available Volunteers" value={stats?.availableVolunteers} icon={Users} color="green" loading={loading} />
        <StatCard title="Active Centers" value={stats?.activeCenters} icon={Building2} color="yellow" loading={loading} />
        <StatCard title="Critical Alerts" value={stats?.criticalAlerts} icon={AlertTriangle} color="red" loading={loading} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Dispatch Status Chart */}
        <div className="card p-6 xl:col-span-2">
          <h2 className="text-sm font-semibold text-surface-700 dark:text-slate-300 mb-4">Dispatch Status Overview</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dispatchStatusData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Center Status Pie */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-surface-700 dark:text-slate-300 mb-4">Center Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={stats?.centerStatusData ?? []} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {(stats?.centerStatusData ?? []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Critical Inventory */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-surface-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" /> Critical Inventory
          </h2>
          {loading ? (
            <div className="space-y-2 animate-pulse">
              {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-surface-100 dark:bg-surface-700 rounded-lg" />)}
            </div>
          ) : critical?.criticalInventory?.length === 0 ? (
            <p className="text-surface-400 text-sm py-6 text-center">No critical inventory items</p>
          ) : (
            <div className="space-y-2">
              {(critical?.criticalInventory ?? []).slice(0, 6).map((item) => (
                <div key={item._id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-surface-800 dark:text-slate-200">{item.itemName}</p>
                    <p className="text-xs text-surface-500 dark:text-slate-400">{item.centerId?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">{item.quantity}</p>
                    <p className="text-xs text-surface-400">min: {item.threshold}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Critical Centers */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-surface-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <Building2 size={16} className="text-orange-500" /> Overloaded Centers
          </h2>
          {loading ? (
            <div className="space-y-2 animate-pulse">
              {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-surface-100 dark:bg-surface-700 rounded-lg" />)}
            </div>
          ) : critical?.criticalCenters?.length === 0 ? (
            <p className="text-surface-400 text-sm py-6 text-center">All centers operating normally</p>
          ) : (
            <div className="space-y-2">
              {(critical?.criticalCenters ?? []).map((center) => (
                <div key={center._id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-surface-800 dark:text-slate-200">{center.name}</p>
                    <div className="w-32 h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full mt-1.5">
                      <div
                        className="h-1.5 rounded-full bg-orange-500"
                        style={{ width: `${Math.min((center.currentLoad / center.capacity) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge label={center.status} />
                    <p className="text-xs text-surface-400 mt-1">{center.currentLoad}/{center.capacity}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;

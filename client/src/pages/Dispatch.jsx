import React, { useEffect, useState, useCallback } from "react";
import { Plus, Search, Download } from "lucide-react";
import AppLayout from "../layouts/AppLayout.jsx";
import Table from "../components/ui/Table.jsx";
import Badge from "../components/ui/Badge.jsx";
import Modal from "../components/ui/Modal.jsx";
import Pagination from "../components/ui/Pagination.jsx";
import { dispatchAPI, volunteersAPI, centersAPI } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { exportToCSV } from "../utils/helpers.js";
import toast from "react-hot-toast";

const EMPTY = { volunteerId: "", centerId: "", taskType: "", priority: "medium" };

const Dispatch = () => {
  const { isCoordinator } = useAuth();
  const [dispatches, setDispatches] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [volunteers, setVolunteers] = useState([]);
  const [centers, setCenters] = useState([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const { data } = await dispatchAPI.getAll(params);
      setDispatches(data.data.dispatches);
      setTotal(data.data.total);
    } catch {
      toast.error("Failed to load dispatches");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, priorityFilter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    Promise.all([
      volunteersAPI.getAll({ limit: 100 }),
      centersAPI.getAll({ limit: 100 }),
    ]).then(([vRes, cRes]) => {
      setVolunteers(vRes.data.data.volunteers);
      setCenters(cRes.data.data.centers);
      setForm((f) => ({
        ...f,
        volunteerId: vRes.data.data.volunteers.find((v) => v.availability === "available")?._id ?? vRes.data.data.volunteers[0]?._id ?? "",
        centerId: cRes.data.data.centers[0]?._id ?? "",
      }));
    });
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dispatchAPI.create(form);
      toast.success("Dispatch created");
      setModal(false);
      setForm(EMPTY);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create dispatch");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await dispatchAPI.update(id, { status });
      toast.success("Status updated");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const columns = [
    { key: "taskType", label: "Task", render: (r) => <span className="font-medium">{r.taskType}</span> },
    { key: "volunteer", label: "Volunteer", render: (r) => r.volunteerId?.userId?.name ?? "—" },
    { key: "center", label: "Center", render: (r) => r.centerId?.name ?? "—" },
    { key: "priority", label: "Priority", render: (r) => <Badge label={r.priority} type="priority" /> },
    { key: "status", label: "Status", render: (r) => <Badge label={r.status} /> },
    { key: "timestamp", label: "Created", render: (r) => new Date(r.timestamp).toLocaleDateString() },
    ...(isCoordinator ? [{
      key: "actions", label: "", render: (r) => (
        r.status !== "completed" ? (
          <select
            className="input py-1 text-xs w-32"
            value={r.status}
            onChange={(e) => handleStatusUpdate(r._id, e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="completed">Completed</option>
          </select>
        ) : <span className="text-xs text-surface-400">Done</span>
      ),
    }] : []),
  ];

  return (
    <AppLayout title="Dispatch">
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <select className="input w-40" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="completed">Completed</option>
          </select>
          <select className="input w-40" value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}>
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <div className="flex-1" />
          <button onClick={() => exportToCSV(dispatches.map((d) => ({ task: d.taskType, priority: d.priority, status: d.status, center: d.centerId?.name, date: new Date(d.timestamp).toLocaleDateString() })), "dispatches")} className="btn-ghost flex items-center gap-2">
            <Download size={16} /> Export
          </button>
          {isCoordinator && (
            <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2 whitespace-nowrap">
              <Plus size={16} /> New Dispatch
            </button>
          )}
        </div>

        <Table columns={columns} data={dispatches} loading={loading} emptyMessage="No dispatches found" />
        <Pagination page={page} total={total} limit={10} onChange={setPage} />
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Create Dispatch">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-slate-300 mb-1.5">Volunteer</label>
            <select className="input" required value={form.volunteerId} onChange={(e) => setForm({ ...form, volunteerId: e.target.value })}>
              <option value="">Select volunteer</option>
              {volunteers.map((v) => (
                <option key={v._id} value={v._id} disabled={v.availability !== "available"}>
                  {v.userId?.name} {v.availability !== "available" ? `(${v.availability})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-slate-300 mb-1.5">Relief Center</label>
            <select className="input" required value={form.centerId} onChange={(e) => setForm({ ...form, centerId: e.target.value })}>
              <option value="">Select center</option>
              {centers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-slate-300 mb-1.5">Task Type</label>
            <input className="input" required placeholder="e.g. Medical supply delivery" value={form.taskType}
              onChange={(e) => setForm({ ...form, taskType: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-slate-300 mb-1.5">Priority</label>
            <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Creating..." : "Create Dispatch"}</button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
};

export default Dispatch;

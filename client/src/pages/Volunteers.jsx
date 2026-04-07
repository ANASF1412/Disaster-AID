import React, { useEffect, useState, useCallback } from "react";
import { Search, UserCheck, Download } from "lucide-react";
import AppLayout from "../layouts/AppLayout.jsx";
import Table from "../components/ui/Table.jsx";
import Badge from "../components/ui/Badge.jsx";
import Modal from "../components/ui/Modal.jsx";
import Pagination from "../components/ui/Pagination.jsx";
import { volunteersAPI, centersAPI } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { exportToCSV } from "../utils/helpers.js";
import toast from "react-hot-toast";

const Volunteers = () => {
  const { isCoordinator } = useAuth();
  const [volunteers, setVolunteers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [availFilter, setAvailFilter] = useState("");
  const [assignModal, setAssignModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [centers, setCenters] = useState([]);
  const [assignForm, setAssignForm] = useState({ centerId: "", taskType: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (availFilter) params.availability = availFilter;
      const { data } = await volunteersAPI.getAll(params);
      setVolunteers(data.data.volunteers);
      setTotal(data.data.total);
    } catch {
      toast.error("Failed to load volunteers");
    } finally {
      setLoading(false);
    }
  }, [page, availFilter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    centersAPI.getAll({ limit: 100 }).then(({ data }) => {
      setCenters(data.data.centers);
      if (data.data.centers.length > 0) setAssignForm((f) => ({ ...f, centerId: data.data.centers[0]._id }));
    });
  }, []);

  const handleStatusToggle = async (volunteer) => {
    const next = volunteer.availability === "available" ? "busy" : "available";
    try {
      await volunteersAPI.updateStatus({ volunteerId: volunteer._id, availability: next });
      toast.success("Status updated");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const openAssign = (v) => { setSelected(v); setAssignModal(true); };

  const handleAssign = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await volunteersAPI.assign({ volunteerId: selected._id, ...assignForm });
      toast.success("Volunteer assigned");
      setAssignModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Assignment failed");
    } finally {
      setSaving(false);
    }
  };

  const filtered = search
    ? volunteers.filter((v) => v.userId?.name?.toLowerCase().includes(search.toLowerCase()))
    : volunteers;

  const columns = [
    { key: "name", label: "Volunteer", render: (r) => (
      <div>
        <p className="font-medium text-surface-800 dark:text-slate-200">{r.userId?.name ?? "—"}</p>
        <p className="text-xs text-surface-400">{r.userId?.email}</p>
      </div>
    )},
    { key: "skills", label: "Skills", render: (r) => (
      <div className="flex flex-wrap gap-1">
        {(r.skills ?? []).slice(0, 3).map((s) => (
          <span key={s} className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs rounded-full">{s}</span>
        ))}
        {r.skills?.length > 3 && <span className="text-xs text-surface-400">+{r.skills.length - 3}</span>}
      </div>
    )},
    { key: "availability", label: "Status", render: (r) => <Badge label={r.availability} /> },
    ...(isCoordinator ? [{
      key: "actions", label: "", render: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStatusToggle(r)}
            className="text-xs px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
          >
            Toggle Status
          </button>
          <button
            onClick={() => openAssign(r)}
            disabled={r.availability !== "available"}
            className="text-xs px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <UserCheck size={13} className="inline mr-1" />Assign
          </button>
        </div>
      ),
    }] : []),
  ];

  return (
    <AppLayout title="Volunteers">
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input className="input pl-9" placeholder="Search volunteers..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input w-40" value={availFilter} onChange={(e) => { setAvailFilter(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="offline">Offline</option>
          </select>
          <button onClick={() => exportToCSV(filtered.map((v) => ({ name: v.userId?.name, email: v.userId?.email, availability: v.availability, skills: v.skills?.join(";") })), "volunteers")} className="btn-ghost flex items-center gap-2">
            <Download size={16} /> Export
          </button>
        </div>

        <Table columns={columns} data={filtered} loading={loading} emptyMessage="No volunteers found" />
        <Pagination page={page} total={total} limit={10} onChange={setPage} />
      </div>

      <Modal open={assignModal} onClose={() => setAssignModal(false)} title="Assign Volunteer" size="sm">
        <form onSubmit={handleAssign} className="space-y-4">
          <p className="text-sm text-surface-600 dark:text-slate-400">
            Assigning: <strong>{selected?.userId?.name}</strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-slate-300 mb-1.5">Relief Center</label>
            <select className="input" value={assignForm.centerId} onChange={(e) => setAssignForm({ ...assignForm, centerId: e.target.value })}>
              {centers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-slate-300 mb-1.5">Task Type</label>
            <input className="input" required placeholder="e.g. Food distribution" value={assignForm.taskType}
              onChange={(e) => setAssignForm({ ...assignForm, taskType: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setAssignModal(false)} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Assigning..." : "Assign"}</button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
};

export default Volunteers;

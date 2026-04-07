import React, { useEffect, useState, useCallback } from "react";
import { Plus, Search, Pencil, Trash2, MapPin } from "lucide-react";
import AppLayout from "../layouts/AppLayout.jsx";
import Table from "../components/ui/Table.jsx";
import Badge from "../components/ui/Badge.jsx";
import Modal from "../components/ui/Modal.jsx";
import Pagination from "../components/ui/Pagination.jsx";
import { centersAPI } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

const EMPTY = { name: "", location: { lat: "", lng: "" }, capacity: "", contactInfo: "", status: "active" };

const Centers = () => {
  const { isCoordinator } = useAuth();
  const [centers, setCenters] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await centersAPI.getAll(params);
      const filtered = search
        ? data.data.centers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
        : data.data.centers;
      setCenters(filtered);
      setTotal(data.data.total);
    } catch {
      toast.error("Failed to load centers");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name,
      location: { lat: c.location?.lat ?? "", lng: c.location?.lng ?? "" },
      capacity: c.capacity,
      currentLoad: c.currentLoad,
      contactInfo: c.contactInfo ?? "",
      status: c.status,
    });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await centersAPI.update(editing._id, form);
        toast.success("Center updated");
      } else {
        await centersAPI.create(form);
        toast.success("Center created");
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this center?")) return;
    try {
      await centersAPI.delete(id);
      toast.success("Center deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const columns = [
    { key: "name", label: "Name", render: (r) => (
      <div className="flex items-center gap-2">
        <MapPin size={14} className="text-primary-500 shrink-0" />
        <span className="font-medium">{r.name}</span>
      </div>
    )},
    { key: "location", label: "Coordinates", render: (r) =>
      r.location?.lat ? `${r.location.lat.toFixed(4)}, ${r.location.lng.toFixed(4)}` : "—"
    },
    { key: "capacity", label: "Capacity", render: (r) => (
      <div>
        <span>{r.currentLoad}/{r.capacity}</span>
        <div className="w-20 h-1 bg-surface-200 dark:bg-surface-700 rounded-full mt-1">
          <div
            className="h-1 rounded-full bg-primary-500"
            style={{ width: `${Math.min((r.currentLoad / r.capacity) * 100, 100)}%` }}
          />
        </div>
      </div>
    )},
    { key: "status", label: "Status", render: (r) => <Badge label={r.status} /> },
    { key: "contactInfo", label: "Contact" },
    ...(isCoordinator ? [{
      key: "actions", label: "", render: (r) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500">
            <Pencil size={14} />
          </button>
          <button onClick={() => handleDelete(r._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    }] : []),
  ];

  return (
    <AppLayout title="Relief Centers">
      <div className="card p-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input className="input pl-9" placeholder="Search centers..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="input w-40" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="full">Full</option>
            <option value="inactive">Inactive</option>
          </select>
          {isCoordinator && (
            <button onClick={openCreate} className="btn-primary flex items-center gap-2 whitespace-nowrap">
              <Plus size={16} /> Add Center
            </button>
          )}
        </div>

        <Table columns={columns} data={centers} loading={loading} emptyMessage="No relief centers found" />
        <Pagination page={page} total={total} limit={10} onChange={setPage} />
      </div>

      {/* Create / Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Center" : "Add Relief Center"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-slate-300 mb-1.5">Name</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-slate-300 mb-1.5">Latitude</label>
              <input type="number" step="any" className="input" required value={form.location.lat}
                onChange={(e) => setForm({ ...form, location: { ...form.location, lat: parseFloat(e.target.value) } })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-slate-300 mb-1.5">Longitude</label>
              <input type="number" step="any" className="input" required value={form.location.lng}
                onChange={(e) => setForm({ ...form, location: { ...form.location, lng: parseFloat(e.target.value) } })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-slate-300 mb-1.5">Capacity</label>
              <input type="number" min="1" className="input" required value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-slate-300 mb-1.5">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="full">Full</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-slate-300 mb-1.5">Contact Info</label>
            <input className="input" value={form.contactInfo} onChange={(e) => setForm({ ...form, contactInfo: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
};

export default Centers;

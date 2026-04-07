import React, { useEffect, useState, useCallback } from "react";
import { Plus, Search, Download, Pencil, AlertTriangle } from "lucide-react";
import AppLayout from "../layouts/AppLayout.jsx";
import Table from "../components/ui/Table.jsx";
import Modal from "../components/ui/Modal.jsx";
import Badge from "../components/ui/Badge.jsx";
import { inventoryAPI, centersAPI } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { exportToCSV, cn } from "../utils/helpers.js";
import toast from "react-hot-toast";

const CATEGORIES = ["food", "medicine", "shelter", "clothing", "water", "equipment", "other"];
const EMPTY_ITEM = { itemName: "", category: "food", quantity: 0, threshold: 0, centerId: "" };

const Inventory = () => {
  const { isCoordinator } = useAuth();
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [bulkModal, setBulkModal] = useState(false);
  const [form, setForm] = useState(EMPTY_ITEM);
  const [editItem, setEditItem] = useState(null);
  const [editQty, setEditQty] = useState(0);
  const [bulkUpdates, setBulkUpdates] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    centersAPI.getAll({ limit: 100 }).then(({ data }) => {
      setCenters(data.data.centers);
      if (data.data.centers.length > 0) setSelectedCenter(data.data.centers[0]._id);
    }).catch(() => toast.error("Failed to load centers"));
  }, []);

  const load = useCallback(async () => {
    if (!selectedCenter) return;
    setLoading(true);
    try {
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      const { data } = await inventoryAPI.getByCenter(selectedCenter, params);
      setItems(data.data);
    } catch {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [selectedCenter, categoryFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = search
    ? items.filter((i) => i.itemName.toLowerCase().includes(search.toLowerCase()))
    : items;

  const openEdit = (item) => { setEditItem(item); setEditQty(item.quantity); setEditModal(true); };

  const openBulk = () => {
    setBulkUpdates(items.map((i) => ({ id: i._id, itemName: i.itemName, quantity: i.quantity })));
    setBulkModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await inventoryAPI.create({ ...form, centerId: selectedCenter });
      toast.success("Item added");
      setModal(false);
      setForm(EMPTY_ITEM);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add item");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await inventoryAPI.update(editItem._id, { quantity: Number(editQty) });
      toast.success("Quantity updated");
      setEditModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleBulk = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await inventoryAPI.bulkUpdate(bulkUpdates.map(({ id, quantity }) => ({ id, quantity: Number(quantity) })));
      toast.success(`${bulkUpdates.length} items updated`);
      setBulkModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Bulk update failed");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "itemName", label: "Item", render: (r) => (
      <div className="flex items-center gap-2">
        {r.quantity <= r.threshold && <AlertTriangle size={14} className="text-red-500 shrink-0" />}
        <span className="font-medium">{r.itemName}</span>
      </div>
    )},
    { key: "category", label: "Category", render: (r) => (
      <span className="capitalize text-surface-600 dark:text-slate-400">{r.category}</span>
    )},
    { key: "quantity", label: "Quantity", render: (r) => (
      <span className={cn("font-semibold", r.quantity <= r.threshold ? "text-red-600" : r.quantity <= r.threshold * 2 ? "text-yellow-600" : "text-green-600")}>
        {r.quantity}
      </span>
    )},
    { key: "threshold", label: "Min. Level" },
    { key: "status", label: "Status", render: (r) => (
      <Badge label={r.quantity <= r.threshold ? "critical" : r.quantity <= r.threshold * 2 ? "low" : "sufficient"} />
    )},
    ...(isCoordinator ? [{
      key: "actions", label: "", render: (r) => (
        <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500">
          <Pencil size={14} />
        </button>
      ),
    }] : []),
  ];

  return (
    <AppLayout title="Inventory">
      <div className="card p-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <select className="input w-52" value={selectedCenter} onChange={(e) => setSelectedCenter(e.target.value)}>
            {centers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input className="input pl-9" placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input w-36" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
          <button onClick={() => exportToCSV(filtered, "inventory")} className="btn-ghost flex items-center gap-2 whitespace-nowrap">
            <Download size={16} /> Export
          </button>
          {isCoordinator && (
            <>
              <button onClick={openBulk} className="btn-ghost flex items-center gap-2 whitespace-nowrap border border-surface-200 dark:border-surface-700">
                Bulk Update
              </button>
              <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2 whitespace-nowrap">
                <Plus size={16} /> Add Item
              </button>
            </>
          )}
        </div>

        <Table columns={columns} data={filtered} loading={loading} emptyMessage="No inventory items found" />
      </div>

      {/* Add Item Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Add Inventory Item">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-slate-300 mb-1.5">Item Name</label>
            <input className="input" required value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-slate-300 mb-1.5">Category</label>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-slate-300 mb-1.5">Quantity</label>
              <input type="number" min="0" className="input" required value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-slate-300 mb-1.5">Minimum Threshold</label>
            <input type="number" min="0" className="input" required value={form.threshold}
              onChange={(e) => setForm({ ...form, threshold: parseInt(e.target.value) })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Adding..." : "Add Item"}</button>
          </div>
        </form>
      </Modal>

      {/* Edit Quantity Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Update Quantity" size="sm">
        <form onSubmit={handleEdit} className="space-y-4">
          <p className="text-sm text-surface-600 dark:text-slate-400">Updating: <strong>{editItem?.itemName}</strong></p>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-slate-300 mb-1.5">New Quantity</label>
            <input type="number" min="0" className="input" value={editQty} onChange={(e) => setEditQty(e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setEditModal(false)} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Saving..." : "Update"}</button>
          </div>
        </form>
      </Modal>

      {/* Bulk Update Modal */}
      <Modal open={bulkModal} onClose={() => setBulkModal(false)} title="Bulk Update Inventory" size="lg">
        <form onSubmit={handleBulk}>
          <div className="max-h-96 overflow-y-auto space-y-2 mb-4">
            {bulkUpdates.map((item, i) => (
              <div key={item.id} className="flex items-center gap-4 p-3 bg-surface-50 dark:bg-surface-900 rounded-xl">
                <span className="flex-1 text-sm font-medium text-surface-700 dark:text-slate-300">{item.itemName}</span>
                <input
                  type="number" min="0"
                  className="input w-28 text-center"
                  value={item.quantity}
                  onChange={(e) => {
                    const updated = [...bulkUpdates];
                    updated[i] = { ...updated[i], quantity: e.target.value };
                    setBulkUpdates(updated);
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setBulkModal(false)} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Updating..." : `Update ${bulkUpdates.length} Items`}</button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
};

export default Inventory;

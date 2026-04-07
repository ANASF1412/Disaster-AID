import Inventory from "../models/Inventory.js";
import ReliefCenter from "../models/ReliefCenter.js";
import Log from "../models/Log.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const getInventoryByCenter = async (req, res) => {
  const { centerId } = req.params;
  const { category } = req.query;

  const center = await ReliefCenter.findById(centerId);
  if (!center) return errorResponse(res, "Relief center not found", 404);

  const filter = { centerId };
  if (category) filter.category = category;

  const items = await Inventory.find(filter).sort({ category: 1, itemName: 1 });
  return successResponse(res, items);
};

export const createInventoryItem = async (req, res) => {
  const center = await ReliefCenter.findById(req.body.centerId);
  if (!center) return errorResponse(res, "Relief center not found", 404);

  const item = await Inventory.create({ ...req.body, lastUpdated: new Date() });

  await Log.create({
    action: "INVENTORY_CREATED",
    user: req.user.id,
    metadata: { itemId: item._id, itemName: item.itemName, centerId: item.centerId },
  });

  return successResponse(res, item, "Inventory item created", 201);
};

export const updateInventoryItem = async (req, res) => {
  const { quantity } = req.body;

  const item = await Inventory.findByIdAndUpdate(
    req.params.id,
    { quantity, lastUpdated: new Date() },
    { new: true, runValidators: true }
  );

  if (!item) return errorResponse(res, "Inventory item not found", 404);

  await Log.create({
    action: "INVENTORY_UPDATED",
    user: req.user.id,
    metadata: { itemId: req.params.id, quantity },
  });

  return successResponse(res, item, "Inventory updated");
};

// Sequential bulk update with manual rollback — M0 Atlas compatible (no transactions)
export const bulkUpdateInventory = async (req, res) => {
  const { updates } = req.body; // [{ id, quantity }]

  // Step 1: Validate all IDs exist before touching any document
  const existing = await Inventory.find({
    _id: { $in: updates.map((u) => u.id) },
  }).select("_id quantity");

  if (existing.length !== updates.length) {
    return errorResponse(res, "One or more inventory items not found — no changes applied", 404);
  }

  // Step 2: Save original quantities for rollback
  const originals = existing.map((doc) => ({ id: doc._id.toString(), quantity: doc.quantity }));

  // Step 3: Apply updates sequentially, tracking what succeeded
  const results = [];
  const applied = [];

  try {
    for (const { id, quantity } of updates) {
      const updated = await Inventory.findByIdAndUpdate(
        id,
        { quantity, lastUpdated: new Date() },
        { new: true, runValidators: true }
      );
      results.push(updated);
      applied.push(id);
    }
  } catch (err) {
    // Step 4: Manual rollback — restore only the docs we already changed
    const rollbackTargets = originals.filter((o) => applied.includes(o.id));
    await Promise.allSettled(
      rollbackTargets.map(({ id, quantity }) =>
        Inventory.findByIdAndUpdate(id, { quantity, lastUpdated: new Date() })
      )
    );
    return errorResponse(res, `Bulk update failed after ${applied.length} writes — changes rolled back`, 500, err);
  }

  await Log.create({
    action: "INVENTORY_BULK_UPDATED",
    user: req.user.id,
    metadata: { count: updates.length },
  });

  return successResponse(res, results, `${results.length} items updated`);
};

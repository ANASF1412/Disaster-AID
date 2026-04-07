import mongoose from "mongoose";
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

// Atomic bulk update — uses MongoDB session to prevent race conditions
export const bulkUpdateInventory = async (req, res) => {
  const { updates } = req.body; // [{ id, quantity }]

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const results = await Promise.all(
      updates.map(({ id, quantity }) =>
        Inventory.findByIdAndUpdate(
          id,
          { quantity, lastUpdated: new Date() },
          { new: true, runValidators: true, session }
        )
      )
    );

    const missing = results.some((r) => r === null);
    if (missing) {
      await session.abortTransaction();
      return errorResponse(res, "One or more inventory items not found — no changes applied", 404);
    }

    await session.commitTransaction();

    await Log.create({
      action: "INVENTORY_BULK_UPDATED",
      user: req.user.id,
      metadata: { count: updates.length },
    });

    return successResponse(res, results, `${results.length} items updated`);
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

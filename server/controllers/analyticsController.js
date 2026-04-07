import ReliefCenter from "../models/ReliefCenter.js";
import Inventory from "../models/Inventory.js";
import Dispatch from "../models/Dispatch.js";
import { successResponse } from "../utils/response.js";

export const getCriticalZones = async (_req, res) => {
  // Centers at ≥80% capacity or marked full
  const centers = await ReliefCenter.find({
    $or: [
      { status: "full" },
      { $expr: { $gte: ["$currentLoad", { $multiply: ["$capacity", 0.8] }] } },
    ],
  }).select("name location capacity currentLoad status");

  // Inventory items below threshold
  const criticalItems = await Inventory.find({
    $expr: { $lte: ["$quantity", "$threshold"] },
  })
    .populate("centerId", "name location")
    .select("itemName category quantity threshold centerId");

  return successResponse(res, {
    criticalCenters: centers,
    criticalInventory: criticalItems,
    summary: {
      criticalCenterCount: centers.length,
      criticalInventoryCount: criticalItems.length,
    },
  });
};

export const getHeatmap = async (_req, res) => {
  // Aggregate dispatch counts per center for heatmap intensity
  const dispatchHeat = await Dispatch.aggregate([
    { $match: { status: { $in: ["pending", "assigned"] } } },
    { $group: { _id: "$centerId", activeDispatches: { $sum: 1 } } },
    {
      $lookup: {
        from: "reliefcenters",
        localField: "_id",
        foreignField: "_id",
        as: "center",
      },
    },
    { $unwind: "$center" },
    {
      $project: {
        _id: 0,
        centerId: "$_id",
        name: "$center.name",
        lat: "$center.location.lat",
        lng: "$center.location.lng",
        activeDispatches: 1,
        currentLoad: "$center.currentLoad",
        capacity: "$center.capacity",
      },
    },
  ]);

  return successResponse(res, dispatchHeat);
};

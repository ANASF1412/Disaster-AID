import ReliefCenter from "../models/ReliefCenter.js";
import Log from "../models/Log.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const getCenters = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = status ? { status } : {};
  const skip = (Number(page) - 1) * Number(limit);

  const [centers, total] = await Promise.all([
    ReliefCenter.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    ReliefCenter.countDocuments(filter),
  ]);

  return successResponse(res, { centers, total, page: Number(page), limit: Number(limit) });
};

export const createCenter = async (req, res) => {
  const { name, location, capacity, currentLoad, contactInfo, status } = req.body;

  const center = await ReliefCenter.create({
    name,
    location: {
      type: "Point",
      coordinates: [location.lng, location.lat],
      lat: location.lat,
      lng: location.lng,
    },
    capacity,
    currentLoad: currentLoad || 0,
    contactInfo,
    status,
  });

  await Log.create({
    action: "CENTER_CREATED",
    user: req.user.id,
    metadata: { centerId: center._id, name },
  });

  return successResponse(res, center, "Relief center created", 201);
};

export const updateCenter = async (req, res) => {
  const center = await ReliefCenter.findById(req.params.id);
  if (!center) return errorResponse(res, "Relief center not found", 404);

  const { location, currentLoad, capacity, ...rest } = req.body;

  // Prevent over-capacity
  const newLoad = currentLoad ?? center.currentLoad;
  const newCapacity = capacity ?? center.capacity;
  if (newLoad > newCapacity) {
    return errorResponse(res, "Current load cannot exceed capacity", 400);
  }

  if (location) {
    rest.location = {
      type: "Point",
      coordinates: [location.lng, location.lat],
      lat: location.lat,
      lng: location.lng,
    };
  }

  if (currentLoad !== undefined) rest.currentLoad = currentLoad;
  if (capacity !== undefined) rest.capacity = capacity;

  // Auto-update status based on load
  if (newLoad >= newCapacity) rest.status = "full";
  else if (rest.status !== "inactive") rest.status = "active";

  rest.lastUpdated = new Date();

  const updated = await ReliefCenter.findByIdAndUpdate(req.params.id, rest, {
    new: true,
    runValidators: true,
  });

  await Log.create({
    action: "CENTER_UPDATED",
    user: req.user.id,
    metadata: { centerId: req.params.id },
  });

  return successResponse(res, updated, "Relief center updated");
};

export const deleteCenter = async (req, res) => {
  const center = await ReliefCenter.findByIdAndDelete(req.params.id);
  if (!center) return errorResponse(res, "Relief center not found", 404);

  await Log.create({
    action: "CENTER_DELETED",
    user: req.user.id,
    metadata: { centerId: req.params.id, name: center.name },
  });

  return successResponse(res, null, "Relief center deleted");
};

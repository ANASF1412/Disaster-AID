import Dispatch from "../models/Dispatch.js";
import Volunteer from "../models/Volunteer.js";
import Log from "../models/Log.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const createDispatch = async (req, res) => {
  const { volunteerId, centerId, taskType, priority } = req.body;

  const volunteer = await Volunteer.findById(volunteerId);
  if (!volunteer) return errorResponse(res, "Volunteer not found", 404);

  if (volunteer.availability === "busy") {
    return errorResponse(res, "Volunteer is already on an active dispatch", 409);
  }

  const dispatch = await Dispatch.create({ volunteerId, centerId, taskType, priority, status: "pending" });

  await Log.create({
    action: "DISPATCH_CREATED",
    user: req.user.id,
    metadata: { dispatchId: dispatch._id, volunteerId, centerId, priority },
  });

  return successResponse(res, dispatch, "Dispatch created", 201);
};

export const getDispatches = async (req, res) => {
  const { status, priority, centerId, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (centerId) filter.centerId = centerId;

  const skip = (Number(page) - 1) * Number(limit);

  const [dispatches, total] = await Promise.all([
    Dispatch.find(filter)
      .populate("volunteerId", "availability")
      .populate("centerId", "name status")
      .skip(skip)
      .limit(Number(limit))
      .sort({ timestamp: -1 }),
    Dispatch.countDocuments(filter),
  ]);

  return successResponse(res, { dispatches, total, page: Number(page), limit: Number(limit) });
};

export const updateDispatch = async (req, res) => {
  const { status } = req.body;

  const dispatch = await Dispatch.findById(req.params.id);
  if (!dispatch) return errorResponse(res, "Dispatch not found", 404);

  dispatch.status = status;
  await dispatch.save();

  // When task completes, free the volunteer
  if (status === "completed") {
    await Volunteer.findByIdAndUpdate(dispatch.volunteerId, {
      availability: "available",
      $pull: { assignedTasks: dispatch._id },
    });
  }

  await Log.create({
    action: "DISPATCH_UPDATED",
    user: req.user.id,
    metadata: { dispatchId: dispatch._id, status },
  });

  return successResponse(res, dispatch, "Dispatch updated");
};

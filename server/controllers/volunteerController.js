import Volunteer from "../models/Volunteer.js";
import Dispatch from "../models/Dispatch.js";
import ReliefCenter from "../models/ReliefCenter.js";
import Log from "../models/Log.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const getVolunteers = async (req, res) => {
  const { availability, page = 1, limit = 20 } = req.query;
  const filter = availability ? { availability } : {};
  const skip = (Number(page) - 1) * Number(limit);

  const [volunteers, total] = await Promise.all([
    Volunteer.find(filter)
      .populate("userId", "name email")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    Volunteer.countDocuments(filter),
  ]);

  return successResponse(res, { volunteers, total, page: Number(page), limit: Number(limit) });
};

export const updateVolunteerStatus = async (req, res) => {
  const { volunteerId, availability } = req.body;

  const volunteer = await Volunteer.findByIdAndUpdate(
    volunteerId,
    { availability },
    { new: true, runValidators: true }
  ).populate("userId", "name email");

  if (!volunteer) return errorResponse(res, "Volunteer not found", 404);

  await Log.create({
    action: "VOLUNTEER_STATUS_UPDATED",
    user: req.user.id,
    metadata: { volunteerId, availability },
  });

  return successResponse(res, volunteer, "Volunteer status updated");
};

export const assignVolunteer = async (req, res) => {
  const { volunteerId, centerId, taskType } = req.body;

  const [volunteer, center] = await Promise.all([
    Volunteer.findById(volunteerId),
    ReliefCenter.findById(centerId),
  ]);

  if (!volunteer) return errorResponse(res, "Volunteer not found", 404);
  if (!center) return errorResponse(res, "Relief center not found", 404);

  // Guard: prevent double-assignment
  if (volunteer.availability === "busy") {
    return errorResponse(res, "Volunteer is already assigned to an active task", 409);
  }

  if (center.status === "inactive") {
    return errorResponse(res, "Cannot assign to an inactive relief center", 400);
  }

  const dispatch = await Dispatch.create({
    volunteerId,
    centerId,
    taskType,
    priority: "medium",
    status: "assigned",
  });

  await Volunteer.findByIdAndUpdate(volunteerId, {
    availability: "busy",
    $push: { assignedTasks: dispatch._id },
  });

  await Log.create({
    action: "VOLUNTEER_ASSIGNED",
    user: req.user.id,
    metadata: { volunteerId, centerId, taskType, dispatchId: dispatch._id },
  });

  return successResponse(res, dispatch, "Volunteer assigned", 201);
};

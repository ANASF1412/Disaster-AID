import { Router } from "express";
import {
  getVolunteers,
  updateVolunteerStatus,
  assignVolunteer,
} from "../controllers/volunteerController.js";
import auth, { authorize } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { volunteerStatusSchema, volunteerAssignSchema } from "../utils/validators.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

router.get("/", auth, asyncHandler(getVolunteers));
router.put("/status", auth, validate(volunteerStatusSchema), asyncHandler(updateVolunteerStatus));
router.post("/assign", auth, authorize("admin", "coordinator"), validate(volunteerAssignSchema), asyncHandler(assignVolunteer));

export default router;

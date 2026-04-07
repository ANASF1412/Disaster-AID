import { Router } from "express";
import { getCriticalZones, getHeatmap } from "../controllers/analyticsController.js";
import auth, { authorize } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

router.get("/critical-zones", auth, authorize("admin", "coordinator"), asyncHandler(getCriticalZones));
router.get("/heatmap", auth, authorize("admin", "coordinator"), asyncHandler(getHeatmap));

export default router;

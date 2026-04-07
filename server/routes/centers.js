import { Router } from "express";
import {
  getCenters,
  createCenter,
  updateCenter,
  deleteCenter,
} from "../controllers/centerController.js";
import auth, { authorize } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { centerSchema } from "../utils/validators.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

router.get("/", asyncHandler(getCenters));
router.post("/", auth, authorize("admin", "coordinator"), validate(centerSchema), asyncHandler(createCenter));
router.put("/:id", auth, authorize("admin", "coordinator"), asyncHandler(updateCenter));
router.delete("/:id", auth, authorize("admin"), asyncHandler(deleteCenter));

export default router;

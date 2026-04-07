import { Router } from "express";
import {
  createDispatch,
  getDispatches,
  updateDispatch,
} from "../controllers/dispatchController.js";
import auth, { authorize } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { dispatchSchema, dispatchUpdateSchema } from "../utils/validators.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

router.post("/", auth, authorize("admin", "coordinator"), validate(dispatchSchema), asyncHandler(createDispatch));
router.get("/", auth, asyncHandler(getDispatches));
router.put("/:id", auth, authorize("admin", "coordinator"), validate(dispatchUpdateSchema), asyncHandler(updateDispatch));

export default router;

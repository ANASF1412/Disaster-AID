import { Router } from "express";
import {
  getInventoryByCenter,
  createInventoryItem,
  updateInventoryItem,
  bulkUpdateInventory,
} from "../controllers/inventoryController.js";
import auth, { authorize } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {
  inventoryItemSchema,
  inventoryUpdateSchema,
  bulkInventorySchema,
} from "../utils/validators.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

// bulk-update MUST be before /:id — otherwise Express matches "bulk-update" as an id
router.put("/bulk-update", auth, authorize("admin", "coordinator"), validate(bulkInventorySchema), asyncHandler(bulkUpdateInventory));
router.get("/:centerId", auth, asyncHandler(getInventoryByCenter));
router.post("/", auth, authorize("admin", "coordinator"), validate(inventoryItemSchema), asyncHandler(createInventoryItem));
router.put("/:id", auth, authorize("admin", "coordinator"), validate(inventoryUpdateSchema), asyncHandler(updateInventoryItem));

export default router;

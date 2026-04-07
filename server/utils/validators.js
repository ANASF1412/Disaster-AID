import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("admin", "coordinator", "volunteer").default("volunteer"),
  assignedCenter: Joi.string().optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const centerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  location: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
  }).required(),
  capacity: Joi.number().min(1).required(),
  currentLoad: Joi.number().min(0).default(0),
  contactInfo: Joi.string().optional(),
  status: Joi.string().valid("active", "full", "inactive").default("active"),
});

export const inventoryItemSchema = Joi.object({
  itemName: Joi.string().min(1).max(100).required(),
  category: Joi.string()
    .valid("food", "medicine", "shelter", "clothing", "water", "equipment", "other")
    .required(),
  quantity: Joi.number().min(0).required(),
  threshold: Joi.number().min(0).required(),
  centerId: Joi.string().required(),
});

export const inventoryUpdateSchema = Joi.object({
  quantity: Joi.number().min(0).required(),
});

export const bulkInventorySchema = Joi.object({
  updates: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        quantity: Joi.number().min(0).required(),
      })
    )
    .min(1)
    .required(),
});

export const volunteerStatusSchema = Joi.object({
  volunteerId: Joi.string().required(),
  availability: Joi.string().valid("available", "busy", "offline").required(),
});

export const volunteerAssignSchema = Joi.object({
  volunteerId: Joi.string().required(),
  centerId: Joi.string().required(),
  taskType: Joi.string().required(),
});

export const dispatchSchema = Joi.object({
  volunteerId: Joi.string().required(),
  centerId: Joi.string().required(),
  taskType: Joi.string().required(),
  priority: Joi.string().valid("low", "medium", "high", "critical").default("medium"),
});

export const dispatchUpdateSchema = Joi.object({
  status: Joi.string().valid("pending", "assigned", "completed").required(),
});

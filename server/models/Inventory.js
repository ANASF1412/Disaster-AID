import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["food", "medicine", "shelter", "clothing", "water", "equipment", "other"],
      required: true,
    },
    quantity: { type: Number, required: true, min: [0, "Quantity cannot be negative"] },
    threshold: { type: Number, required: true, min: [0, "Threshold cannot be negative"] },
    centerId: { type: mongoose.Schema.Types.ObjectId, ref: "ReliefCenter", required: true },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

inventorySchema.index({ centerId: 1 });
inventorySchema.index({ centerId: 1, category: 1 });

// Virtual: is this item below threshold?
inventorySchema.virtual("isCritical").get(function () {
  return this.quantity <= this.threshold;
});

inventorySchema.set("toJSON", { virtuals: true });

export default mongoose.model("Inventory", inventorySchema);

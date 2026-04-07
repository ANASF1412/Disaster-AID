import mongoose from "mongoose";

const dispatchSchema = new mongoose.Schema(
  {
    volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: "Volunteer", required: true },
    centerId: { type: mongoose.Schema.Types.ObjectId, ref: "ReliefCenter", required: true },
    taskType: { type: String, required: true, trim: true },
    priority: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
    status: { type: String, enum: ["pending", "assigned", "completed"], default: "pending" },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

dispatchSchema.index({ volunteerId: 1, status: 1 });
dispatchSchema.index({ centerId: 1, status: 1 });
dispatchSchema.index({ priority: 1, status: 1 });

export default mongoose.model("Dispatch", dispatchSchema);

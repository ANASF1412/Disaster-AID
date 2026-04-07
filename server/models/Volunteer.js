import mongoose from "mongoose";

const volunteerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    skills: [{ type: String, trim: true }],
    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    availability: { type: String, enum: ["available", "busy", "offline"], default: "available" },
    assignedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dispatch" }],
  },
  { timestamps: true }
);

volunteerSchema.index({ currentLocation: "2dsphere" });
volunteerSchema.index({ availability: 1 });

export default mongoose.model("Volunteer", volunteerSchema);

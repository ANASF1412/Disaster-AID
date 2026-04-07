import mongoose from "mongoose";

const reliefCenterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat] — GeoJSON standard
        required: true,
        validate: {
          validator: (v) => v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90,
          message: "Invalid coordinates",
        },
      },
      // Human-readable fields stored alongside GeoJSON
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    capacity: { type: Number, required: true, min: 1 },
    currentLoad: {
      type: Number,
      default: 0,
      min: [0, "Current load cannot be negative"],
      validate: {
        validator: function (v) { return v <= this.capacity; },
        message: "Current load cannot exceed capacity",
      },
    },
    contactInfo: { type: String, trim: true },
    status: { type: String, enum: ["active", "full", "inactive"], default: "active" },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

reliefCenterSchema.index({ location: "2dsphere" });
reliefCenterSchema.index({ status: 1 });

export default mongoose.model("ReliefCenter", reliefCenterSchema);

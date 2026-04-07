import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  action: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  timestamp: { type: Date, default: Date.now },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
});

logSchema.index({ timestamp: -1 });
logSchema.index({ user: 1 });

export default mongoose.model("Log", logSchema);

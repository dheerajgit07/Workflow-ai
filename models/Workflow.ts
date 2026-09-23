import mongoose from "mongoose";

const HistorySchema = new mongoose.Schema({
  id: { type: String },
  action: { type: String, required: true },
  user: { type: String, default: "System" },
  time: { type: String, default: "Just Now" },
  createdAt: { type: Date, default: Date.now }
});

const WorkflowSchema = new mongoose.Schema({
  _id: { type: String },
  id: { type: String },
  name: { type: String, required: true },
  status: { type: String, default: "In Progress" },
  assignee: { type: String, required: true },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  timeline: { type: String, required: true }, // Format: YYYY-MM-DD
  analytics: {
    views: { type: Number, default: 0 },
    updates: { type: Number, default: 0 }
  },
  history: [HistorySchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  _id: false
});

export default mongoose.models.Workflow || mongoose.model("Workflow", WorkflowSchema);
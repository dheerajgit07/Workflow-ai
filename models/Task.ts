import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  _id: { type: String },
  id: { type: String },
  title: { type: String, required: true },
  status: { type: String, default: "To Do" }, // "To Do", "In Progress", "Review", "Done"
  priority: { type: String, default: "Medium" }, // "High", "Medium", "Low"
  assignee: { type: String, default: "Unassigned" },
  due: { type: String, required: true }, // Format: YYYY-MM-DD
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  _id: false
});

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
import mongoose from "mongoose";

const LogSchema = new mongoose.Schema({
  id: { type: String },
  text: { type: String, required: true },
  time: { type: String, default: "Just Now" },
  createdAt: { type: Date, default: Date.now }
});

const TicketSchema = new mongoose.Schema({
  _id: { type: String },
  id: { type: String },
  name: { type: String, required: true },
  status: { type: String, default: "In Progress" },
  owner: { type: String, required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  group: { type: String, default: "active" }, // "active" or "done"
  description: { type: String, default: "" },
  logs: [LogSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  _id: false
});

export default mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);
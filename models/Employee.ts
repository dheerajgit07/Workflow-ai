import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema({
  _id: { type: String },
  id: { type: String },
  name: { type: String, required: true },
  role: { type: String, required: true },
  performance: { type: Number, default: 90, min: 0, max: 100 },
  activeTickets: { type: Number, default: 0 },
  status: { type: String, default: "Active" }, // "Active", "Inactive"
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  _id: false
});

export default mongoose.models.Employee || mongoose.model("Employee", EmployeeSchema);

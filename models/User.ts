import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  // FIX: Custom string IDs (like "admin-id") ko validate karne ke liye isko explicitly string set karna hoga
  _id: { 
    type: String, 
    required: true 
  },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "Agent" },
  avatar: { type: String, default: "" },
  color: { type: String, default: "bg-indigo-500" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  // Mongoose ko default internal ObjectId generator bands karne ke liye bol rahe hain
  _id: false 
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
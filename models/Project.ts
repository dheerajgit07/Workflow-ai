import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
    _id: { type: String },
    id: { type: String },
    name: { type: String, required: true },
    status: { type: String, default: "In Progress" },
    budget: { type: String, default: "$0" },
    timeline: { type: String, required: true },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    client: { type: String, default: "In-House" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    _id: false
});

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema);

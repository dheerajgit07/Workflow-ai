import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
    _id: { type: String },
    id: { type: String },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    time: { type: String, default: "Just Now" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    _id: false
});

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);

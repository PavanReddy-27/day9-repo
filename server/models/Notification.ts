import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, enum: ["INFO", "WARNING", "SUCCESS", "ALERT"], default: "INFO" },
    isRead: { type: Boolean, default: false },
    linkUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

notificationSchema.index({ companyId: 1, userId: 1, isRead: 1 });

export default mongoose.models.Notification || mongoose.model("Notification", notificationSchema, "notifications");

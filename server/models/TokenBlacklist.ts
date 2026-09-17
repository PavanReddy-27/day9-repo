import mongoose from "mongoose";

const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // Automatically delete after 24 hours (86400 seconds)
  },
});

export default (mongoose.models.TokenBlacklist || mongoose.model("TokenBlacklist", tokenBlacklistSchema)) as mongoose.Model<any>;

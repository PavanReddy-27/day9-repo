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

const TokenBlacklist = mongoose.models.TokenBlacklist || mongoose.model("TokenBlacklist", tokenBlacklistSchema);
export default TokenBlacklist as typeof mongoose.Model;

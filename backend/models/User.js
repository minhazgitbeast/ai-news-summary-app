import mongoose from "mongoose";

const summarySchema = new mongoose.Schema(
  {
    originalText: { type: String, required: true },
    summary: { type: String, required: true },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    summaries: [summarySchema], // Add this line
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;

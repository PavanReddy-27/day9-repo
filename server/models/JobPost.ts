import mongoose from "mongoose";

const jobPostSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    jobId: { type: String, required: true },
    title: { type: String, required: true },
    department: { type: String, required: true },
    location: { type: String, required: true },
    type: { type: String, enum: ["Full-time", "Part-time", "Contract", "Internship"], default: "Full-time" },
    applicants: { type: Number, default: 0 },
    posted: { type: String, required: true },
    status: { type: String, enum: ["Open", "Closed", "On Hold"], default: "Open" },
  },
  { timestamps: true }
);

export default mongoose.models.JobPost || mongoose.model("JobPost", jobPostSchema, "jobposts");

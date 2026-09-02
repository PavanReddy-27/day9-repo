import mongoose from "mongoose";
import JobPost from "../models/JobPost.js";

const DEFAULT_JOBS = [
  { jobId: "JOB001", title: "Senior Software Engineer", department: "Engineering", location: "Hyderabad", type: "Full-time", applicants: 34, posted: "2026-07-28", status: "Open" },
  { jobId: "JOB002", title: "HR Business Partner", department: "Human Resources", location: "Mumbai", type: "Full-time", applicants: 18, posted: "2026-07-25", status: "Open" },
  { jobId: "JOB003", title: "Data Analyst", department: "Finance", location: "Bangalore", type: "Full-time", applicants: 42, posted: "2026-07-20", status: "Open" },
  { jobId: "JOB004", title: "Marketing Lead", department: "Marketing", location: "Chennai", type: "Full-time", applicants: 11, posted: "2026-07-18", status: "On Hold" },
  { jobId: "JOB005", title: "UX Designer", department: "Engineering", location: "Hyderabad", type: "Contract", applicants: 27, posted: "2026-07-15", status: "Open" },
];

export const getJobPosts = async (req: any, res: any) => {
  try {
    const companyId = req.companyId ? new mongoose.Types.ObjectId(req.companyId) : new mongoose.Types.ObjectId("000000000000000000000001");
    let jobs = await JobPost.find({ companyId }).sort({ createdAt: -1 });

    if (jobs.length === 0) {
      // Seed default jobs for the company
      const seedJobs = DEFAULT_JOBS.map((j) => ({ ...j, companyId }));
      jobs = await JobPost.insertMany(seedJobs);
    }

    return res.status(200).json({
      success: true,
      data: jobs.map((j) => ({
        id: j.jobId,
        _id: j._id,
        title: j.title,
        department: j.department,
        location: j.location,
        type: j.type,
        applicants: j.applicants,
        posted: j.posted,
        status: j.status,
      })),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createJobPost = async (req: any, res: any) => {
  try {
    const companyId = req.companyId ? new mongoose.Types.ObjectId(req.companyId) : new mongoose.Types.ObjectId("000000000000000000000001");
    const { title, department, location, type } = req.body;

    if (!title || !location) {
      return res.status(400).json({ success: false, message: "Title and location are required" });
    }

    const count = await JobPost.countDocuments({ companyId });
    const jobId = `JOB${String(count + 1).padStart(3, "0")}`;
    const posted = new Date().toISOString().split("T")[0];

    const job = await JobPost.create({
      companyId,
      jobId,
      title,
      department: department || "Engineering",
      location,
      type: type || "Full-time",
      applicants: 0,
      posted,
      status: "Open",
    });

    return res.status(201).json({
      success: true,
      data: {
        id: job.jobId,
        _id: job._id,
        title: job.title,
        department: job.department,
        location: job.location,
        type: job.type,
        applicants: job.applicants,
        posted: job.posted,
        status: job.status,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

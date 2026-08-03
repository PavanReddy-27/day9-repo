import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Avatar,
} from "@mui/material";
import { WorkOutlined, Add } from "@mui/icons-material";

interface JobPost {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  applicants: number;
  posted: string;
  status: "Open" | "Closed" | "On Hold";
}

const initialJobs: JobPost[] = [
  { id: "JOB001", title: "Senior Software Engineer", department: "Engineering", location: "Hyderabad", type: "Full-time", applicants: 34, posted: "2026-07-28", status: "Open" },
  { id: "JOB002", title: "HR Business Partner", department: "Human Resources", location: "Mumbai", type: "Full-time", applicants: 18, posted: "2026-07-25", status: "Open" },
  { id: "JOB003", title: "Data Analyst", department: "Finance", location: "Bangalore", type: "Full-time", applicants: 42, posted: "2026-07-20", status: "Open" },
  { id: "JOB004", title: "Marketing Lead", department: "Marketing", location: "Chennai", type: "Full-time", applicants: 11, posted: "2026-07-18", status: "On Hold" },
  { id: "JOB005", title: "UX Designer", department: "Engineering", location: "Hyderabad", type: "Contract", applicants: 27, posted: "2026-07-15", status: "Open" },
  { id: "JOB006", title: "Operations Analyst", department: "Operations", location: "Delhi", type: "Full-time", applicants: 8, posted: "2026-07-10", status: "Closed" },
  { id: "JOB007", title: "Sales Executive", department: "Sales", location: "Mumbai", type: "Full-time", applicants: 53, posted: "2026-07-05", status: "Open" },
];

const statusColors: Record<string, { bg: string; color: string }> = {
  Open: { bg: "#16A34A22", color: "#16A34A" },
  Closed: { bg: "#DC262622", color: "#DC2626" },
  "On Hold": { bg: "#D9770622", color: "#D97706" },
};

const typeColors: Record<string, string> = {
  "Full-time": "#2563EB",
  "Part-time": "#7C3AED",
  Contract: "#D97706",
  Internship: "#0891B2",
};

const deptColors = ["#2563EB", "#7C3AED", "#DB2777", "#D97706", "#16A34A", "#0891B2", "#DC2626"];

const Recruitment = () => {
  const [jobs, setJobs] = useState<JobPost[]>(initialJobs);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", department: "Engineering", location: "", type: "Full-time" as JobPost["type"] });

  const handleAdd = () => {
    if (form.title.trim() && form.location.trim()) {
      setJobs([{
        id: `JOB${String(jobs.length + 1).padStart(3, "0")}`,
        title: form.title,
        department: form.department,
        location: form.location,
        type: form.type,
        applicants: 0,
        posted: new Date().toISOString().split("T")[0],
        status: "Open",
      }, ...jobs]);
      setForm({ title: "", department: "Engineering", location: "", type: "Full-time" });
      setOpen(false);
    }
  };

  const openCount = jobs.filter((j) => j.status === "Open").length;
  const totalApplicants = jobs.reduce((s, j) => s + j.applicants, 0);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "var(--bg)", minHeight: "100vh" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ color: "var(--text-h)", fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
            <WorkOutlined fontSize="large" sx={{ color: "var(--primary)" }} /> Recruitment & Open Positions
          </Typography>
          <Typography sx={{ color: "var(--text-light)", mt: 1 }}>
            Track hiring pipelines, applicants, and job requisitions across all departments.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)} sx={{ borderRadius: 2 }}>
          Post Job
        </Button>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 2, mb: 4 }}>
        {[
          { label: "Total Openings", value: jobs.length, color: "#2563EB" },
          { label: "Open Positions", value: openCount, color: "#16A34A" },
          { label: "Total Applicants", value: totalApplicants, color: "#7C3AED" },
          { label: "On Hold", value: jobs.filter((j) => j.status === "On Hold").length, color: "#D97706" },
        ].map((s) => (
          <Paper key={s.label} elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid var(--border)", bgcolor: "var(--surface)" }}>
            <Typography sx={{ color: "var(--text-light)", fontSize: 13, mb: 1 }}>{s.label}</Typography>
            <Typography sx={{ color: s.color, fontSize: 30, fontWeight: 800 }}>{s.value}</Typography>
          </Paper>
        ))}
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: "1px solid var(--border)", bgcolor: "var(--surface)" }}>
        <Table>
          <TableHead>
            <TableRow>
              {["Job Title", "Department", "Location", "Type", "Applicants", "Posted", "Status"].map((h) => (
                <TableCell key={h} sx={{ color: "var(--text-light)", fontWeight: 600, borderColor: "var(--border)" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((job, i) => (
              <TableRow key={job.id}>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: deptColors[i % deptColors.length] }}>{job.title[0]}</Avatar>
                    <Box>
                      <Typography sx={{ color: "var(--text-h)", fontWeight: 600, fontSize: 14 }}>{job.title}</Typography>
                      <Typography sx={{ color: "var(--text-light)", fontSize: 12 }}>{job.id}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ color: "var(--text-h)" }}>{job.department}</TableCell>
                <TableCell sx={{ color: "var(--text-light)" }}>{job.location}</TableCell>
                <TableCell>
                  <Chip label={job.type} size="small" sx={{ bgcolor: `${typeColors[job.type]}22`, color: typeColors[job.type], fontWeight: 600, fontSize: 11 }} />
                </TableCell>
                <TableCell sx={{ color: "var(--text-h)", fontWeight: 600 }}>{job.applicants}</TableCell>
                <TableCell sx={{ color: "var(--text-light)", fontSize: 13 }}>{job.posted}</TableCell>
                <TableCell>
                  <Chip label={job.status} size="small" sx={{ bgcolor: statusColors[job.status].bg, color: statusColors[job.status].color, fontWeight: 600 }} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: "var(--surface)", color: "var(--text-h)" }}>Post New Job Opening</DialogTitle>
        <DialogContent sx={{ bgcolor: "var(--surface)", display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
          <TextField label="Job Title" fullWidth value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <TextField select label="Department" fullWidth value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
            {["Engineering", "Human Resources", "Finance", "Marketing", "Sales", "Operations"].map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </TextField>
          <TextField label="Location" fullWidth value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <TextField select label="Job Type" fullWidth value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as JobPost["type"] })}>
            {["Full-time", "Part-time", "Contract", "Internship"].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ bgcolor: "var(--surface)", p: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: "var(--text-light)" }}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Post Job</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Recruitment;
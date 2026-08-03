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
  Button,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";
import { Business, Add, People } from "@mui/icons-material";

const initialDepartments = [
  { id: 1, name: "Engineering", head: "Alice Johnson", location: "New York", employees: 42, budget: "$1.2M", status: "Active" },
  { id: 2, name: "Human Resources", head: "David Miller", location: "Chicago", employees: 18, budget: "$680K", status: "Active" },
  { id: 3, name: "Finance", head: "Sarah Connor", location: "Boston", employees: 24, budget: "$940K", status: "Active" },
  { id: 4, name: "Marketing", head: "Tom Bradley", location: "Austin", employees: 30, budget: "$750K", status: "Active" },
  { id: 5, name: "Operations", head: "Robert King", location: "Austin", employees: 38, budget: "$1.1M", status: "Active" },
  { id: 6, name: "Product", head: "Maria Garcia", location: "San Francisco", employees: 22, budget: "$890K", status: "Active" },
  { id: 7, name: "Legal", head: "James Wilson", location: "New York", employees: 10, budget: "$520K", status: "Active" },
];

const locations = ["New York", "Chicago", "Boston", "Austin", "San Francisco", "Remote"];
const avatarColors = ["#2563EB", "#7C3AED", "#DB2777", "#D97706", "#16A34A", "#0891B2", "#DC2626"];

const Departments = () => {
  const [departments, setDepartments] = useState(initialDepartments);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", head: "", location: "New York", budget: "" });

  const handleAdd = () => {
    if (form.name.trim() && form.head.trim()) {
      setDepartments([
        ...departments,
        {
          id: Date.now(),
          name: form.name,
          head: form.head,
          location: form.location,
          employees: 0,
          budget: form.budget || "$0",
          status: "Active",
        },
      ]);
      setForm({ name: "", head: "", location: "New York", budget: "" });
      setOpen(false);
    }
  };

  const totalEmployees = departments.reduce((sum, d) => sum + d.employees, 0);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "var(--bg)", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ color: "var(--text-h)", fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
            <Business fontSize="large" sx={{ color: "var(--primary)" }} /> Department Management
          </Typography>
          <Typography sx={{ color: "var(--text-light)", mt: 1 }}>
            Manage departments, headcounts, and reporting structure across the organization.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)} sx={{ borderRadius: 2 }}>
          Add Department
        </Button>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 2, mb: 4 }}>
        {[
          { label: "Total Departments", value: departments.length, color: "#2563EB" },
          { label: "Total Employees", value: totalEmployees, color: "#16A34A" },
          { label: "Active Depts", value: departments.filter((d) => d.status === "Active").length, color: "#7C3AED" },
          { label: "Locations", value: new Set(departments.map((d) => d.location)).size, color: "#D97706" },
        ].map((card) => (
          <Paper key={card.label} elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid var(--border)", bgcolor: "var(--surface)" }}>
            <Typography sx={{ color: "var(--text-light)", fontSize: 13, mb: 1 }}>{card.label}</Typography>
            <Typography sx={{ color: card.color, fontSize: 30, fontWeight: 800 }}>{card.value}</Typography>
          </Paper>
        ))}
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: "1px solid var(--border)", bgcolor: "var(--surface)" }}>
        <Table>
          <TableHead>
            <TableRow>
              {["Department", "Department Head", "Location", "Employees", "Budget", "Status"].map((h) => (
                <TableCell key={h} sx={{ color: "var(--text-light)", fontWeight: 600, borderColor: "var(--border)" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {departments.map((dept, i) => (
              <TableRow key={dept.id} sx={{ "&:last-child td": { border: 0 }, borderColor: "var(--border)" }}>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: avatarColors[i % avatarColors.length], width: 34, height: 34, fontSize: 14 }}>
                      {dept.name[0]}
                    </Avatar>
                    <Typography sx={{ color: "var(--text-h)", fontWeight: 600 }}>{dept.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ color: "var(--text-h)" }}>{dept.head}</TableCell>
                <TableCell sx={{ color: "var(--text-light)" }}>{dept.location}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "var(--text-h)" }}>
                    <People fontSize="small" sx={{ color: "var(--text-light)" }} /> {dept.employees}
                  </Box>
                </TableCell>
                <TableCell sx={{ color: "var(--text-h)", fontWeight: 600 }}>{dept.budget}</TableCell>
                <TableCell>
                  <Chip label={dept.status} size="small" sx={{ bgcolor: "#16A34A22", color: "#16A34A", fontWeight: 600 }} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: "var(--surface)", color: "var(--text-h)" }}>Add Department</DialogTitle>
        <DialogContent sx={{ bgcolor: "var(--surface)", display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
          <TextField label="Department Name" fullWidth value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Department Head" fullWidth value={form.head} onChange={(e) => setForm({ ...form, head: e.target.value })} />
          <TextField select label="Location" fullWidth value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>
            {locations.map((loc) => <MenuItem key={loc} value={loc}>{loc}</MenuItem>)}
          </TextField>
          <TextField label="Budget (e.g. $500K)" fullWidth value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ bgcolor: "var(--surface)", p: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: "var(--text-light)" }}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Add Department</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Departments;
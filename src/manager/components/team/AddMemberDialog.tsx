import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
} from "@mui/material";
import { useState } from "react";
import type { TeamMember } from "../../data/teamData";

interface AddMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (member: TeamMember) => void;
}

const AddMemberDialog = ({ open, onClose, onAdd }: AddMemberDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    designation: "",
    department: "Engineering",
    email: "",
    phone: "",
    attendance: "Present",
    performance: "Good",
    risk: "Low",
  });

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = () => {
    // Generate mock avatar from initials
    const initials = formData.name.split(" ").map(n => n[0]).join("").toUpperCase();

    const newMember: TeamMember = {
      id: Math.floor(Math.random() * 10000), // Random ID
      ...formData,
      experience: 1, // Default mock value
      productivity: 80, // Default mock value
      avatar: initials || "U",
    } as TeamMember;

    onAdd(newMember);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Team Member</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={formData.name}
              onChange={handleChange("name")}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Employee ID"
              value={formData.employeeId}
              onChange={handleChange("employeeId")}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Designation"
              value={formData.designation}
              onChange={handleChange("designation")}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Department"
              value={formData.department}
              onChange={handleChange("department")}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange("email")}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.phone}
              onChange={handleChange("phone")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              select
              fullWidth
              label="Attendance"
              value={formData.attendance}
              onChange={handleChange("attendance")}
            >
              <MenuItem value="Present">Present</MenuItem>
              <MenuItem value="Absent">Absent</MenuItem>
              <MenuItem value="Leave">Leave</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              select
              fullWidth
              label="Performance"
              value={formData.performance}
              onChange={handleChange("performance")}
            >
              <MenuItem value="Excellent">Excellent</MenuItem>
              <MenuItem value="Good">Good</MenuItem>
              <MenuItem value="Average">Average</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              select
              fullWidth
              label="Risk Level"
              value={formData.risk}
              onChange={handleChange("risk")}
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Add Member
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMemberDialog;

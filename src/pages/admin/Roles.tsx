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
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { Security, Add } from "@mui/icons-material";

const initialRoles = [
  {
    id: "1",
    name: "Admin",
    users: 4,
    permissions: { view: true, create: true, update: true, delete: true },
  },
  {
    id: "2",
    name: "HR",
    users: 12,
    permissions: { view: true, create: true, update: true, delete: false },
  },
  {
    id: "3",
    name: "Manager",
    users: 28,
    permissions: { view: true, create: false, update: true, delete: false },
  },
];

const Roles = () => {
  const [roles, setRoles] = useState(initialRoles);
  const [open, setOpen] = useState(false);
  const [newRole, setNewRole] = useState("");

  const handleToggle = (id: string, perm: string) => {
    setRoles((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              permissions: { ...r.permissions, [perm]: !r.permissions[perm as keyof typeof r.permissions] },
            }
          : r
      )
    );
  };

  const handleAddRole = () => {
    if (newRole.trim()) {
      setRoles([
        ...roles,
        {
          id: Date.now().toString(),
          name: newRole,
          users: 0,
          permissions: { view: true, create: false, update: false, delete: false },
        },
      ]);
      setNewRole("");
      setOpen(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "var(--bg)", minHeight: "100vh" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ color: "var(--text-h)", fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
            <Security fontSize="large" sx={{ color: "var(--primary)" }} /> Role Management
          </Typography>
          <Typography sx={{ color: "var(--text-light)", mt: 1 }}>
            Set access levels and control permissions for every team role.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)} sx={{ borderRadius: 2 }}>
          New Role
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: "1px solid var(--border)", bgcolor: "var(--surface)" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "var(--text-light)", fontWeight: 600 }}>Role Name</TableCell>
              <TableCell sx={{ color: "var(--text-light)", fontWeight: 600 }}>Users Assigned</TableCell>
              <TableCell align="center" sx={{ color: "var(--text-light)", fontWeight: 600 }}>View</TableCell>
              <TableCell align="center" sx={{ color: "var(--text-light)", fontWeight: 600 }}>Create</TableCell>
              <TableCell align="center" sx={{ color: "var(--text-light)", fontWeight: 600 }}>Update</TableCell>
              <TableCell align="center" sx={{ color: "var(--text-light)", fontWeight: 600 }}>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                <TableCell>
                  <Typography sx={{ color: "var(--text-h)", fontWeight: 600 }}>{role.name}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={`${role.users} Users`} size="small" sx={{ bgcolor: "var(--hover)", color: "var(--text-h)", fontWeight: 500 }} />
                </TableCell>
                <TableCell align="center">
                  <Switch checked={role.permissions.view} onChange={() => handleToggle(role.id, "view")} color="primary" />
                </TableCell>
                <TableCell align="center">
                  <Switch checked={role.permissions.create} onChange={() => handleToggle(role.id, "create")} color="primary" />
                </TableCell>
                <TableCell align="center">
                  <Switch checked={role.permissions.update} onChange={() => handleToggle(role.id, "update")} color="primary" />
                </TableCell>
                <TableCell align="center">
                  <Switch checked={role.permissions.delete} onChange={() => handleToggle(role.id, "delete")} color="error" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle sx={{ bgcolor: "var(--surface)", color: "var(--text-h)" }}>Create New Role</DialogTitle>
        <DialogContent sx={{ bgcolor: "var(--surface)", minWidth: 400 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Role Name"
            fullWidth
            variant="outlined"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ bgcolor: "var(--surface)", p: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: "var(--text-light)" }}>Cancel</Button>
          <Button onClick={handleAddRole} variant="contained">Create Role</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Roles;
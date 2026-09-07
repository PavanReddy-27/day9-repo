import { Box, Typography, CircularProgress, Alert, Button } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import TeamToolbar from "../components/team/TeamToolbar";
import TeamTable from "../components/team/TeamTable";
import TeamMemberDrawer from "../components/team/TeamMemberDrawer";
import AddMemberDialog from "../components/team/AddMemberDialog";

import type { TeamMember } from "../types/team";
import { apiClient } from "../../services/apiClient";

import "./Team.css";

const Team = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [attendance, setAttendance] = useState("");
  const [risk, setRisk] = useState("");
  const [selected, setSelected] = useState<TeamMember | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const fetchTeamMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Backend automatically applies role-based data scoping for managers:
      // only employees in the manager's assigned department/team are returned.
      const data = await apiClient<any[]>("/employees?limit=200");
      const mapped: TeamMember[] = (Array.isArray(data) ? data : []).map((emp: any) => {
        const initials = (emp.fullName || emp.name || "U")
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase();

        const attStatus: "Present" | "Absent" | "Leave" =
          emp.employmentStatus === "Active" ? "Present" :
          emp.employmentStatus === "On Leave" ? "Leave" : "Absent";

        return {
          id: emp._id || emp.employeeId,
          employeeId: emp.employeeId,
          name: emp.fullName || emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim(),
          designation: emp.designation || emp.role || "Team Member",
          department: emp.departmentName || (typeof emp.departmentId === "object" ? emp.departmentId?.name : emp.department) || "General",
          email: emp.email || "",
          phone: emp.phone || "+91 9876543210",
          attendance: attStatus,
          performance: emp.performance || (emp.performanceScore >= 85 ? "Excellent" : emp.performanceScore >= 70 ? "Good" : "Average"),
          risk: emp.riskLevel || "Low",
          experience: emp.experience || 3,
          productivity: emp.productivity ?? Math.round(emp.performanceScore || 80),
          avatar: emp.avatar || initials,
        };
      });
      setTeamMembers(mapped);
    } catch (err: any) {
      console.error("Failed to fetch team members:", err);
      setError(err?.message || "Failed to load team data from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const rows = useMemo(() => {
    return teamMembers.filter((member) => {
      const matchesSearch =
        ((member.name?.toLowerCase() || "").includes(search.toLowerCase())) ||
        ((member.employeeId?.toLowerCase() || "").includes(search.toLowerCase()));

      const matchesAttendance =
        !attendance || member.attendance === attendance;

      const matchesRisk =
        !risk || member.risk === risk;

      return (
        matchesSearch &&
        matchesAttendance &&
        matchesRisk
      );
    });
  }, [search, attendance, risk, teamMembers]);

  const handleAddMember = (member: TeamMember) => {
    setTeamMembers((prev) => [member, ...prev]);
  };

  return (
    <Box className="team-page">
      <Typography
        variant="h4"
        className="team-page-title"
      >
        My Team
      </Typography>

      <TeamToolbar
        search={search}
        onSearchChange={setSearch}
        attendance={attendance}
        onAttendanceChange={setAttendance}
        risk={risk}
        onRiskChange={setRisk}
        onAddMemberClick={() => setIsAddDialogOpen(true)}
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ py: 4 }}>
          <Alert severity="error" action={
            <Button color="inherit" size="small" onClick={fetchTeamMembers}>
              Retry
            </Button>
          }>
            {error}
          </Alert>
        </Box>
      ) : rows.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6, color: "var(--text-light)" }}>
          <Typography variant="h6">No team members found</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {teamMembers.length === 0 ? "No team members assigned to your department." : "No members match the selected filters."}
          </Typography>
        </Box>
      ) : (
        <TeamTable
          rows={rows}
          onView={setSelected}
        />
      )}

      <TeamMemberDrawer
        open={Boolean(selected)}
        member={selected}
        onClose={() => setSelected(null)}
      />

      <AddMemberDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddMember}
      />
    </Box>
  );
};

export default Team;

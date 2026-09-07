import { useState, useEffect, useMemo } from "react";
import { Box, Typography, Button } from "@mui/material";
import { Download } from "@mui/icons-material";

import TeamToolbar from "../components/team/TeamToolbar";
import TeamTable from "../components/team/TeamTable";
import TeamMemberDrawer from "../components/team/TeamMemberDrawer";
import AddMemberDialog from "../components/team/AddMemberDialog";
import PageState from "../../components/PageState";
import type { TeamMember } from "../types/team";
import { apiClient } from "../../services/apiClient";
import { useAppSelector } from "../../redux/hooks";

import "./Team.css";

const Team = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

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
    let data = [...teamMembers];
    if (user && user.role === "Manager" && user.department && user.department !== "General") {
      data = data.filter((m) => m.department === user.department);
    }

    return data.filter((member) => {
      const matchesSearch =
        ((member.name?.toLowerCase() || "").includes(search.toLowerCase())) ||
        ((member.employeeId?.toLowerCase() || "").includes(search.toLowerCase()));

      const matchesAttendance = !attendance || member.attendance === attendance;
      const matchesRisk = !risk || member.risk === risk;

      return matchesSearch && matchesAttendance && matchesRisk;
    });
  }, [teamMembers, search, attendance, risk, user]);

  const handleAddMember = (member: TeamMember) => {
    setTeamMembers((prev) => [member, ...prev]);
  };

  const handleExportCSV = () => {
    const csvContent = [
      ["Employee ID", "Name", "Role", "Department", "Attendance", "Risk", "Productivity %"],
      ...rows.map((r) => [r.employeeId, r.name, r.designation, r.department, r.attendance, r.risk, `${r.productivity}%`]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `my_team_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box className="team-page">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4" className="team-page-title">
          My Team
        </Typography>
        <Button variant="outlined" startIcon={<Download />} onClick={handleExportCSV} sx={{ borderRadius: 2 }}>
          Export CSV
        </Button>
      </Box>

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
        <PageState type="loading" message="Loading team members..." />
      ) : error ? (
        <PageState type="error" message={error} onRetry={fetchTeamMembers} />
      ) : rows.length === 0 ? (
        <PageState type="empty" message="No team members match the selected filters." />
      ) : (
        <TeamTable rows={rows} onView={setSelected} />
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

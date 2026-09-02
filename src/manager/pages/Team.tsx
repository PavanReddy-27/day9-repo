import { useState, useEffect, useMemo } from "react";
import { Box, Typography, Button } from "@mui/material";
import { Download } from "@mui/icons-material";

import TeamToolbar from "../components/team/TeamToolbar";
import TeamTable from "../components/team/TeamTable";
import TeamMemberDrawer from "../components/team/TeamMemberDrawer";
import AddMemberDialog from "../components/team/AddMemberDialog";
import PageState from "../../components/PageState";
import type { TeamMember } from "../data/teamData";
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

  useEffect(() => {
    let isMounted = true;

    const fetchTeamMembers = async () => {
      try {
        const data = await apiClient("/employees").catch(() => []);
        if (!isMounted) return;

        const mapped: TeamMember[] = (Array.isArray(data) ? data : []).map((emp: any, idx: number) => ({
          id: emp.employeeId || emp._id,
          employeeId: emp.employeeId || emp._id,
          name: emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Team Member',
          designation: emp.designation || 'Staff',
          department: emp.departmentName || emp.department || 'Engineering',
          location: emp.locationCode || emp.location || 'HQ',
          attendance: (["Present", "Late", "Absent", "On Leave"] as const)[idx % 4],
          risk: emp.riskLevel || (["Low", "Medium", "High"] as const)[idx % 3],
          performance: (["Excellent", "Good", "Average", "Needs Improvement"] as const)[idx % 4],
          productivity: 70 + (idx * 7) % 30,
          avatar: emp.avatar || `https://i.pravatar.cc/150?u=${emp._id}`,
          email: emp.email,
          phone: emp.phone || "+1 (555) 000-0000",
        }));

        setTeamMembers(mapped);
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to load team data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTeamMembers();
    return () => {
      isMounted = false;
    };
  }, []);

  const rows = useMemo(() => {
    let data = [...teamMembers];
    if (user && user.role === "Manager" && user.department) {
      data = data.filter((m) => m.department === user.department || user.department === "General");
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
      ["Employee ID", "Name", "Role", "Department", "Location", "Attendance", "Risk", "Productivity %"],
      ...rows.map((r) => [r.employeeId, r.name, r.designation, r.department, r.location || "", r.attendance, r.risk, `${r.productivity}%`]),
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
        <PageState type="error" message={error} onRetry={() => window.location.reload()} />
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

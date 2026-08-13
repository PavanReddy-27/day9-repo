import { Box, Typography } from "@mui/material";
import { useMemo, useState, useEffect } from "react";
import { useDispatch } from "react-redux";

import TeamToolbar from "../components/team/TeamToolbar";
import TeamTable from "../components/team/TeamTable";
import TeamMemberDrawer from "../components/team/TeamMemberDrawer";

import { useAppSelector } from "../../redux/hooks";
import { fetchEmployees, selectRestrictedDashboardEmployees } from "../../redux/dashboardSlice";
import type { AppDispatch } from "../../redux/store";
import type { TeamMember } from "../data/teamData";

import "./Team.css";

const Team = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAppSelector((state) => state.auth);
  const rawEmployees = useAppSelector(selectRestrictedDashboardEmployees);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  const [search, setSearch] = useState("");
  const [attendance, setAttendance] = useState("");
  const [risk, setRisk] = useState("");
  const [selected, setSelected] = useState<TeamMember | null>(null);

  const teamData: TeamMember[] = useMemo(() => {
    return rawEmployees.map((emp, i) => {
      const e = emp as Record<string, any>;
      const deptName =
        e.departmentName ||
        (e.departmentId && typeof e.departmentId === "object" ? e.departmentId.name : undefined) ||
        (typeof e.department === "object" ? e.department?.name : e.department) ||
        "Unknown";
      const name = e.fullName || e.name || "Unknown";
      return {
        id: i + 1,
        employeeId: e.employeeId,
        name,
        designation: e.designation || e.role,
        department: deptName,
        email: e.email,
        phone: e.phone || "—",
        attendance: e.attendance || "Present",
        performance: e.performance || "Good",
        risk: e.riskLevel || e.risk || "Low",
        experience: e.experience || 0,
        productivity: e.productivity ?? 0,
        avatar: name[0].toUpperCase(),
      };
    });
  }, [rawEmployees]);

  const rows = useMemo(() => {
    let restrictedData = teamData;
    if (user && user.role === "Manager") {
      // Fallback for cached "Operations" sessions in the mock environment
      const targetDept = user.department === "Operations" ? "Engineering" : user.department;
      restrictedData = teamData.filter(member => member.department === targetDept);
    }
    
    return restrictedData.filter((member) => {
      const matchesSearch =
        member.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        member.employeeId
          .toLowerCase()
          .includes(search.toLowerCase());

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
  }, [search, attendance, risk, user, teamData]);

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
      />

      <TeamTable
        rows={rows}
        onView={setSelected}
      />

      <TeamMemberDrawer
        open={Boolean(selected)}
        member={selected}
        onClose={() => setSelected(null)}
      />
    </Box>
  );
};

export default Team;


import { Box, Typography } from "@mui/material";
import { useMemo, useState } from "react";

import TeamToolbar from "../components/team/TeamToolbar";
import TeamTable from "../components/team/TeamTable";
import TeamMemberDrawer from "../components/team/TeamMemberDrawer";

import { teamData } from "../data/teamData";
import type { TeamMember } from "../data/teamData";

import "./Team.css";

const Team = () => {
  const [search, setSearch] = useState("");
  const [attendance, setAttendance] = useState("");
  const [risk, setRisk] = useState("");
  const [selected, setSelected] = useState<TeamMember | null>(null);

  const rows = useMemo(() => {
    return teamData.filter((member) => {
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
  }, [search, attendance, risk]);

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


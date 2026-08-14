import { Box, Typography } from "@mui/material";
import { useMemo, useState } from "react";

import TeamToolbar from "../components/team/TeamToolbar";
import TeamTable from "../components/team/TeamTable";
import TeamMemberDrawer from "../components/team/TeamMemberDrawer";
import AddMemberDialog from "../components/team/AddMemberDialog";

import { teamData } from "../data/teamData";
import type { TeamMember } from "../data/teamData";
import { useAppSelector } from "../../redux/hooks";

import "./Team.css";

const Team = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [search, setSearch] = useState("");
  const [attendance, setAttendance] = useState("");
  const [risk, setRisk] = useState("");
  const [selected, setSelected] = useState<TeamMember | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [additionalMembers, setAdditionalMembers] = useState<TeamMember[]>([]);

  const rows = useMemo(() => {
    let restrictedData = [...teamData, ...additionalMembers];
    if (user && user.role === "Manager") {
      // Fallback for cached "Operations" sessions in the mock environment
      const targetDept = user.department === "Operations" ? "Engineering" : user.department;
      restrictedData = restrictedData.filter(member => member.department === targetDept);
    }
    
    return restrictedData.filter((member) => {
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
  }, [search, attendance, risk, user, additionalMembers]);

  const handleAddMember = (member: TeamMember) => {
    setAdditionalMembers((prev) => [...prev, member]);
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

      <TeamTable
        rows={rows}
        onView={setSelected}
      />

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


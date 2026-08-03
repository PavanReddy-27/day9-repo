import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import type { TeamMember } from "../../data/teamData";

import "./TeamMemberDrawer.css";

interface Props {
  open: boolean;
  member: TeamMember | null;
  onClose: () => void;
}

const TeamMemberDrawer = ({
  open,
  member,
  onClose,
}: Props) => {
  if (!member) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
    >
      <Box className="member-drawer">
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: 700 }}
          >
            Employee Profile
          </Typography>

          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Stack
          spacing={2}
          className="member-profile"
          sx={{ alignItems: "center" }}
        >
          <Avatar className="member-avatar">
            {member.avatar}
          </Avatar>

          <Typography
            variant="h6"
            sx={{ fontWeight: 700 }}
          >
            {member.name}
          </Typography>

          <Typography color="text.secondary">
            {member.designation}
          </Typography>

          <Chip
            label={member.department}
            color="primary"
          />
        </Stack>

        <Divider className="member-divider" />

        <Stack spacing={2}>
          <Info
            label="Employee ID"
            value={member.employeeId}
          />

          <Info
            label="Email"
            value={member.email}
          />

          <Info
            label="Phone"
            value={member.phone}
          />

          <Info
            label="Experience"
            value={`${member.experience} Years`}
          />

          <Info
            label="Attendance"
            value={member.attendance}
          />

          <Info
            label="Performance"
            value={member.performance}
          />

          <Info
            label="Risk Level"
            value={member.risk}
          />

          <Info
            label="Productivity"
            value={`${member.productivity}%`}
          />
        </Stack>

        <Divider className="member-divider" />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          className="member-actions"
        >
          <Button
            variant="contained"
            fullWidth
          >
            Recommend
          </Button>

          <Button
            variant="outlined"
            fullWidth
          >
            Add Comment
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

interface InfoProps {
  label: string;
  value: string;
}

const Info = ({
  label,
  value,
}: InfoProps) => (
  <Stack
    direction="row"
    className="member-info"
    sx={{
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <Typography
      variant="body2"
      color="text.secondary"
    >
      {label}
    </Typography>

    <Typography
      variant="body2"
      sx={{ fontWeight: 600 }}
    >
      {value}
    </Typography>
  </Stack>
);

export default TeamMemberDrawer;
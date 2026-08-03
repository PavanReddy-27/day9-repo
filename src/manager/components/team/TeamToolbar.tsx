import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";

import {
  Search,
  Download,
  FilterList,
  PersonAdd,
} from "@mui/icons-material";

import "./TeamToolbar.css";

interface TeamToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;

  attendance: string;
  onAttendanceChange: (value: string) => void;

  risk: string;
  onRiskChange: (value: string) => void;
}

const TeamToolbar = ({
  search,
  onSearchChange,
  attendance,
  onAttendanceChange,
  risk,
  onRiskChange,
}: TeamToolbarProps) => {
  return (
    <Box className="team-toolbar">
      <Stack
        className="team-toolbar-stack"
        direction={{ xs: "column", lg: "row" }}
        spacing={2}
      >
        <TextField
          fullWidth
          placeholder="Search by employee name or ID..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="team-search"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            },
          }}
        />

        <FormControl className="team-select">
          <Select
            value={attendance}
            displayEmpty
            onChange={(e) =>
              onAttendanceChange(e.target.value)
            }
          >
            <MenuItem value="">All Attendance</MenuItem>
            <MenuItem value="Present">Present</MenuItem>
            <MenuItem value="Absent">Absent</MenuItem>
            <MenuItem value="Leave">Leave</MenuItem>
          </Select>
        </FormControl>

        <FormControl className="team-select">
          <Select
            value={risk}
            displayEmpty
            onChange={(e) =>
              onRiskChange(e.target.value)
            }
          >
            <MenuItem value="">All Risk Levels</MenuItem>
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="High">High</MenuItem>
          </Select>
        </FormControl>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          className="toolbar-buttons"
        >
          <Button
            variant="outlined"
            startIcon={<FilterList />}
          >
            More Filters
          </Button>

          <Button
            variant="outlined"
            startIcon={<Download />}
          >
            Export
          </Button>

          <Button
            variant="contained"
            startIcon={<PersonAdd />}
          >
            Add Member
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default TeamToolbar;
// import {
//   Avatar,
//   Chip,
//   IconButton,
//   Paper,
//   Tooltip,
// } from "@mui/material";

// import { DataGrid } from "@mui/x-data-grid";
// import type {
//   GridColDef,
//   GridRenderCellParams,
// } from "@mui/x-data-grid";

// import VisibilityIcon from "@mui/icons-material/Visibility";
// import EmailIcon from "@mui/icons-material/Email";

// import type { TeamMember } from "../../data/teamData";

// import "./TeamTable.css";

// interface Props {
//   rows: TeamMember[];
//   onView?: (member: TeamMember) => void;
// }

// const TeamTable = ({ rows, onView }: Props) => {
//   const columns: GridColDef[] = [
//     {
//       field: "employee",
//       headerName: "Employee",
//       flex: 1.5,
//       sortable: false,

//       renderCell: (params: GridRenderCellParams) => (
//         <div className="employee-cell">
//           <Avatar className="employee-avatar">
//             {params.row.avatar}
//           </Avatar>

//           <div>
//             <div className="employee-name">
//               {params.row.name}
//             </div>

//             <div className="employee-role">
//               {params.row.designation}
//             </div>
//           </div>
//         </div>
//       ),
//     },

//     {
//       field: "employeeId",
//       headerName: "Employee ID",
//       width: 120,
//     },

//     {
//       field: "department",
//       headerName: "Department",
//       width: 150,
//     },

//     {
//       field: "attendance",
//       headerName: "Attendance",
//       width: 140,

//       renderCell: (params: GridRenderCellParams) => (
//         <Chip
//           size="small"
//           label={String(params.value)}
//           color={
//             params.value === "Present"
//               ? "success"
//               : params.value === "Leave"
//               ? "warning"
//               : "error"
//           }
//         />
//       ),
//     },

//     {
//       field: "performance",
//       headerName: "Performance",
//       width: 140,
//     },

//     {
//       field: "risk",
//       headerName: "Risk Level",
//       width: 120,
//     },

//     {
//       field: "productivity",
//       headerName: "Productivity",
//       width: 130,
//       valueFormatter: (value) => `${value}%`,
//     },

//     {
//       field: "actions",
//       headerName: "Actions",
//       width: 120,
//       sortable: false,
//       filterable: false,

//       renderCell: (params: GridRenderCellParams) => (
//         <>
//           <Tooltip title="View Profile">
//             <IconButton
//               color="primary"
//               onClick={() => onView?.(params.row)}
//             >
//               <VisibilityIcon fontSize="small" />
//             </IconButton>
//           </Tooltip>

//           <Tooltip title="Send Email">
//             <IconButton color="secondary">
//               <EmailIcon fontSize="small" />
//             </IconButton>
//           </Tooltip>
//         </>
//       ),
//     },
//   ];

//   return (
//     <Paper className="team-table-paper" elevation={2}>
//       <DataGrid
//         rows={rows}
//         columns={columns}
//         autoHeight
//         disableRowSelectionOnClick
//         pageSizeOptions={[5, 10, 20]}
//         initialState={{
//           pagination: {
//             paginationModel: {
//               pageSize: 10,
//               page: 0,
//             },
//           },
//         }}
//         className="team-data-grid"
//       />
//     </Paper>
//   );
// };

// export default TeamTable;

import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";
import type {
  GridColDef,
  GridRenderCellParams,
} from "@mui/x-data-grid";

import VisibilityIcon from "@mui/icons-material/Visibility";
import EmailIcon from "@mui/icons-material/Email";

import type { TeamMember } from "../../data/teamData";

import "./TeamTable.css";

interface Props {
  rows: TeamMember[];
  onView?: (member: TeamMember) => void;
}

const TeamTable = ({ rows, onView }: Props) => {
  const columns: GridColDef[] = [
    {
      field: "employee",
      headerName: "Employee",
      flex: 1.6,
      minWidth: 250,
      sortable: false,

      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            width: "100%",
            height: "100%",
          }}
        >
          <Avatar
            sx={{
              width: 42,
              height: 42,
              bgcolor: "var(--primary)",
              fontWeight: 700,
            }}
          >
            {params.row.avatar}
          </Avatar>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {params.row.name}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {params.row.designation}
            </Typography>
          </Box>
        </Box>
      ),
    },

    {
      field: "employeeId",
      headerName: "Employee ID",
      width: 130,
    },

    {
      field: "department",
      headerName: "Department",
      width: 160,
    },

    {
      field: "attendance",
      headerName: "Attendance",
      width: 140,

      renderCell: (params: GridRenderCellParams) => (
        <Chip
          size="small"
          label={String(params.value)}
          color={
            params.value === "Present"
              ? "success"
              : params.value === "Leave"
              ? "warning"
              : "error"
          }
        />
      ),
    },

    {
      field: "performance",
      headerName: "Performance",
      width: 150,
    },

    {
      field: "risk",
      headerName: "Risk Level",
      width: 130,
    },

    {
      field: "productivity",
      headerName: "Productivity",
      width: 130,
      valueFormatter: (value) => `${value}%`,
    },

    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,

      renderCell: (params: GridRenderCellParams) => (
        <>
          <Tooltip title="View Profile">
            <IconButton
              color="primary"
              onClick={() => onView?.(params.row)}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Send Email">
            <IconButton color="secondary">
              <EmailIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <Paper className="team-table-paper" elevation={2}>
      <DataGrid
        rows={rows}
        columns={columns}
        autoHeight
        disableRowSelectionOnClick
        rowHeight={72}
        pageSizeOptions={[5, 10, 20]}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
              page: 0,
            },
          },
        }}
        className="team-data-grid"
      />
    </Paper>
  );
};

export default TeamTable;
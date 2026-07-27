// src/features/kpi/components/DrillDownEmployeeTable/DrillDownEmployeeTable.tsx
// PART 1

import { useMemo, useState } from "react";

import {
  Box,
  Paper,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  TableSortLabel,
  Chip,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

import type { Employee } from "../../../../types/employee";

import { exportEmployeesToCSV } from "../../../../utils/csvExport";

import "./DrillDownEmployeeTable.css";

export interface DrillDownEmployeeTableProps {
  employees: Employee[];

  loading?: boolean;

  title?: string;
}

type Order = "asc" | "desc";

type OrderBy =
  | "employeeId"
  | "fullName"
  | "department"
  | "role"
  | "location"
  | "status"
  | "risk";

const DrillDownEmployeeTable = ({
  employees,
  loading = false,
  title = "Employees",
}: DrillDownEmployeeTableProps) => {
  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(0);

  const [rowsPerPage, setRowsPerPage] =
    useState(10);

  const [order, setOrder] =
    useState<Order>("asc");

  const [orderBy, setOrderBy] =
    useState<OrderBy>("fullName");

  const filteredEmployees =
    useMemo(() => {
      const keyword =
        search.toLowerCase();

      return employees.filter(
        (employee) => {
          if (!keyword) {
            return true;
          }

          return (
            employee.fullName
              .toLowerCase()
              .includes(keyword) ||
            employee.employeeId
              .toLowerCase()
              .includes(keyword) ||
            employee.department
              .toLowerCase()
              .includes(keyword) ||
            employee.role
              .toLowerCase()
              .includes(keyword) ||
            employee.location
              .toLowerCase()
              .includes(keyword)
          );
        }
      );
    }, [employees, search]);

  const sortedEmployees =
    useMemo(() => {
      return [...filteredEmployees].sort(
        (a, b) => {
          const left =
            a[orderBy];

          const right =
            b[orderBy];

          if (left < right) {
            return order === "asc"
              ? -1
              : 1;
          }

          if (left > right) {
            return order === "asc"
              ? 1
              : -1;
          }

          return 0;
        }
      );
    }, [
      filteredEmployees,
      order,
      orderBy,
    ]);

  const paginatedEmployees =
    useMemo(() => {
      const start =
        page * rowsPerPage;

      return sortedEmployees.slice(
        start,
        start + rowsPerPage
      );
    }, [
      sortedEmployees,
      page,
      rowsPerPage,
    ]);

  const handleSort = (
    property: OrderBy
  ) => {
    const isAsc =
      orderBy === property &&
      order === "asc";

    setOrder(
      isAsc ? "desc" : "asc"
    );

    setOrderBy(property);
  };

  const handleExport = () => {
    exportEmployeesToCSV(
      sortedEmployees,
      "drilldown-employees.csv"
    );
  };

  const handleRefresh = () => {
    setSearch("");
    setPage(0);
  };
    return (
    <Paper className="drilldown-employee-table">
      {/* Header */}

      <Box className="drilldown-employee-table__header">
        <Typography variant="h6">
          {title}
        </Typography>

        <Stack
          direction="row"
          spacing={2}
          sx={{
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <TextField
            size="small"
            placeholder="Search employees..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              minWidth: 260,
            }}
          />

          <Tooltip title="Refresh">
            <IconButton
              onClick={handleRefresh}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Export CSV">
            <IconButton
              onClick={handleExport}
            >
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>

          <Chip
            color="primary"
            label={`${filteredEmployees.length} Employees`}
          />
        </Stack>
      </Box>

      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {[
                {
                  id: "employeeId",
                  label: "Employee ID",
                },
                {
                  id: "fullName",
                  label: "Employee",
                },
                {
                  id: "department",
                  label: "Department",
                },
                {
                  id: "role",
                  label: "Role",
                },
                {
                  id: "location",
                  label: "Location",
                },
                {
                  id: "status",
                  label: "Status",
                },
                {
                  id: "risk",
                  label: "Risk",
                },
              ].map((column) => (
                <TableCell
                  key={column.id}
                >
                  <TableSortLabel
                    active={
                      orderBy ===
                      column.id
                    }
                    direction={order}
                    onClick={() =>
                      handleSort(
                        column.id as OrderBy
                      )
                    }
                  >
                    {column.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  align="center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedEmployees.length ===
              0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  align="center"
                >
                  No employees found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedEmployees.map(
                (employee) => (
                  <TableRow
                    hover
                    key={employee.id}
                  >
                    <TableCell>
                      {
                        employee.employeeId
                      }
                    </TableCell>

                    <TableCell>
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 600,
                          }}
                        >
                          {
                            employee.fullName
                          }
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            fontWeight: 400,
                          }}
                        >
                          {
                            employee.email
                          }
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      {
                        employee.department
                      }
                    </TableCell>

                    <TableCell>
                      {employee.role}
                    </TableCell>

                    <TableCell>
                      {
                        employee.location
                      }
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={
                          employee.status
                        }
                        color={
                          employee.status ===
                          "Active"
                            ? "success"
                            : "default"
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={
                          employee.risk
                        }
                        color={
                          employee.risk ===
                          "High"
                            ? "error"
                            : employee.risk ===
                                "Medium"
                              ? "warning"
                              : "success"
                        }
                      />
                    </TableCell>
                  </TableRow>
                )
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        page={page}
        count={
          filteredEmployees.length
        }
        rowsPerPage={rowsPerPage}
        onPageChange={(
          _,
          newPage
        ) => setPage(newPage)}
        rowsPerPageOptions={[
          10,
          25,
          50,
          100,
        ]}
        onRowsPerPageChange={(
          event
        ) => {
          setRowsPerPage(
            Number(
              event.target.value
            )
          );

          setPage(0);
        }}
      />
    </Paper>
  );
};

export default DrillDownEmployeeTable;
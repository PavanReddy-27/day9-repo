// src/features/dashboard/components/DashboardAnalytics/DashboardAnalytics.tsx
// PART 1 (Day 8 Update — FIXED)
//
// Changes from the previous version:
// 1. KPI card "trend" values are no longer hardcoded literals. Where the
//    dashboard has real month-over-month data (via trendData), trend is
//    computed with the existing calculateGrowth() utility. Where no
//    historical series exists for a metric (training, skill coverage,
//    high-risk headcount), trend is explicitly 0 (neutral) instead of a
//    fabricated number, so the UI never implies a change that wasn't
//    actually measured.
// 2. Training Completion and Skill Coverage KPI card values now read from
//    dashboardSummary.averageTraining / dashboardSummary.averageSkillCoverage
//    (already computed from real employee data) instead of the static
//    "92%" / "88%" strings, so they can never drift from the numbers shown
//    in the drill-down panel underneath them.

import { useMemo, useState } from "react";

import {
  Box,
  Grid,
  Stack,
  Divider,
  Typography,
  Chip,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";

import RefreshIcon from "@mui/icons-material/Refresh";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import UndoIcon from "@mui/icons-material/Undo";
import SaveIcon from "@mui/icons-material/Save";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import KPICards from "../../../kpi/components/KPICards";
import type {
  KPIItem,
} from "../../../kpi/components/KPICards";

import EmployeeTrendChart from "../../../charts/components/EmployeeTrendChart";
import DepartmentChart from "../../../charts/components/DepartmentChart";
import LocationChart from "../../../charts/components/LocationChart";
import RoleChart from "../../../charts/components/RoleChart";
import StatusChart from "../../../charts/components/StatusChart";
import RiskChart from "../../../charts/components/RiskChart";

import KPIDrillDown from "../../../kpi/components/KPIDrillDown";

import { useChartData } from "../../../charts/hooks/useChartData";
import useChartFilters from "../../../charts/hooks/useChartFilters";

import {
  useDrillDown,
} from "../../../kpi/hooks/useDrillDown";

import {
  compareDepartments,
} from "../../../kpi/services/kpiComparison";

import {
  calculateGrowth,
} from "../../../kpi/services/kpiAggregation";

import "./DashboardAnalytics.css";

import type { Employee } from "../../../../types/employee";

interface DashboardAnalyticsProps {
  employees: Employee[];
}

const DashboardAnalytics = ({
  employees,
}: DashboardAnalyticsProps) => {
  /* ===========================================
     Filters
  =========================================== */

  const {
  clearFilters,
  undoLastFilter,
  filteredEmployees,
  filterSummary,
  comparison,
  savedViews,
  saveCurrentView,
} = useChartFilters(employees);
  /* ===========================================
     Charts
  =========================================== */

  const {
    trendData,

    departmentData,

    locationData,

    roleData,

    statusData,

    riskData,

    dashboardSummary,

  } = useChartData(
    filteredEmployees,
    comparison.enabled
      ? {
          enabled: true,

          leftEmployees:
            filteredEmployees.filter(
              (employee) =>
                employee.department ===
                comparison.leftDepartment
            ),

          rightEmployees:
            filteredEmployees.filter(
              (employee) =>
                employee.department ===
                comparison.rightDepartment
            ),
        }
      : undefined
  );

  /* ===========================================
     DrillDown
  =========================================== */

  const {
    open,

    data,

    loading,

    openDrillDown,

    closeDrillDown,

    refreshDrillDown,

    lastUpdated,

    comparisonMode,

    toggleComparisonMode,
  } = useDrillDown(
    filteredEmployees
  );

  /* ===========================================
     Dashboard Comparison
  =========================================== */

  const comparisonData =
    useMemo(() => {
      if (
        !comparison.enabled ||
        !comparison.leftDepartment ||
        !comparison.rightDepartment
      ) {
        return null;
      }

      return compareDepartments(
        filteredEmployees,

        comparison.leftDepartment,

        comparison.rightDepartment
      );
    }, [
      comparison,
      filteredEmployees,
    ]);

  /* ===========================================
     Local State
  =========================================== */

  const [
    savingView,
    setSavingView,
  ] = useState(false);

  const handleSaveView =
    () => {
      setSavingView(true);

      saveCurrentView(
        `View ${savedViews.length + 1}`
      );

      window.setTimeout(() => {
        setSavingView(false);
      }, 300);
    };

  const handleRefresh =
    () => {
      refreshDrillDown();
    };

  const handleClear =
    () => {
      clearFilters();
    };

    /* ===========================================
   KPI Cards
=========================================== */

const activePercentage =
  dashboardSummary.totalEmployees === 0
    ? 0
    : Number(
        (
          (dashboardSummary.activeEmployees /
            dashboardSummary.totalEmployees) *
          100
        ).toFixed(1)
      );

const riskPercentage =
  dashboardSummary.totalEmployees === 0
    ? 0
    : Number(
        (
          (dashboardSummary.highRiskEmployees /
            dashboardSummary.totalEmployees) *
          100
        ).toFixed(1)
      );

/* ===========================================
   Real KPI Trends
   ---------------------------------------------
   trendData is a month-ordered series
   (from useChartData -> getMonthlyTrend). We
   compare the most recent month against the
   one before it using the existing
   calculateGrowth() helper, instead of showing
   fabricated percentages.

   Metrics with no historical series available
   (training completion, skill coverage, high
   risk headcount, department count) fall back
   to a neutral 0 rather than an invented value.
=========================================== */

const previousMonth =
  trendData.length > 1
    ? trendData[trendData.length - 2]
    : null;

const currentMonth =
  trendData.length > 0
    ? trendData[trendData.length - 1]
    : null;

const totalEmployeesTrend =
  previousMonth && currentMonth
    ? calculateGrowth(
        currentMonth.totalEmployees,
        previousMonth.totalEmployees
      )
    : 0;

const activeEmployeesTrend =
  previousMonth && currentMonth
    ? calculateGrowth(
        currentMonth.activeEmployees,
        previousMonth.activeEmployees
      )
    : 0;

const newHiresTrend =
  previousMonth && currentMonth
    ? calculateGrowth(
        currentMonth.newHires,
        previousMonth.newHires
      )
    : 0;

const attritionRateTrend =
  previousMonth &&
  currentMonth &&
  previousMonth.totalEmployees > 0 &&
  currentMonth.totalEmployees > 0
    ? calculateGrowth(
        (currentMonth.attrition /
          currentMonth.totalEmployees) *
          100,
        (previousMonth.attrition /
          previousMonth.totalEmployees) *
          100
      )
    : 0;

const kpis = useMemo<KPIItem[]>(
  () => [
    {
      id: "totalEmployees",
      title: "Total Employees",
      value:
        dashboardSummary.totalEmployees,
      trend: totalEmployeesTrend,
      subtitle:
        "Organization Strength",
      progress: 100,
    },
    {
      id: "activeEmployees",
      title: "Active Employees",
      value:
        dashboardSummary.activeEmployees,
      trend: activeEmployeesTrend,
      subtitle:
        "Currently Working",
      progress: activePercentage,
    },
    {
      id: "newHires",
      title: "New Hires",
      value:
        trendData.length > 0
          ? trendData[
              trendData.length - 1
            ].newHires
          : 0,
      trend: newHiresTrend,
      subtitle:
        "Current Month",
      progress: 72,
    },
    {
      id: "attritionRate",
      title: "Attrition",
      value: `${dashboardSummary.attritionRate}%`,
      trend: attritionRateTrend,
      subtitle:
        "Last 30 Days",
      progress:
        dashboardSummary.attritionRate,
    },
    {
      id: "trainingCompletion",
      title: "Training",
      value: `${dashboardSummary.averageTraining}%`,
      trend: 0,
      subtitle:
        "Completion Rate",
      progress:
        dashboardSummary.averageTraining,
    },
    {
      id: "skillCoverage",
      title: "Skill Coverage",
      value: `${dashboardSummary.averageSkillCoverage}%`,
      trend: 0,
      subtitle:
        "Certified Skills",
      progress:
        dashboardSummary.averageSkillCoverage,
    },
    {
      id: "highRiskEmployees",
      title: "High Risk",
      value:
        dashboardSummary.highRiskEmployees,
      trend: 0,
      subtitle:
        "Need Attention",
      progress: riskPercentage,
    },
    {
      id: "departments",
      title: "Departments",
      value:
        dashboardSummary.departmentCount,
      trend: 0,
      subtitle:
        "Business Units",
      progress: 100,
    },
  ],
  [
    dashboardSummary,
    trendData,
    activePercentage,
    riskPercentage,
    totalEmployeesTrend,
    activeEmployeesTrend,
    newHiresTrend,
    attritionRateTrend,
  ]
);
  return (
    <Box className="dashboard-analytics">
      {/* =====================================
          Header
      ===================================== */}

      <Box className="dashboard-analytics__header">
        <Box>
          <Typography variant="h4">
            Workforce Analytics
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Real-time workforce
            insights powered by a
            synchronized filter
            engine.
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              mt: 2,
              flexWrap: "wrap",
            }}
          >
            <Chip
              color="primary"
              label={`${filterSummary.filteredEmployees} Employees`}
            />

            <Chip
              color="success"
              icon={<AccessTimeIcon />}
              label={`Updated ${lastUpdated}`}
            />

            {comparison.enabled && (
              <Chip
                color="secondary"
                icon={
                  <CompareArrowsIcon />
                }
                label="Comparison Mode"
              />
            )}
          </Stack>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            flexWrap: "wrap",
          }}
        >
          <Tooltip title="Refresh Dashboard">
            <IconButton
              onClick={
                handleRefresh
              }
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Undo Last Filter">
            <IconButton
              onClick={
                undoLastFilter
              }
            >
              <UndoIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Comparison Mode">
            <IconButton
              onClick={
                toggleComparisonMode
              }
            >
              <CompareArrowsIcon />
            </IconButton>
          </Tooltip>

          <Button
            variant="outlined"
            startIcon={
              <FilterAltOffIcon />
            }
            onClick={
              handleClear
            }
          >
            Clear Filters
          </Button>

          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={savingView}
            onClick={
              handleSaveView
            }
          >
            Save View
          </Button>
        </Stack>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* =====================================
          KPI Cards
      ===================================== */}

      <KPICards
        data={kpis}
        loading={loading}
        onCardClick={(kpi) =>
          openDrillDown(kpi.id)
        }
      />
            {/* =====================================
          Charts
      ===================================== */}

      <Grid
        container
        spacing={3}
      >
        {/* Employee Trend */}

        <Grid
          size={{
            xs: 12,
            xl: 8,
          }}
        >
          <EmployeeTrendChart
            data={trendData}
            loading={loading}
          />
        </Grid>

        {/* Department */}

        <Grid
          size={{
            xs: 12,
            xl: 4,
          }}
        >
          <DepartmentChart
            data={departmentData}
            loading={loading}
          />
        </Grid>

        {/* Role */}

        <Grid
          size={{
            xs: 12,
            md: 8,
          }}
        >
          <RoleChart
            data={roleData}
            loading={loading}
          />
        </Grid>

        {/* Location */}

        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
        >
          <LocationChart
            data={locationData}
            loading={loading}
          />
        </Grid>

        {/* Status */}

        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <StatusChart
            data={statusData}
            loading={loading}
          />
        </Grid>

        {/* Risk */}

        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <RiskChart
            data={riskData}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* =====================================
          Comparison Summary
      ===================================== */}

      {comparisonMode &&
        comparisonData && (
          <Box
            className="dashboard-analytics__comparison"
            sx={{
              mt: 3,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                mb: 2,
                fontWeight: 700,
              }}
            >
              Department Comparison
            </Typography>

            <Grid
              container
              spacing={2}
            >
              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <Box className="comparison-card">
                  <Typography variant="h6">
                    {
                      comparison.leftDepartment
                    }
                  </Typography>

                  <Typography
                    variant="h3"
                    color="primary"
                    sx={{
                      mt: 2,
                    }}
                  >
                    {
                      comparisonData.left
                        .totalEmployees
                    }
                  </Typography>

                  <Typography
                    color="text.secondary"
                  >
                    Employees
                  </Typography>
                </Box>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <Box className="comparison-card">
                  <Typography variant="h6">
                    {
                      comparison.rightDepartment
                    }
                  </Typography>

                  <Typography
                    variant="h3"
                    color="secondary"
                    sx={{
                      mt: 2,
                    }}
                  >
                    {
                      comparisonData.right
                        .totalEmployees
                    }
                  </Typography>

                  <Typography
                    color="text.secondary"
                  >
                    Employees
                  </Typography>
                </Box>
              </Grid>

              <Grid size={12}>
                <Box className="comparison-result">
                  <Typography
                    variant="body1"
                  >
                    Difference :
                    <strong>
                      {" "}
                      {
                        comparisonData
                          .difference
                          .totalEmployees
                      }
                    </strong>
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 1,
                    }}
                  >
                    Growth :
                    {" "}
                    {
                      comparisonData
                        .growth
                        .totalEmployees
                    }
                    %
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

      {/* =====================================
          KPI Drill Down
      ===================================== */}

     <KPIDrillDown
    open={open}
    data={data}
    onClose={closeDrillDown}
/>
    </Box>
  );
};

export default DashboardAnalytics;
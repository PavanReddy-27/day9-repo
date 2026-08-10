// src/features/kpi/components/DrillDownCharts/DrillDownCharts.tsx
// PART 1

import { useMemo, useState } from "react";

import {
  Box,
  Typography,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";

import RefreshIcon from "@mui/icons-material/Refresh";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import BarChartIcon from "@mui/icons-material/BarChart";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";

import type {
  DrillDownChartData,
} from "../../../../types/drilldown";

import {
  PIE_COLORS,
} from "../../../charts/components/utils/chartColors";

import {
  DEFAULT_MARGIN,
  CHART_HEIGHT,
} from "../../../charts/components/utils/chartConstants";

import {
  formatTooltipValue,
} from "../../../charts/components/utils/chartFormatter";
import "./DrillDownCharts.css";

export interface DrillDownChartsProps {
  title?: string;

  data: DrillDownChartData[];

  loading?: boolean;

  onRefresh?: () => void;

  onExport?: () => void;
}

type ChartType =
  | "bar"
  | "pie";

const DrillDownCharts = ({
  title = "Analytics",
  data,
  loading = false,
  onRefresh,
  onExport,
}: DrillDownChartsProps) => {
  const [chartType, setChartType] =
    useState<ChartType>("bar");

  const chartData = useMemo(
    () =>
      [...data].sort(
        (a, b) => b.value - a.value
      ),
    [data]
  );

  const total = useMemo(
    () =>
      chartData.reduce(
        (sum, item) =>
          sum + item.value,
        0
      ),
    [chartData]
  );

  const handleChartType = (
    _: React.MouseEvent<HTMLElement>,
    value: ChartType | null
  ) => {
    if (value) {
      setChartType(value);
    }
  };

  if (loading) {
    return (
      <Box className="drilldown-charts__loading">
        <CircularProgress />

        <Typography>
          Loading charts...
        </Typography>
      </Box>
    );
  }

  if (!chartData.length) {
    return (
      <Box className="drilldown-charts__empty">
        <Typography variant="h6">
          No Chart Data Available
        </Typography>

        <Typography color="text.secondary">
          Try changing the filters.
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="drilldown-charts">
      <Box className="drilldown-charts__header">
        <Box>
          <Typography variant="h6">
            {title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Total: {total}
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
          }}
        >
          <ToggleButtonGroup
            exclusive
            size="small"
            value={chartType}
            onChange={
              handleChartType
            }
          >
            <ToggleButton value="bar">
              <BarChartIcon />
            </ToggleButton>

            <ToggleButton value="pie">
              <DonutLargeIcon />
            </ToggleButton>
          </ToggleButtonGroup>

          <Tooltip title="Refresh">
            <IconButton
              onClick={onRefresh}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Export">
            <IconButton
              onClick={onExport}
            >
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
            {chartType === "bar" ? (
        <ResponsiveContainer
          width="100%"
          height={CHART_HEIGHT}
        >
          <BarChart
            data={chartData}
            margin={DEFAULT_MARGIN}
          >
            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis dataKey="label" />

            <YAxis />

            <RechartsTooltip
              formatter={(value) =>
                formatTooltipValue(
                  value as number
                )
              }
            />

            <Legend />

            <Bar
              dataKey="value"
              radius={[8, 8, 0, 0]}
            >
              {chartData.map(
                (_, index) => (
                  <Cell
                    key={index}
                    fill={
                      PIE_COLORS[
                        index %
                          PIE_COLORS.length
                      ]
                    }
                  />
                )
              )}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer
          width="100%"
          height={CHART_HEIGHT}
        >
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="label"
              innerRadius={70}
              outerRadius={120}
              paddingAngle={2}
              label
            >
              {chartData.map(
                (_, index) => (
                  <Cell
                    key={index}
                    fill={
                      PIE_COLORS[
                        index %
                          PIE_COLORS.length
                      ]
                    }
                  />
                )
              )}
            </Pie>

            <Legend />

            <RechartsTooltip
              formatter={(value) =>
                formatTooltipValue(
                  value as number
                )
              }
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

export default DrillDownCharts;
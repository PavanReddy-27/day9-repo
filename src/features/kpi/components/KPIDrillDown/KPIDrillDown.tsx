// src/features/kpi/components/KPIDrillDown/KPIDrillDown.tsx
// PART 1 (FIXED)
//
// Changes from the previous version:
// 1. The growth line no longer uses `data?.growth &&` as its only guard.
//    That works today because growth is always a non-empty string, but
//    it's one type change away from silently rendering a stray "0" if
//    growth were ever a number. It's also updated to hide entirely when
//    growth is "N/A" (drillDownService.ts now returns "N/A" rather than
//    a fabricated percentage when there's no real baseline to compare
//    against).
// 2. The growth text color was hardcoded to success.main (green) in
//    every case — including negative values like "-1.8%", which read as
//    a positive change even though the number said otherwise. It now
//    colors based on the actual sign of the value.

import { useMemo } from "react";

import {
  Drawer,
  Box,
  Divider,
  Typography,
  CircularProgress,
} from "@mui/material";

import DrillDownHeader from "../DrillDownHeader";
import DrillDownStatistics from "../DrillDownStatistics";
import DrillDownContent from "../DrillDownContent";

import type {
  KPIDrillDownProps,
} from "../../../../types/drilldown";

import { exportEmployeesToCSV } from "../../../../utils/csvExport";

import "./KPIDrillDown.css";

const KPIDrillDown = ({
  open,
  onClose,
  data,
}: KPIDrillDownProps) => {
  const employees = useMemo(
    () => data?.employees ?? [],
    [data]
  );

  const statistics = useMemo(
    () => data?.statistics ?? [],
    [data]
  );

  const items = useMemo(
    () => data?.items ?? [],
    [data]
  );

  const showGrowth =
    !!data?.growth &&
    data.growth !== "N/A";

  const growthIsNegative =
    !!data?.growth &&
    data.growth.trim().startsWith("-");

  const handleExport = () => {
    exportEmployeesToCSV(
      employees,
      `${(data?.title ?? "kpi")
        .replace(/\s+/g, "-")
        .toLowerCase()}.csv`
    );
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleCompare = () => {
    console.log("Comparison Mode");
  };

  const handleFullscreen = async () => {
    const element =
      document.documentElement;

    if (
      !document.fullscreenElement &&
      element.requestFullscreen
    ) {
      await element.requestFullscreen();
      return;
    }

    if (document.exitFullscreen) {
      await document.exitFullscreen();
    }
  };

  const loading = false;

  return (
  <Drawer
    anchor="right"
    open={open}
    onClose={onClose}
    slotProps={{
      paper: {
        sx: {
          width: {
            xs: "100%",
            sm: 650,
            lg: 720,
          },
          maxWidth: "100vw",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      },
    }}
  >
    <Box className="kpi-drilldown">
      <DrillDownHeader
        title={data?.title ?? "KPI Details"}
        subtitle={data?.description}
        total={data?.total}
        lastUpdated={new Date().toLocaleString()}
        comparisonEnabled={false}
        onRefresh={handleRefresh}
        onExport={handleExport}
        onCompare={handleCompare}
        onFullscreen={handleFullscreen}
        onClose={onClose}
      />

      {loading ? (
        <Box className="kpi-drilldown__loading">
          <CircularProgress />

          <Typography>
            Loading KPI Details...
          </Typography>
        </Box>
      ) : (
        <Box className="kpi-drilldown__content">
          <Box className="kpi-drilldown__summary">
            <Typography
              variant="h3"
              className="kpi-drilldown__total"
            >
              {data?.total ?? "-"}
            </Typography>

            {showGrowth && (
  <Typography
    color={
      growthIsNegative
        ? "error.main"
        : "success.main"
    }
    sx={{ fontWeight: 600 }}
  >
    {data?.growth}
  </Typography>
)}
            <Typography color="text.secondary">
              {data?.description}
            </Typography>
          </Box>

          {!!statistics.length && (
            <>
              <Divider />

              <DrillDownStatistics
                statistics={statistics}
              />
            </>
          )}

          <Divider />

          <DrillDownContent
            title="Analytics Breakdown"
            items={items}
            loading={loading}
            emptyMessage="No analytics data available."
          />
        </Box>
      )}
    </Box>
  </Drawer>
  );
};

export default KPIDrillDown;
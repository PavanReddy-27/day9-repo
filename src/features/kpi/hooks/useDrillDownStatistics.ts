import { useMemo } from "react";

import type {
  DrillDownData,
  DrillDownStatistics,
} from "../../../types/drilldown";

interface UseDrillDownStatisticsReturn {
  statistics: DrillDownStatistics[];

  total: number | string;

  growth: string;

  description: string;

  averageTrend: number;

  positiveCount: number;

  negativeCount: number;

  neutralCount: number;

  maxStatistic: DrillDownStatistics | null;

  minStatistic: DrillDownStatistics | null;
}

export const useDrillDownStatistics = (
  data: DrillDownData | null
): UseDrillDownStatisticsReturn => {
  return useMemo(() => {
    const statistics =
      data?.statistics ?? [];

    const positiveCount =
      statistics.filter(
        (item) => item.trend > 0
      ).length;

    const negativeCount =
      statistics.filter(
        (item) => item.trend < 0
      ).length;

    const neutralCount =
      statistics.filter(
        (item) => item.trend === 0
      ).length;

    const averageTrend =
      statistics.length === 0
        ? 0
        : Number(
            (
              statistics.reduce(
                (sum, item) =>
                  sum + item.trend,
                0
              ) / statistics.length
            ).toFixed(1)
          );

    const maxStatistic =
      statistics.length === 0
        ? null
        : statistics.reduce((previous, current) =>
            Number(previous.value) >
            Number(current.value)
              ? previous
              : current
          );

    const minStatistic =
      statistics.length === 0
        ? null
        : statistics.reduce((previous, current) =>
            Number(previous.value) <
            Number(current.value)
              ? previous
              : current
          );

    return {
      statistics,

      total: data?.total ?? 0,

      growth: data?.growth ?? "0%",

      description:
        data?.description ?? "",

      averageTrend,

      positiveCount,

      negativeCount,

      neutralCount,

      maxStatistic,

      minStatistic,
    };
  }, [data]);
};

export default useDrillDownStatistics;
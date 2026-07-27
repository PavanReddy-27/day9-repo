import {
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";

import type { Employee } from "../../../types/employee";
import type { KPIType } from "../../../types/kpi";
import type { DrillDownData } from "../../../types/drilldown";

import { getDrillDownData } from "../services/drillDownService";

interface UseDrillDownReturn {
  open: boolean;

  loading: boolean;

  selectedKPI: KPIType | null;

  data: DrillDownData | null;

  lastUpdated: string;

  comparisonMode: boolean;

  openDrillDown: (
    kpi: KPIType
  ) => void;

  closeDrillDown: () => void;

  refreshDrillDown: () => void;

  toggleComparisonMode: () => void;
}

export const useDrillDown = (
  employees: Employee[]
): UseDrillDownReturn => {
  const [selectedKPI, setSelectedKPI] =
    useState<KPIType | null>(null);

  const [open, setOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [
    comparisonMode,
    setComparisonMode,
  ] = useState(false);

  const [
    lastUpdated,
    setLastUpdated,
  ] = useState(
    new Date().toLocaleString()
  );

  const data = useMemo(() => {
    if (!selectedKPI) {
      return null;
    }

    return getDrillDownData(
      selectedKPI,
      employees
    );
  }, [selectedKPI, employees]);

  useEffect(() => {
    setLastUpdated(
      new Date().toLocaleString()
    );
  }, [data]);

  const openDrillDown = useCallback(
    (kpi: KPIType) => {
      setLoading(true);

      setSelectedKPI(kpi);

      setOpen(true);

      window.setTimeout(() => {
        setLoading(false);
      }, 250);
    },
    []
  );

  const closeDrillDown =
    useCallback(() => {
      setOpen(false);

      window.setTimeout(() => {
        setSelectedKPI(null);
      }, 250);
    }, []);

  const refreshDrillDown =
    useCallback(() => {
      if (!selectedKPI) {
        return;
      }

      setLoading(true);

      window.setTimeout(() => {
        setLastUpdated(
          new Date().toLocaleString()
        );

        setLoading(false);
      }, 400);
    }, [selectedKPI]);

  const toggleComparisonMode =
    useCallback(() => {
      setComparisonMode(
        (previous) => !previous
      );
    }, []);

  return {
    open,

    loading,

    selectedKPI,

    data,

    lastUpdated,

    comparisonMode,

    openDrillDown,

    closeDrillDown,

    refreshDrillDown,

    toggleComparisonMode,
  };
};

export default useDrillDown;
// src/features/charts/hooks/useChartFilters.ts
// PART 1

import {
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";

import type {
  Employee,
  EmployeeStatus,
  RiskLevel,
} from "../../../types/employee";

export interface ChartFilters {
  search: string;

  departments: string[];

  teams: string[];

  roles: string[];

  designations: string[];

  managers: string[];

  locations: string[];

  countries: string[];

  employmentTypes: string[];

  statuses: EmployeeStatus[];

  risks: RiskLevel[];

  genders: string[];

  projects: string[];

  minSalary?: number;

  maxSalary?: number;

  minExperience?: number;

  maxExperience?: number;

  startDate?: string;

  endDate?: string;
}

export interface SavedFilterView {
  id: string;

  name: string;

  filters: ChartFilters;

  createdAt: string;

  updatedAt: string;
}

export interface ComparisonFilters {
  enabled: boolean;

  leftDepartment?: string;

  rightDepartment?: string;

  leftLocation?: string;

  rightLocation?: string;

  leftStartDate?: string;

  leftEndDate?: string;

  rightStartDate?: string;

  rightEndDate?: string;
}

export interface FilterSummary {
  activeFilters: number;

  totalEmployees: number;

  filteredEmployees: number;

  lastUpdated: string;
}

export interface UseChartFiltersReturn {
  filters: ChartFilters;

  updateFilters: (
    filters: Partial<ChartFilters>
  ) => void;

  clearFilters: () => void;

  undoLastFilter: () => void;

  filteredEmployees: Employee[];

  filterSummary: FilterSummary;

  comparison: ComparisonFilters;

  setComparison:
    React.Dispatch<
      React.SetStateAction<ComparisonFilters>
    >;

  availableDepartments: string[];

  availableRoles: string[];

  availableLocations: string[];

  availableManagers: string[];

  savedViews: SavedFilterView[];

  saveCurrentView: (
    name: string
  ) => void;

  applySavedView: (
    id: string
  ) => void;

  deleteSavedView: (
    id: string
  ) => void;

  renameSavedView: (
    id: string,
    newName: string
  ) => void;
}

/* ==========================================================
   Defaults
========================================================== */

export const DEFAULT_FILTERS: ChartFilters =
  {
    search: "",

    departments: [],

    teams: [],

    roles: [],

    designations: [],

    managers: [],

    locations: [],

    countries: [],

    employmentTypes: [],

    statuses: [],

    risks: [],

    genders: [],

    projects: [],
  };

const FILTER_STORAGE_KEY =
  "workforce-chart-filters";

const FILTER_VIEW_STORAGE_KEY =
  "workforce-filter-views";

const SEARCH_DELAY = 400;

/* ==========================================================
   Debounce
========================================================== */

const useDebounce = <T,>(
  value: T,
  delay: number
): T => {
  const [
    debouncedValue,
    setDebouncedValue,
  ] = useState(value);

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

    return () =>
      window.clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

/* ==========================================================
   Storage
========================================================== */

const loadFilters = (): ChartFilters => {
  try {
    const stored =
      localStorage.getItem(
        FILTER_STORAGE_KEY
      );

    if (!stored) {
      return DEFAULT_FILTERS;
    }

    return {
      ...DEFAULT_FILTERS,
      ...JSON.parse(stored),
    };
  } catch {
    return DEFAULT_FILTERS;
  }
};

const loadSavedViews =
  (): SavedFilterView[] => {
    try {
      const stored =
        localStorage.getItem(
          FILTER_VIEW_STORAGE_KEY
        );

      return stored
        ? JSON.parse(stored)
        : [];
    } catch {
      return [];
    }
  };

/* ==========================================================
   Hook
========================================================== */

export const useChartFilters = (
  employees: Employee[]
): UseChartFiltersReturn => {
  const [filters, setFilters] =
    useState<ChartFilters>(
      loadFilters
    );

  const [history, setHistory] =
    useState<ChartFilters[]>([]);

  const [
    savedViews,
    setSavedViews,
  ] = useState<
    SavedFilterView[]
  >(loadSavedViews);

  const [
    comparison,
    setComparison,
  ] =
    useState<ComparisonFilters>({
      enabled: false,
    });

  const debouncedSearch =
    useDebounce(
      filters.search,
      SEARCH_DELAY
    );

  const updateFilters =
    useCallback(
      (
        updates: Partial<ChartFilters>
      ) => {
        setHistory(
          (previous) => [
            ...previous,
            filters,
          ]
        );

        setFilters(
          (previous) => ({
            ...previous,
            ...updates,
          })
        );
      },
      [filters]
    );
      /* ==========================================================
     Filter Employees
  ========================================================== */

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      /* Search */

      if (debouncedSearch.trim()) {
        const keyword =
          debouncedSearch.toLowerCase();

        const searchableText = [
          employee.employeeId,
          employee.fullName,
          employee.email,
          employee.department,
          employee.team,
          employee.role,
          employee.designation,
          employee.manager,
          employee.location,
          employee.country,
          employee.project,
        ]
          .join(" ")
          .toLowerCase();

        if (
          !searchableText.includes(keyword)
        ) {
          return false;
        }
      }

      /* Department */

      if (
        filters.departments.length > 0 &&
        !filters.departments.includes(
          employee.department
        )
      ) {
        return false;
      }

      /* Team */

      if (
        filters.teams.length > 0 &&
        !filters.teams.includes(
          employee.team
        )
      ) {
        return false;
      }

      /* Role */

      if (
        filters.roles.length > 0 &&
        !filters.roles.includes(
          employee.role
        )
      ) {
        return false;
      }

      /* Designation */

      if (
        filters.designations.length >
          0 &&
        !filters.designations.includes(
          employee.designation
        )
      ) {
        return false;
      }

      /* Manager */

      if (
        filters.managers.length > 0 &&
        !filters.managers.includes(
          employee.manager
        )
      ) {
        return false;
      }

      /* Location */

      if (
        filters.locations.length > 0 &&
        !filters.locations.includes(
          employee.location
        )
      ) {
        return false;
      }

      /* Country */

      if (
        filters.countries.length > 0 &&
        !filters.countries.includes(
          employee.country
        )
      ) {
        return false;
      }

      /* Employment */

      if (
        filters.employmentTypes.length >
          0 &&
        !filters.employmentTypes.includes(
          employee.employmentType
        )
      ) {
        return false;
      }

      /* Status */

      if (
        filters.statuses.length > 0 &&
        !filters.statuses.includes(
          employee.status
        )
      ) {
        return false;
      }

      /* Risk */

      if (
        filters.risks.length > 0 &&
        !filters.risks.includes(
          employee.risk
        )
      ) {
        return false;
      }

      /* Gender */

      if (
        filters.genders.length > 0 &&
        !filters.genders.includes(
          employee.gender
        )
      ) {
        return false;
      }

      /* Project */

      if (
        filters.projects.length > 0 &&
        !filters.projects.includes(
          employee.project
        )
      ) {
        return false;
      }

      /* Salary */

      if (
        filters.minSalary !==
          undefined &&
        employee.salary <
          filters.minSalary
      ) {
        return false;
      }

      if (
        filters.maxSalary !==
          undefined &&
        employee.salary >
          filters.maxSalary
      ) {
        return false;
      }

      /* Experience */

      if (
        filters.minExperience !==
          undefined &&
        employee.experience <
          filters.minExperience
      ) {
        return false;
      }

      if (
        filters.maxExperience !==
          undefined &&
        employee.experience >
          filters.maxExperience
      ) {
        return false;
      }

      /* Date */

      if (
        filters.startDate &&
        new Date(
          employee.joiningDate
        ) <
          new Date(
            filters.startDate
          )
      ) {
        return false;
      }

      if (
        filters.endDate &&
        new Date(
          employee.joiningDate
        ) >
          new Date(
            filters.endDate
          )
      ) {
        return false;
      }

      /* Comparison */

      if (
        comparison.enabled &&
        comparison.leftDepartment &&
        comparison.rightDepartment
      ) {
        if (
          employee.department !==
            comparison.leftDepartment &&
          employee.department !==
            comparison.rightDepartment
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    employees,
    filters,
    comparison,
    debouncedSearch,
  ]);

  /* ==========================================================
     Filter Summary
  ========================================================== */

  const filterSummary =
    useMemo(
      () => ({
        activeFilters:
          Object.values(
            filters
          ).filter((value) =>
            Array.isArray(value)
              ? value.length > 0
              : value !==
                  undefined &&
                value !== ""
          ).length,

        totalEmployees:
          employees.length,

        filteredEmployees:
          filteredEmployees.length,

        lastUpdated:
          new Date().toLocaleString(),
      }),
      [
        employees,
        filteredEmployees,
        filters,
      ]
    );
      /* ==========================================================
     Available Filter Values
  ========================================================== */

  const availableDepartments = useMemo(
    () =>
      [
        ...new Set(
          employees.map(
            (employee) =>
              employee.department
          )
        ),
      ].sort(),
    [employees]
  );

  const availableRoles = useMemo(() => {
    const source =
      filters.departments.length === 0
        ? employees
        : employees.filter((employee) =>
            filters.departments.includes(
              employee.department
            )
          );

    return [
      ...new Set(
        source.map(
          (employee) => employee.role
        )
      ),
    ].sort();
  }, [
    employees,
    filters.departments,
  ]);

  const availableLocations = useMemo(
    () =>
      [
        ...new Set(
          employees.map(
            (employee) =>
              employee.location
          )
        ),
      ].sort(),
    [employees]
  );

  const availableManagers = useMemo(
    () =>
      [
        ...new Set(
          employees.map(
            (employee) =>
              employee.manager
          )
        ),
      ].sort(),
    [employees]
  );

  /* ==========================================================
     Filter Actions
  ========================================================== */

  const clearFilters = useCallback(() => {
    setHistory((previous) => [
      ...previous,
      filters,
    ]);

    setFilters(DEFAULT_FILTERS);
  }, [filters]);

  const undoLastFilter =
    useCallback(() => {
      setHistory((previous) => {
        if (previous.length === 0) {
          return previous;
        }

        const updated = [
          ...previous,
        ];

        const last =
          updated.pop() ??
          DEFAULT_FILTERS;

        setFilters(last);

        return updated;
      });
    }, []);

  /* ==========================================================
     Saved Views
  ========================================================== */

  const saveCurrentView =
    useCallback(
      (name: string) => {
        const now =
          new Date().toISOString();

        const view: SavedFilterView =
          {
            id: crypto.randomUUID(),

            name,

            filters,

            createdAt: now,

            updatedAt: now,
          };

        setSavedViews(
          (previous) => [
            ...previous,
            view,
          ]
        );
      },
      [filters]
    );

  const applySavedView =
    useCallback(
      (id: string) => {
        const selected =
          savedViews.find(
            (view) =>
              view.id === id
          );

        if (!selected) {
          return;
        }

        updateFilters(
          selected.filters
        );
      },
      [
        savedViews,
        updateFilters,
      ]
    );

  const deleteSavedView =
    useCallback((id: string) => {
      setSavedViews(
        (previous) =>
          previous.filter(
            (view) =>
              view.id !== id
          )
      );
    }, []);

  const renameSavedView =
    useCallback(
      (
        id: string,
        newName: string
      ) => {
        setSavedViews(
          (previous) =>
            previous.map((view) =>
              view.id === id
                ? {
                    ...view,

                    name: newName,

                    updatedAt:
                      new Date().toISOString(),
                  }
                : view
            )
        );
      },
      []
    );
      /* ==========================================================
     URL Sync
  ========================================================== */

  useEffect(() => {
    const params =
      new URLSearchParams();

    if (filters.search) {
      params.set(
        "search",
        filters.search
      );
    }

    if (
      filters.departments.length
    ) {
      params.set(
        "departments",
        filters.departments.join(",")
      );
    }

    if (filters.roles.length) {
      params.set(
        "roles",
        filters.roles.join(",")
      );
    }

    if (
      filters.locations.length
    ) {
      params.set(
        "locations",
        filters.locations.join(",")
      );
    }

    if (
      filters.statuses.length
    ) {
      params.set(
        "statuses",
        filters.statuses.join(",")
      );
    }

    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`
    );
  }, [filters]);

  /* ==========================================================
     Local Storage
  ========================================================== */

  useEffect(() => {
    localStorage.setItem(
      FILTER_STORAGE_KEY,
      JSON.stringify(filters)
    );
  }, [filters]);

  useEffect(() => {
    localStorage.setItem(
      FILTER_VIEW_STORAGE_KEY,
      JSON.stringify(savedViews)
    );
  }, [savedViews]);

  /* ==========================================================
     Return
  ========================================================== */

  return {
    filters,

    updateFilters,

    clearFilters,

    undoLastFilter,

    filteredEmployees,

    filterSummary,

    comparison,

    setComparison,

    availableDepartments,

    availableRoles,

    availableLocations,

    availableManagers,

    savedViews,

    saveCurrentView,

    applySavedView,

    deleteSavedView,

    renameSavedView,
  };
};

export default useChartFilters;
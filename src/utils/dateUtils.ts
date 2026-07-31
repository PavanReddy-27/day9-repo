// src/utils/dateUtils.ts
// PART 1 (Day 8 Update)

export const formatDate = (
  date: string,
  locale = "en-IN"
): string =>
  new Date(date).toLocaleDateString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const formatDateTime = (
  date: string,
  locale = "en-IN"
): string =>
  new Date(date).toLocaleString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatRelativeTime = (
  date: string
): string => {
  const now = Date.now();

  const target = new Date(date).getTime();

  const diff = Math.floor(
    (now - target) / 1000
  );

  if (diff < 60) {
    return `${diff} sec ago`;
  }

  if (diff < 3600) {
    return `${Math.floor(
      diff / 60
    )} min ago`;
  }

  if (diff < 86400) {
    return `${Math.floor(
      diff / 3600
    )} hrs ago`;
  }

  return `${Math.floor(
    diff / 86400
  )} days ago`;
};

/* ==========================================================
   Date Presets
========================================================== */

export type DatePreset =
  | "today"
  | "last7Days"
  | "last30Days"
  | "last90Days"
  | "thisMonth"
  | "thisYear";

export const getPresetDateRange = (
  preset: DatePreset
) => {
  const end = new Date();

  const start = new Date();

  switch (preset) {
    case "today":
      break;

    case "last7Days":
      start.setDate(
        end.getDate() - 7
      );
      break;

    case "last30Days":
      start.setDate(
        end.getDate() - 30
      );
      break;

    case "last90Days":
      start.setDate(
        end.getDate() - 90
      );
      break;

    case "thisMonth":
      start.setDate(1);
      break;

    case "thisYear":
      start.setMonth(0);
      start.setDate(1);
      break;
  }

  return {
    start,

    end,
  };
};

export const isDateInRange = (
  date: string,
  start: Date,
  end: Date
): boolean => {
  const target =
    new Date(date);

  return (
    target >= start &&
    target <= end
  );
};

export const getLastUpdated = (): string =>
  new Date().toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
  /* ==========================================================
   Existing Helpers
========================================================== */

export const getMonthName = (
  date: string
): string =>
  new Date(date).toLocaleString("default", {
    month: "short",
  });

export const getYear = (
  date: string
): number =>
  new Date(date).getFullYear();

export const getMonth = (
  date: string
): number =>
  new Date(date).getMonth() + 1;

export const getQuarter = (
  date: string
): string => {
  const month =
    new Date(date).getMonth();

  if (month <= 2) return "Q1";
  if (month <= 5) return "Q2";
  if (month <= 8) return "Q3";

  return "Q4";
};

export const isCurrentMonth = (
  date: string
): boolean => {
  const today = new Date();

  const target = new Date(date);

  return (
    today.getMonth() ===
      target.getMonth() &&
    today.getFullYear() ===
      target.getFullYear()
  );
};

export const isCurrentYear = (
  date: string
): boolean =>
  new Date(date).getFullYear() ===
  new Date().getFullYear();

export const getYearsOfService = (
  joiningDate: string
): number => {
  const today = new Date();

  const joined =
    new Date(joiningDate);

  return Number(
    (
      (today.getTime() -
        joined.getTime()) /
      (1000 *
        60 *
        60 *
        24 *
        365.25)
    ).toFixed(1)
  );
};

export const daysBetween = (
  start: string,
  end: string
): number =>
  Math.floor(
    (new Date(end).getTime() -
      new Date(start).getTime()) /
      (1000 * 60 * 60 * 24)
  );

export const sortByJoiningDate = <
  T extends {
    joiningDate: string;
  },
>(
  data: T[]
): T[] =>
  [...data].sort(
    (a, b) =>
      new Date(
        a.joiningDate
      ).getTime() -
      new Date(
        b.joiningDate
      ).getTime()
  );

export const getFinancialYear = (
  date: string
): string => {
  const current =
    new Date(date);

  const year =
    current.getFullYear();

  return current.getMonth() >= 3
    ? `${year}-${year + 1}`
    : `${year - 1}-${year}`;
};

/* ==========================================================
   Comparison Helpers
========================================================== */

export const getPreviousPeriod = (
  start: Date,
  end: Date
) => {
  const duration =
    end.getTime() -
    start.getTime();

  return {
    start: new Date(
      start.getTime() - duration
    ),

    end: new Date(
      end.getTime() - duration
    ),
  };
};

export const compareDateRanges = (
  firstStart: Date,
  firstEnd: Date,
  secondStart: Date,
  secondEnd: Date
): number => {
  const first =
    firstEnd.getTime() -
    firstStart.getTime();

  const second =
    secondEnd.getTime() -
    secondStart.getTime();

  return Math.floor(
    (first - second) /
      (1000 * 60 * 60 * 24)
  );
};
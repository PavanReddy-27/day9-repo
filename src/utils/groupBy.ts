// src/utils/groupBy.ts
// PART 1 (Day 8 Update)

export interface GroupByResult {
  key: string;

  count: number;
}

export interface GroupBySumResult
  extends GroupByResult {
  total: number;

  average: number;
}

export interface GroupByPercentageResult
  extends GroupByResult {
  percentage: number;
}

export interface NestedGroupResult<
  T
> {
  parent: string;

  children: T[];
}

export const groupBy = <
  T extends object,
  K extends keyof T
>(
  data: T[],
  key: K
): GroupByResult[] => {
  const grouped = new Map<
    string,
    number
  >();

  data.forEach((item) => {
    const value = String(
      item[key] ?? "Unknown"
    );

    grouped.set(
      value,
      (grouped.get(value) ?? 0) + 1
    );
  });

  return [...grouped.entries()]
    .map(([key, count]) => ({
      key,

      count,
    }))
    .sort(
      (a, b) =>
        b.count - a.count
    );
};

export const groupByWithSum = <
  T extends object,
  G extends keyof T,
  V extends keyof T
>(
  data: T[],
  groupKey: G,
  valueKey: V
): GroupBySumResult[] => {
  const grouped = new Map<
    string,
    {
      total: number;

      count: number;
    }
  >();

  data.forEach((item) => {
    const key = String(
      item[groupKey] ??
        "Unknown"
    );

    const value = Number(
      item[valueKey] ?? 0
    );

    const current =
      grouped.get(key) ?? {
        total: 0,

        count: 0,
      };

    current.total += value;

    current.count++;

    grouped.set(
      key,
      current
    );
  });

  return [...grouped.entries()].map(
    ([key, value]) => ({
      key,

      total: value.total,

      count: value.count,

      average: Number(
        (
          value.total /
          value.count
        ).toFixed(2)
      ),
    })
  );
};

export const groupByPercentage = <
  T extends object,
  K extends keyof T
>(
  data: T[],
  key: K
): GroupByPercentageResult[] => {
  const groups =
    groupBy(data, key);

  const total =
    data.length || 1;

  return groups.map(
    (group) => ({
      ...group,

      percentage: Number(
        (
          (group.count /
            total) *
          100
        ).toFixed(1)
      ),
    })
  );
};

export const groupByMultiple = <
  T extends object,
  K extends keyof T
>(
  data: T[],
  keys: K[]
): Map<string, T[]> => {
  const result = new Map<
    string,
    T[]
  >();

  data.forEach((item) => {
    const compositeKey =
      keys
        .map((key) =>
          String(item[key])
        )
        .join(" | ");

    const current =
      result.get(
        compositeKey
      ) ?? [];

    current.push(item);

    result.set(
      compositeKey,
      current
    );
  });

  return result;
};
/* ==========================================================
   Nested Grouping
========================================================== */

export const groupByNested = <
  T extends object,
  P extends keyof T,
  C extends keyof T
>(
  data: T[],
  parentKey: P,
  childKey: C
): NestedGroupResult<T>[] => {
  const grouped = new Map<
    string,
    T[]
  >();

  data.forEach((item) => {
    const parent = String(
      item[parentKey] ?? "Unknown"
    );

    const current =
      grouped.get(parent) ?? [];

    current.push(item);

    grouped.set(parent, current);
  });

  return [...grouped.entries()].map(
    ([parent, children]) => ({
      parent,

      children,
    })
  );
};

/* ==========================================================
   Group & Filter
========================================================== */

export const groupByFilter = <
  T extends object,
  K extends keyof T
>(
  data: T[],
  groupKey: K,
  predicate: (item: T) => boolean
): GroupByResult[] =>
  groupBy(
    data.filter(predicate),
    groupKey
  );

/* ==========================================================
   Stable Sort
========================================================== */

export const stableGroupSort = <
  T extends GroupByResult
>(
  groups: T[]
): T[] =>
  [...groups].sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }

    return a.key.localeCompare(b.key);
  });

/* ==========================================================
   Comparison Grouping
========================================================== */

export interface ComparisonGroupResult {
  key: string;

  leftCount: number;

  rightCount: number;

  difference: number;

  percentageDifference: number;
}

export const groupComparison = <
  T extends object,
  K extends keyof T
>(
  left: T[],
  right: T[],
  key: K
): ComparisonGroupResult[] => {
  const leftGroups = groupBy(
    left,
    key
  );

  const rightGroups = groupBy(
    right,
    key
  );

  const keys = new Set([
    ...leftGroups.map(
      (item) => item.key
    ),
    ...rightGroups.map(
      (item) => item.key
    ),
  ]);

  return [...keys]
    .map((groupKey) => {
      const leftItem =
        leftGroups.find(
          (item) =>
            item.key === groupKey
        );

      const rightItem =
        rightGroups.find(
          (item) =>
            item.key === groupKey
        );

      const leftCount =
        leftItem?.count ?? 0;

      const rightCount =
        rightItem?.count ?? 0;

      const difference =
        leftCount - rightCount;

      const percentageDifference =
        rightCount === 0
          ? leftCount === 0
            ? 0
            : 100
          : Number(
              (
                (difference /
                  rightCount) *
                100
              ).toFixed(1)
            );

      return {
        key: groupKey,

        leftCount,

        rightCount,

        difference,

        percentageDifference,
      };
    })
    .sort(
      (a, b) =>
        b.leftCount - a.leftCount
    );
};
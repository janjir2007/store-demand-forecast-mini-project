import { useCallback, useMemo, useState } from "react";
import type { SortState } from "../components/ui/DataTable";

export type SortValue = string | number | null;
export type Accessors<T> = Record<string, (row: T) => SortValue>;

/**
 * Client-side sorting for a table. The API returns whole collections and has no
 * ordering parameters, so sorting happens here over the already-filtered rows.
 */
export function useSortableRows<T>(rows: T[], accessors: Accessors<T>, initial: SortState) {
  const [sort, setSort] = useState<SortState>(initial);

  const toggleSort = useCallback((key: string) => {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : // Text reads best ascending, numbers most-interesting-first.
          { key, direction: "asc" },
    );
  }, []);

  const sorted = useMemo(() => {
    const accessor = accessors[sort.key];
    if (!accessor) return rows;
    const factor = sort.direction === "asc" ? 1 : -1;

    return [...rows].sort((a, b) => {
      const left = accessor(a);
      const right = accessor(b);
      // Missing values sink to the bottom regardless of direction.
      if (left === null && right === null) return 0;
      if (left === null) return 1;
      if (right === null) return -1;
      if (typeof left === "number" && typeof right === "number") return (left - right) * factor;
      return String(left).localeCompare(String(right)) * factor;
    });
  }, [rows, accessors, sort]);

  return { sorted, sort, toggleSort };
}

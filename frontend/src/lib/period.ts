import type { Sale } from "./types";

export type PeriodKey = "all" | "12m" | "6m" | "3m" | "custom";

export interface PeriodRange {
  from: string | null;
  to: string | null;
}

export interface CustomRange {
  from: string;
  to: string;
}

export const PERIOD_OPTIONS: { value: PeriodKey; label: string }[] = [
  { value: "all", label: "Бүх хугацаа" },
  { value: "12m", label: "12 сар" },
  { value: "6m", label: "6 сар" },
  { value: "3m", label: "3 сар" },
  { value: "custom", label: "Хугацаа сонгох" },
];

const WINDOW: Partial<Record<PeriodKey, number>> = { "12m": 12, "6m": 6, "3m": 3 };

/**
 * Resolves a period into a month range.
 *
 * Relative windows are anchored to the newest month present in the data rather
 * than today's date: sales are recorded monthly and may lag, so "last 3 months"
 * means the last three months that actually have data.
 */
export function resolvePeriod(
  monthsAscending: string[],
  period: PeriodKey,
  custom: CustomRange,
): PeriodRange {
  if (!monthsAscending.length) return { from: null, to: null };

  if (period === "custom") {
    const from = custom.from || monthsAscending[0];
    const to = custom.to || monthsAscending[monthsAscending.length - 1];
    // Tolerate the two selects being set the wrong way round.
    return from <= to ? { from, to } : { from: to, to: from };
  }

  const size = WINDOW[period];
  if (!size) return { from: monthsAscending[0], to: monthsAscending[monthsAscending.length - 1] };

  const window = monthsAscending.slice(-size);
  return { from: window[0], to: window[window.length - 1] };
}

export function filterSalesByRange(sales: Sale[], range: PeriodRange): Sale[] {
  if (!range.from || !range.to) return sales;
  return sales.filter((sale) => sale.sale_month >= range.from! && sale.sale_month <= range.to!);
}

/** Distinct sale months present in the data, oldest first. */
export function availableMonths(sales: Sale[]): string[] {
  return [...new Set(sales.map((sale) => sale.sale_month))].sort();
}

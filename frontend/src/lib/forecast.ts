import type { Prediction, Sale } from "./types";

export type DemandStatus = "high" | "stable" | "low" | "none" | "unknown";

export interface ForecastTarget {
  productId: number;
  /** Mean monthly units over the recent window, used to classify the prediction. */
  recentAverage: number;
}

export interface ForecastRow {
  prediction: Prediction;
  recentAverage: number;
  status: DemandStatus;
  /** Percentage change from the recent average, null when there is no baseline. */
  change: number | null;
  /** Latest recorded selling price for the product, null when never priced. */
  unitPrice: number | null;
  estimatedRevenue: number | null;
  /** False when the API's `observations` count means the model fell back to an average. */
  modelFitted: boolean;
}

/**
 * Below this the backend cannot fit its regression.
 *
 * `app/forecast.py` drops the first row when building lag features and requires
 * three training rows, so a series shorter than four months silently falls back
 * to a plain mean. `observations` is returned by /predict, so this is read off
 * the API rather than guessed.
 */
export const MIN_OBSERVATIONS_FOR_MODEL = 4;

/**
 * How far the forecast must sit from the recent average before it is called a
 * move. The backend returns no demand classification, so this is a presentation
 * convention only — it is user-selectable and the raw change is always shown
 * next to the label.
 */
export const SENSITIVITY_OPTIONS = [
  { value: "10", label: "±10%" },
  { value: "15", label: "±15%" },
  { value: "25", label: "±25%" },
] as const;

export type SensitivityKey = (typeof SENSITIVITY_OPTIONS)[number]["value"];
export const DEFAULT_SENSITIVITY: SensitivityKey = "15";

export function classifyDemand(
  predicted: number,
  recentAverage: number,
  sensitivity: SensitivityKey,
): DemandStatus {
  if (predicted === 0) return "none";
  if (recentAverage === 0) return "high";
  const band = Number(sensitivity) / 100;
  const ratio = predicted / recentAverage;
  if (ratio >= 1 + band) return "high";
  if (ratio <= 1 - band) return "low";
  return "stable";
}

export function percentChange(predicted: number, recentAverage: number): number | null {
  if (recentAverage === 0) return null;
  return ((predicted - recentAverage) / recentAverage) * 100;
}

export const STATUS_LABEL: Record<DemandStatus, string> = {
  high: "Эрэлт өндөр",
  stable: "Тогтвортой",
  low: "Эрэлт бага",
  none: "Эрэлт байхгүй",
  unknown: "Түүх хангалтгүй",
};

export const STATUS_TONE: Record<DemandStatus, "positive" | "neutral" | "negative"> = {
  high: "positive",
  stable: "neutral",
  low: "negative",
  none: "negative",
  unknown: "neutral",
};

export const RECOMMENDATION: Record<DemandStatus, string> = {
  high: "Импортын хэмжээг нэмэхийг зөвлөж байна",
  stable: "Одоогийн импортын хэмжээг хэвээр барина",
  low: "Импортын хэмжээг багасгах эсвэл дахин хянана",
  none: "Ирэх сард эрэлт таамаглагдаагүй — дахин хянана уу",
  unknown: "Түүх хангалтгүй тул зөвлөмж өгөх боломжгүй — гараар хянана уу",
};

/**
 * A demand status is only claimed when the backend actually fitted its model.
 *
 * Below MIN_OBSERVATIONS_FOR_MODEL the API returns the mean of a one- or
 * two-month series, and comparing that against a three-month window average
 * produces large percentage swings that say nothing about real demand. Those
 * rows are reported as unknown rather than given a confident label.
 */
function statusFor(
  prediction: { predicted_quantity: number; observations: number },
  recentAverage: number,
  sensitivity: SensitivityKey,
): DemandStatus {
  if (prediction.observations < MIN_OBSERVATIONS_FOR_MODEL) return "unknown";
  return classifyDemand(prediction.predicted_quantity, recentAverage, sensitivity);
}

/**
 * Most recent recorded selling price per product.
 *
 * The products table has no price column; `unit_price` lives on each sale. This
 * takes the quantity-weighted price from the latest month a product sold, which
 * is a recorded figure rather than an assumed catalogue price.
 */
export function latestUnitPrices(sales: Sale[]): Map<number, number> {
  const latestMonth = new Map<number, string>();
  for (const sale of sales) {
    if (sale.unit_price == null) continue;
    const current = latestMonth.get(sale.product_id);
    if (!current || sale.sale_month > current) latestMonth.set(sale.product_id, sale.sale_month);
  }

  const totals = new Map<number, { value: number; units: number }>();
  for (const sale of sales) {
    if (sale.unit_price == null) continue;
    if (sale.sale_month !== latestMonth.get(sale.product_id)) continue;
    const entry = totals.get(sale.product_id) ?? { value: 0, units: 0 };
    entry.value += sale.unit_price * sale.quantity;
    entry.units += sale.quantity;
    totals.set(sale.product_id, entry);
  }

  const prices = new Map<number, number>();
  for (const [productId, entry] of totals) {
    if (entry.units > 0) prices.set(productId, entry.value / entry.units);
  }
  return prices;
}

export function buildForecastRow(
  prediction: Prediction,
  recentAverage: number,
  sensitivity: SensitivityKey,
  unitPrice: number | null,
): ForecastRow {
  return {
    prediction,
    recentAverage,
    status: statusFor(prediction, recentAverage, sensitivity),
    change: percentChange(prediction.predicted_quantity, recentAverage),
    unitPrice,
    estimatedRevenue: unitPrice == null ? null : unitPrice * prediction.predicted_quantity,
    modelFitted: prediction.observations >= MIN_OBSERVATIONS_FOR_MODEL,
  };
}

/** Re-labels existing rows when the sensitivity changes, without re-calling the API. */
export function reclassify(rows: ForecastRow[], sensitivity: SensitivityKey): ForecastRow[] {
  return rows.map((row) => ({
    ...row,
    status: statusFor(row.prediction, row.recentAverage, sensitivity),
  }));
}

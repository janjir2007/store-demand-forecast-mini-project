import { api } from "../lib/api";
import { DEFAULT_SENSITIVITY, buildForecastRow } from "../lib/forecast";
import type { ForecastRow, ForecastTarget } from "../lib/forecast";
import { useAsync } from "./useAsync";

/**
 * Forecasts a small, fixed set of products automatically.
 *
 * Used by the Dashboard preview. `/predict` is one POST per product and each
 * call fits a model and writes a prediction_results row, so this deliberately
 * runs a short list sequentially rather than fanning out across the catalogue.
 * A product the API cannot forecast (no history) is skipped, not fatal.
 *
 * The Forecast page uses `useForecastRun` instead — same endpoint, but
 * user-triggered with progress and cancellation.
 */
export function useForecasts(targets: ForecastTarget[]) {
  const key = targets.map((target) => target.productId).join(",");

  return useAsync<ForecastRow[]>(async () => {
    const rows: ForecastRow[] = [];
    for (const target of targets) {
      try {
        const prediction = await api.predict(target.productId);
        // The preview shows no revenue, so no price is resolved here.
        rows.push(buildForecastRow(prediction, target.recentAverage, DEFAULT_SENSITIVITY, null));
      } catch {
        // A product without usable history simply drops out of the preview.
      }
    }
    return rows;
  }, [key]);
}

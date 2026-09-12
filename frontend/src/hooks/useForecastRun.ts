import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, api } from "../lib/api";
import { buildForecastRow } from "../lib/forecast";
import type { ForecastRow, ForecastTarget, SensitivityKey } from "../lib/forecast";

export type RunStatus = "idle" | "running" | "done" | "cancelled";

export interface Failure {
  productId: number;
  message: string;
}

export interface ForecastRunState {
  rows: ForecastRow[];
  status: RunStatus;
  completed: number;
  total: number;
  failures: Failure[];
  /** Set only when the run could not proceed at all. */
  error: string | null;
}

const IDLE: ForecastRunState = {
  rows: [],
  status: "idle",
  completed: 0,
  total: 0,
  failures: [],
  error: null,
};

/**
 * Runs `/predict` across a chosen set of products.
 *
 * The endpoint takes one product per call, fits a model server-side and writes
 * a prediction_results row, so calls are issued sequentially and only when the
 * user asks. Results stream in as they land, and the run can be cancelled.
 */
export function useForecastRun(
  sensitivity: SensitivityKey,
  priceFor: (productId: number) => number | null,
) {
  const [state, setState] = useState<ForecastRunState>(IDLE);
  const cancelled = useRef(false);
  const mounted = useRef(true);
  // Read at call time so a mid-run change does not restart the batch.
  const latest = useRef({ sensitivity, priceFor });
  latest.current = { sensitivity, priceFor };

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      cancelled.current = true;
    };
  }, []);

  const cancel = useCallback(() => {
    cancelled.current = true;
    setState((current) =>
      current.status === "running" ? { ...current, status: "cancelled" } : current,
    );
  }, []);

  const reset = useCallback(() => {
    cancelled.current = true;
    setState(IDLE);
  }, []);

  const run = useCallback(async (targets: ForecastTarget[]) => {
    cancelled.current = false;
    setState({ ...IDLE, status: "running", total: targets.length });

    for (const target of targets) {
      if (cancelled.current || !mounted.current) return;
      try {
        const prediction = await api.predict(target.productId);
        if (cancelled.current || !mounted.current) return;
        const row = buildForecastRow(
          prediction,
          target.recentAverage,
          latest.current.sensitivity,
          latest.current.priceFor(target.productId),
        );
        setState((current) => ({
          ...current,
          rows: [...current.rows, row],
          completed: current.completed + 1,
        }));
      } catch (caught) {
        if (cancelled.current || !mounted.current) return;
        // A product the model cannot handle is reported, not fatal to the batch.
        const message = caught instanceof ApiError ? caught.message : "Таамаглал гаргаж чадсангүй.";
        setState((current) => ({
          ...current,
          completed: current.completed + 1,
          failures: [...current.failures, { productId: target.productId, message }],
        }));
      }
    }

    if (!cancelled.current && mounted.current) {
      setState((current) => ({ ...current, status: "done" }));
    }
  }, []);

  return { ...state, run, cancel, reset };
}

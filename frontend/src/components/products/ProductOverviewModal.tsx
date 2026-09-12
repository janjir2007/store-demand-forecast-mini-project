import { useMemo, useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { EmptyState } from "../ui/States";
import { TrendChart } from "../charts/TrendChart";
import { ApiError, api } from "../../lib/api";
import { monthlyTotals } from "../../lib/analytics";
import { buildForecastRow, DEFAULT_SENSITIVITY, STATUS_LABEL, STATUS_TONE } from "../../lib/forecast";
import type { ForecastRow } from "../../lib/forecast";
import { formatCurrency, formatDate, formatMonth, formatNumber } from "../../lib/format";
import type { Product, Sale } from "../../lib/types";

interface ProductOverviewModalProps {
  product: Product | null;
  sales: Sale[];
  unitPrice: number | null;
  onClose: () => void;
}

/**
 * Lightweight per-product context: history from /sales, plus one optional
 * /predict call. Deliberately not a second Forecast page — the forecast is
 * user-triggered because each call writes a prediction_results row.
 */
export function ProductOverviewModal({
  product,
  sales,
  unitPrice,
  onClose,
}: ProductOverviewModalProps) {
  const [forecast, setForecast] = useState<ForecastRow | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const history = useMemo(() => {
    if (!product) return [];
    return monthlyTotals(sales.filter((sale) => sale.product_id === product.id));
  }, [product, sales]);

  const totals = useMemo(() => {
    const units = history.reduce((total, point) => total + point.quantity, 0);
    const revenue = history.reduce((total, point) => total + point.revenue, 0);
    const recent = history.slice(-3);
    const recentAverage = recent.length
      ? recent.reduce((total, point) => total + point.quantity, 0) / recent.length
      : 0;
    return { units, revenue, recentAverage, months: history.length };
  }, [history]);

  async function runForecast() {
    if (!product) return;
    setRunning(true);
    setError(null);
    try {
      const prediction = await api.predict(product.id);
      setForecast(buildForecastRow(prediction, totals.recentAverage, DEFAULT_SENSITIVITY, unitPrice));
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Таамаг гаргаж чадсангүй.");
    } finally {
      setRunning(false);
    }
  }

  function handleClose() {
    setForecast(null);
    setError(null);
    onClose();
  }

  return (
    <Modal
      open={product !== null}
      onClose={handleClose}
      title={product?.name ?? "Бүтээгдэхүүн"}
      description={
        product ? `Бүтээгдэхүүн #${product.id} · ${formatDate(product.created_at)}-нд бүртгэсэн` : undefined
      }
      size="lg"
      footer={
        <Button variant="ghost" onClick={handleClose}>
          Хаах
        </Button>
      }
    >
      <div className="overview">
        <dl className="overview__stats">
          <div>
            <dt>Борлуулсан тоо</dt>
            <dd>{formatNumber(totals.units)}</dd>
          </div>
          <div>
            <dt>Орлого</dt>
            <dd>{totals.revenue ? formatCurrency(totals.revenue) : "—"}</dd>
          </div>
          <div>
            <dt>Борлуулалттай сар</dt>
            <dd>{formatNumber(totals.months)}</dd>
          </div>
          <div>
            <dt>Сүүлийн зарсан үнэ</dt>
            <dd>{unitPrice == null ? "—" : formatCurrency(unitPrice)}</dd>
          </div>
        </dl>

        <section className="overview__section">
          <h3 className="overview__heading">Борлуулалтын түүх</h3>
          {history.length ? (
            <TrendChart
              data={history}
              series={[{ key: "quantity", label: "Ширхэг" }]}
              height="short"
            />
          ) : (
            <EmptyState
              title="Борлуулалт бүртгэгдээгүй"
              description="Энэ бүтээгдэхүүн борлуулалтын түүхгүй тул таамаглах боломжгүй."
            />
          )}
        </section>

        <section className="overview__section">
          <div className="overview__section-head">
            <h3 className="overview__heading">Сүүлийн таамаг</h3>
            {history.length > 0 && (
              <Button variant="secondary" size="sm" onClick={runForecast} loading={running}>
                {forecast ? "Дахин гаргах" : "Таамаг гаргах"}
              </Button>
            )}
          </div>

          {error && <p className="inline-error">{error}</p>}

          {forecast ? (
            <div className="overview__forecast">
              <div>
                <span className="overview__forecast-value">
                  {formatNumber(forecast.prediction.predicted_quantity)}
                </span>
                <span className="stat__unit">ширхэг</span>
                <span className="overview__forecast-month">
                  {formatMonth(forecast.prediction.forecast_month)}
                </span>
              </div>
              <div className="overview__forecast-meta">
                <Badge tone={STATUS_TONE[forecast.status]}>{STATUS_LABEL[forecast.status]}</Badge>
                <span className="cell-muted">
                  {forecast.prediction.model_name} · {forecast.prediction.observations} сарын түүх
                </span>
                {forecast.estimatedRevenue != null && (
                  <span className="cell-muted">
                    ≈ {formatCurrency(forecast.estimatedRevenue)} (сүүлийн үнээр)
                  </span>
                )}
              </div>
            </div>
          ) : (
            history.length > 0 && (
              <p className="overview__hint">
                Forecast хуудсанд ашигладаг таамаглалын API-г зөвхөн энэ бүтээгдэхүүн дээр ажиллуулна.
              </p>
            )
          )}
        </section>
      </div>
    </Modal>
  );
}

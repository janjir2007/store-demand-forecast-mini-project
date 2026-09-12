import { useCallback, useMemo, useState } from "react";
import { PageHeader } from "../components/layout/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ErrorState, EmptyState } from "../components/ui/States";
import { InsightBanner } from "../components/ui/InsightBanner";
import { IconRefresh } from "../components/ui/Icons";
import { ForecastControls, SCOPE_OPTIONS } from "../components/forecast/ForecastControls";
import type { ScopeKey } from "../components/forecast/ForecastControls";
import { ForecastSummaryCards } from "../components/forecast/ForecastSummaryCards";
import { ForecastChartCard } from "../components/forecast/ForecastChartCard";
import { ForecastTableCard } from "../components/forecast/ForecastTableCard";
import { useStoreData } from "../hooks/useStoreData";
import { useForecastRun } from "../hooks/useForecastRun";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { monthlyTotals, rollupByProduct } from "../lib/analytics";
import { DEFAULT_SENSITIVITY, latestUnitPrices, reclassify } from "../lib/forecast";
import type { ForecastTarget, SensitivityKey } from "../lib/forecast";
import { buildImportInsights } from "../lib/importInsights";

/** Window used to rank candidates and to judge whether a forecast is a move. */
const RECENT_MONTHS = 3;

export function ForecastPage() {
  useDocumentTitle("Forecast");
  const { data, loading, error, reload } = useStoreData();

  const [scope, setScope] = useState<ScopeKey>("10");
  const [sensitivity, setSensitivity] = useState<SensitivityKey>(DEFAULT_SENSITIVITY);
  const [selected, setSelected] = useState<number[]>([]);

  const prices = useMemo(() => latestUnitPrices(data?.sales ?? []), [data]);
  const priceFor = useCallback((productId: number) => prices.get(productId) ?? null, [prices]);

  const run = useForecastRun(sensitivity, priceFor);

  /** Products that have sales history, ranked by demand over the recent window. */
  const candidates = useMemo(() => {
    if (!data) return [];
    const monthly = monthlyTotals(data.sales);
    const recentMonths = new Set(monthly.slice(-RECENT_MONTHS).map((point) => point.month));
    const recent = data.sales.filter((sale) => recentMonths.has(sale.sale_month));

    const rollups = rollupByProduct(recent, []).map((entry) => ({
      ...entry,
      name: data.products.find((product) => product.id === entry.productId)?.name ?? entry.name,
    }));

    return rollups.sort((a, b) => b.quantity - a.quantity);
  }, [data]);

  const monthsInWindow = useMemo(() => {
    const monthly = monthlyTotals(data?.sales ?? []);
    return Math.max(1, monthly.slice(-RECENT_MONTHS).length);
  }, [data]);

  const targets = useMemo<ForecastTarget[]>(() => {
    const toTarget = (productId: number, units: number) => ({
      productId,
      recentAverage: units / monthsInWindow,
    });

    if (scope === "custom") {
      const byId = new Map(candidates.map((entry) => [entry.productId, entry]));
      return selected
        .map((productId) => byId.get(productId))
        .filter((entry): entry is (typeof candidates)[number] => Boolean(entry))
        .map((entry) => toTarget(entry.productId, entry.quantity));
    }

    return candidates
      .slice(0, Number(scope))
      .map((entry) => toTarget(entry.productId, entry.quantity));
  }, [scope, selected, candidates, monthsInWindow]);

  // Re-labelling is a display change; it must not re-run the predictions.
  const rows = useMemo(() => reclassify(run.rows, sensitivity), [run.rows, sensitivity]);
  const insights = useMemo(
    () => (run.status === "done" ? buildImportInsights(rows) : []),
    [rows, run.status],
  );

  const running = run.status === "running";
  const hasPrices = rows.some((row) => row.estimatedRevenue != null);
  const forecastMonth = rows[0]?.prediction.forecast_month ?? null;

  if (error && !loading) {
    return (
      <div className="page">
        <PageHeader
          title="Forecast"
          description="Ирэх сарын эрэлтийг таамаглаж, нөөцөө нэмэх эсвэл багасгах шаардлагатай бүтээгдэхүүнийг тодорхойлно."
        />
        <Card>
          <ErrorState message={error} onRetry={reload} />
        </Card>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        title="Forecast"
        description="Ирэх сарын эрэлтийг таамаглаж, нөөцөө нэмэх эсвэл багасгах шаардлагатай бүтээгдэхүүнийг тодорхойлно."
        actions={
          <Button
            variant="secondary"
            icon={<IconRefresh size={14} />}
            onClick={reload}
            loading={loading}
            disabled={running}
          >
            Мэдээлэл шинэчлэх
          </Button>
        }
      />

      <ForecastControls
        scope={scope}
        onScopeChange={(next) => {
          setScope(next);
          run.reset();
        }}
        sensitivity={sensitivity}
        onSensitivityChange={setSensitivity}
        candidates={candidates}
        selected={selected}
        onSelectedChange={setSelected}
        targetCount={targets.length}
        status={run.status}
        completed={run.completed}
        total={run.total}
        onRun={() => run.run(targets)}
        onCancel={run.cancel}
        disabled={loading || candidates.length === 0}
      />

      <ForecastSummaryCards rows={rows} running={running} forecastMonth={forecastMonth} />

      {run.status === "cancelled" && rows.length === 0 && (
        <Card>
          <EmptyState
            title="Таамаг цуцлагдлаа"
            description="Таамаглал хадгалагдаагүй. Бэлэн болмогцоо дахин ажиллуулна уу."
          />
        </Card>
      )}

      {insights.length > 0 && <InsightBanner eyebrow="Импортын шийдвэрийн санал" insights={insights} />}

      <ForecastChartCard rows={rows} running={running} />

      <ForecastTableCard
        rows={rows}
        running={running}
        hasPrices={hasPrices}
        failures={run.failures.length}
      />

      {!loading && candidates.length === 0 && (
        <Card>
          <EmptyState
            title="Таамаглах боломжтой бүтээгдэхүүн алга"
            description="Загварт борлуулалтын түүх шаардлагатай ба мэдээллийн санд борлуулалт бүртгэгдээгүй байна."
          />
        </Card>
      )}

      {/* SCOPE_OPTIONS is the single source of truth for the preset labels. */}
      <p className="page-note">
        Бэлэн сонголтууд нь сүүлийн {monthsInWindow} сарын борлуулсан тоогоор эрэмбэлдэг. Таамаг
        бүр нь API-д нэг удаа хандах тул олон бүтээгдэхүүн сонгох тусам удаан болно. Тодорхой
        бүтээгдэхүүн таамаглахыг хүсвэл <em>{SCOPE_OPTIONS[3].label}</em> сонгоно уу.
      </p>
    </div>
  );
}

import { useMemo } from "react";
import { PageHeader } from "../components/layout/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ErrorState } from "../components/ui/States";
import { IconRefresh } from "../components/ui/Icons";
import { SummaryCards } from "../components/dashboard/SummaryCards";
import { MonthlyTrendCard } from "../components/charts/MonthlyTrendCard";
import { TopProductsCard } from "../components/dashboard/TopProductsCard";
import { ForecastPreviewCard } from "../components/dashboard/ForecastPreviewCard";
import { InsightBanner, InsightBannerSkeleton } from "../components/ui/InsightBanner";
import { useStoreData } from "../hooks/useStoreData";
import { useForecasts } from "../hooks/useForecasts";
import type { ForecastTarget } from "../lib/forecast";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { momChange, monthRange, monthlyTotals, rollupByProduct, sum } from "../lib/analytics";
import { buildInsights } from "../lib/insights";
import { formatMonth } from "../lib/format";

/** Each forecast is a POST that fits a model server-side, so the preview stays short. */
const FORECAST_COUNT = 5;
/** Window used both to rank forecast candidates and to judge whether demand is moving. */
const RECENT_MONTHS = 3;
const TOP_PRODUCTS = 5;

export function DashboardPage() {
  useDocumentTitle("Dashboard");
  const { data, loading, error, reload } = useStoreData();

  const model = useMemo(() => {
    if (!data) return null;

    const monthly = monthlyTotals(data.sales);
    const rollups = rollupByProduct(data.sales, data.products);
    const ranked = [...rollups].sort((a, b) => b.quantity - a.quantity);
    const range = monthRange(data.sales);
    const recentMonths = monthly.slice(-RECENT_MONTHS).map((point) => point.month);

    // Rank forecast candidates on recent demand rather than lifetime totals —
    // next month is better predicted by what is selling now.
    const recentUnits = new Map<number, number>();
    for (const sale of data.sales) {
      if (!recentMonths.includes(sale.sale_month)) continue;
      recentUnits.set(sale.product_id, (recentUnits.get(sale.product_id) ?? 0) + sale.quantity);
    }

    const forecastTargets: ForecastTarget[] = [...recentUnits.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, FORECAST_COUNT)
      .map(([productId, units]) => ({
        productId,
        recentAverage: units / Math.max(1, recentMonths.length),
      }));

    return {
      monthly,
      range,
      forecastTargets,
      topProducts: ranked.slice(0, TOP_PRODUCTS),
      insights: buildInsights(monthly, rollups, data.sales),
      summary: {
        totalUnits: sum(monthly.map((point) => point.quantity)),
        totalRevenue: sum(monthly.map((point) => point.revenue)),
        unitsDelta: momChange(monthly, "quantity"),
        revenueDelta: momChange(monthly, "revenue"),
        latest: monthly[monthly.length - 1] ?? null,
        monthCount: range.count,
        bestSeller: ranked[0]?.quantity ? ranked[0] : null,
      },
    };
  }, [data]);

  const {
    data: forecastRows,
    loading: forecastLoading,
    error: forecastError,
    reload: reloadForecasts,
  } = useForecasts(model?.forecastTargets ?? []);

  const forecastSummary = useMemo(() => {
    if (!forecastRows?.length) return null;
    return {
      total: sum(forecastRows.map((row) => row.prediction.predicted_quantity)),
      month: forecastRows[0].prediction.forecast_month,
      products: forecastRows.length,
    };
  }, [forecastRows]);

  const subtitle =
    model?.range.first && model.range.last
      ? `${formatMonth(model.range.first)} – ${formatMonth(model.range.last)} · ${model.range.count} сарын борлуулалтын мэдээлэл`
      : "Бизнесийн ерөнхий тойм";

  // A failed load leaves nothing worth rendering underneath, so it takes over.
  if (error && !loading) {
    return (
      <div className="page">
        <PageHeader title="Dashboard" description="Бизнесийн ерөнхий тойм" />
        <Card>
          <ErrorState message={error} onRetry={reload} />
        </Card>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        title="Dashboard"
        description={subtitle}
        actions={
          <Button variant="secondary" icon={<IconRefresh size={14} />} onClick={reload} loading={loading}>
            Шинэчлэх
          </Button>
        }
      />

      <SummaryCards
        loading={loading}
        summary={model?.summary ?? null}
        forecast={forecastSummary}
        forecastLoading={forecastLoading}
      />

      {loading ? <InsightBannerSkeleton /> : <InsightBanner insights={model?.insights ?? []} />}

      <div className="grid grid--split">
        <MonthlyTrendCard
          title="Борлуулалтын хандлага"
          subtitle="Бүх бүтээгдэхүүний сар тутмын нийлбэр"
          monthly={model?.monthly ?? []}
          loading={loading}
          error={error}
          onRetry={reload}
        />
        <TopProductsCard
          products={model?.topProducts ?? []}
          loading={loading}
          error={error}
          onRetry={reload}
        />
      </div>

      <ForecastPreviewCard
        rows={forecastRows ?? []}
        loading={loading || forecastLoading}
        error={forecastError}
        onRetry={reloadForecasts}
      />
    </div>
  );
}

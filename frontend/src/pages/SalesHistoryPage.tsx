import { useMemo, useState } from "react";
import { PageHeader } from "../components/layout/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ErrorState } from "../components/ui/States";
import { IconRefresh } from "../components/ui/Icons";
import { PeriodFilter } from "../components/sales/PeriodFilter";
import { SalesSummaryCards } from "../components/sales/SalesSummaryCards";
import type { SalesSummary } from "../components/sales/SalesSummaryCards";
import { MonthlyTrendCard } from "../components/charts/MonthlyTrendCard";
import { SalesByProductCard } from "../components/sales/SalesByProductCard";
import { SalesTableCard } from "../components/sales/SalesTableCard";
import type { SaleRow } from "../components/sales/SalesTableCard";
import { useStoreData } from "../hooks/useStoreData";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { momChange, monthlyTotals, rollupByProduct, sum } from "../lib/analytics";
import { availableMonths, filterSalesByRange, resolvePeriod } from "../lib/period";
import type { CustomRange, PeriodKey } from "../lib/period";
import { formatMonth } from "../lib/format";

export function SalesHistoryPage() {
  useDocumentTitle("Sales History");
  const { data, loading, error, reload, productsById } = useStoreData();

  const [period, setPeriod] = useState<PeriodKey>("all");
  const [custom, setCustom] = useState<CustomRange>({ from: "", to: "" });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const months = useMemo(() => availableMonths(data?.sales ?? []), [data]);
  const range = useMemo(() => resolvePeriod(months, period, custom), [months, period, custom]);

  const model = useMemo(() => {
    if (!data) return null;

    const inPeriod = filterSalesByRange(data.sales, range);
    const monthly = monthlyTotals(inPeriod);
    const rollups = rollupByProduct(inPeriod, []).sort((a, b) => b.quantity - a.quantity);
    const totalUnits = sum(inPeriod.map((sale) => sale.quantity));
    const pricedUnits = sum(inPeriod.filter((sale) => sale.unit_price != null).map((sale) => sale.quantity));

    // rollupByProduct is given no catalogue here so it only reports products that
    // actually sold in the period; names are patched in from the products map.
    const named = rollups.map((entry) => ({
      ...entry,
      name: productsById.get(entry.productId)?.name ?? entry.name,
    }));

    const summary: SalesSummary = {
      totalRevenue: sum(monthly.map((point) => point.revenue)),
      totalUnits,
      bestSeller: named[0]?.quantity ? named[0] : null,
      productsSold: named.length,
      catalogueSize: data.products.length,
      monthCount: monthly.length,
      unitsDelta: momChange(monthly, "quantity"),
      latestMonth: monthly[monthly.length - 1]?.month ?? null,
      pricedShare: totalUnits > 0 ? pricedUnits / totalUnits : 1,
    };

    const term = search.trim().toLowerCase();
    const tableRows: SaleRow[] = inPeriod
      .map((sale) => ({
        ...sale,
        productName: productsById.get(sale.product_id)?.name ?? `Product #${sale.product_id}`,
        lineTotal: sale.unit_price == null ? null : sale.quantity * sale.unit_price,
      }))
      .filter((row) => !term || row.productName.toLowerCase().includes(term));

    return { monthly, products: named, summary, tableRows };
  }, [data, range, search, productsById]);

  function changePeriod(next: PeriodKey) {
    // Seed the custom selects from whatever range is on screen.
    if (next === "custom" && !custom.from && range.from && range.to) {
      setCustom({ from: range.from, to: range.to });
    }
    setPeriod(next);
    setPage(0);
  }

  const rangeLabel =
    range.from && range.to
      ? range.from === range.to
        ? formatMonth(range.from)
        : `${formatMonth(range.from)} – ${formatMonth(range.to)}`
      : "Борлуулалтын мэдээлэл алга";

  // Nothing below is meaningful without the data, so a failed load takes over.
  if (error && !loading) {
    return (
      <div className="page">
        <PageHeader title="Sales History" description="Борлуулалтын түүхийг харах, шинжлэх." />
        <Card>
          <ErrorState message={error} onRetry={reload} />
        </Card>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        title="Sales History"
        description="Борлуулалтын түүхийг харах, шинжлэх."
        actions={
          <Button variant="secondary" icon={<IconRefresh size={14} />} onClick={reload} loading={loading}>
            Шинэчлэх
          </Button>
        }
      />

      <Card>
        <PeriodFilter
          period={period}
          onPeriodChange={changePeriod}
          custom={custom}
          onCustomChange={(next) => {
            setCustom(next);
            setPage(0);
          }}
          months={months}
          disabled={loading}
        />
      </Card>

      <SalesSummaryCards loading={loading} summary={model?.summary ?? null} />

      <MonthlyTrendCard
        title="Сар тутмын борлуулалт"
        subtitle={rangeLabel}
        monthly={model?.monthly ?? []}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyTitle="Энэ хугацаанд борлуулалт алга"
        emptyDescription="Хугацааг өргөжүүлж хандлагыг харна уу."
      />

      <SalesByProductCard
        products={model?.products ?? []}
        loading={loading}
        error={error}
        onRetry={reload}
      />

      <SalesTableCard
        rows={model?.tableRows ?? []}
        loading={loading}
        error={error}
        onRetry={reload}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(0);
        }}
        page={page}
        onPageChange={setPage}
      />
    </div>
  );
}

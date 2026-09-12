import { StatCard, StatCardSkeleton } from "../ui/StatCard";
import { DeltaBadge } from "../ui/Badge";
import { formatCurrency, formatMonth, formatNumber } from "../../lib/format";
import type { ProductRollup } from "../../lib/analytics";

export interface SalesSummary {
  totalRevenue: number;
  totalUnits: number;
  bestSeller: ProductRollup | null;
  productsSold: number;
  catalogueSize: number;
  monthCount: number;
  /** Null unless the period holds at least two months to compare. */
  unitsDelta: number | null;
  latestMonth: string | null;
  pricedShare: number;
}

export function SalesSummaryCards({
  loading,
  summary,
}: {
  loading: boolean;
  summary: SalesSummary | null;
}) {
  if (loading || !summary) {
    return (
      <div className="grid grid--stats">
        {Array.from({ length: 4 }, (_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid--stats">
      <StatCard
        label="Нийт борлуулалт"
        value={formatCurrency(summary.totalRevenue)}
        foot={
          summary.pricedShare < 1 ? (
            <>Нэгж үнэ бүртгэгдсэн: {(summary.pricedShare * 100).toFixed(0)}%</>
          ) : (
            <>{summary.monthCount} сарын хугацаанд</>
          )
        }
      />

      <StatCard
        label="Нийт борлуулсан тоо"
        value={formatNumber(summary.totalUnits)}
        foot={
          summary.latestMonth ? (
            <>
              <DeltaBadge value={summary.unitsDelta} />
              {formatMonth(summary.latestMonth)} · өмнөх сартай харьцуулбал
            </>
          ) : (
            <>сонгосон хугацаанд мэдээлэл алга</>
          )
        }
      />

      <StatCard
        label="Хамгийн их борлуулалттай бүтээгдэхүүн"
        value={
          summary.bestSeller ? (
            <span className="stat__value--text" title={summary.bestSeller.name}>
              {summary.bestSeller.name}
            </span>
          ) : (
            "—"
          )
        }
        foot={
          summary.bestSeller ? (
            <>Энэ хугацаанд {formatNumber(summary.bestSeller.quantity)} ширхэг</>
          ) : (
            <>энэ хугацаанд борлуулалт алга</>
          )
        }
      />

      <StatCard
        label="Борлуулалттай бүтээгдэхүүн"
        value={formatNumber(summary.productsSold)}
        foot={<>нийт {formatNumber(summary.catalogueSize)} бүтээгдэхүүнээс</>}
      />
    </div>
  );
}

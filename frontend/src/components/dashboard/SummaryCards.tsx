import { DeltaBadge } from "../ui/Badge";
import { StatCard, StatCardSkeleton } from "../ui/StatCard";
import { formatCurrency, formatMonth, formatNumber } from "../../lib/format";
import type { MonthlyPoint, ProductRollup } from "../../lib/analytics";

export interface SummaryModel {
  totalUnits: number;
  totalRevenue: number;
  unitsDelta: number | null;
  revenueDelta: number | null;
  latest: MonthlyPoint | null;
  monthCount: number;
  bestSeller: ProductRollup | null;
}

interface SummaryCardsProps {
  loading: boolean;
  summary: SummaryModel | null;
  /** Forecast totals arrive separately — the card shows its own pending state. */
  forecast: { total: number; month: string | null; products: number } | null;
  forecastLoading: boolean;
}

export function SummaryCards({ loading, summary, forecast, forecastLoading }: SummaryCardsProps) {
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
        foot={<>{summary.monthCount} сарын хугацаанд {formatNumber(summary.totalUnits)} ширхэг</>}
      />

      <StatCard
        label="Өмнөх сартай харьцуулбал"
        value={
          summary.latest ? (
            <>
              {formatNumber(summary.latest.quantity)}
              <span className="stat__unit">ширхэг</span>
            </>
          ) : (
            "—"
          )
        }
        foot={
          <>
            <DeltaBadge value={summary.unitsDelta} />
            {summary.latest ? formatMonth(summary.latest.month) : "мэдээлэл байхгүй"}
          </>
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
            <>
              {formatNumber(summary.bestSeller.quantity)} ширхэг ·{" "}
              {formatCurrency(summary.bestSeller.revenue)}
            </>
          ) : (
            <>борлуулалт бүртгэгдээгүй</>
          )
        }
      />

      <StatCard
        label={forecast?.month ? `Таамаг · ${formatMonth(forecast.month)}` : "Ирэх сарын таамаг"}
        value={
          forecastLoading ? (
            <span className="skeleton" style={{ display: "block", width: 96, height: 26 }} />
          ) : forecast && forecast.products > 0 ? (
            <>
              {formatNumber(forecast.total)}
              <span className="stat__unit">ширхэг</span>
            </>
          ) : (
            "—"
          )
        }
        foot={
          forecastLoading ? (
            <>таамаглаж байна…</>
          ) : forecast && forecast.products > 0 ? (
            <>шилдэг {forecast.products} бүтээгдэхүүнээр</>
          ) : (
            <>таамаг гараагүй байна</>
          )
        }
      />
    </div>
  );
}

import { StatCard, StatCardSkeleton } from "../ui/StatCard";
import { formatCurrency, formatMonth, formatNumber } from "../../lib/format";
import type { ForecastRow } from "../../lib/forecast";

interface ForecastSummaryCardsProps {
  rows: ForecastRow[];
  running: boolean;
  forecastMonth: string | null;
}

export function ForecastSummaryCards({ rows, running, forecastMonth }: ForecastSummaryCardsProps) {
  if (!rows.length) {
    return running ? (
      <div className="grid grid--stats">
        {Array.from({ length: 4 }, (_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
    ) : null;
  }

  const totalUnits = rows.reduce((total, row) => total + row.prediction.predicted_quantity, 0);
  const priced = rows.filter((row) => row.estimatedRevenue != null);
  const revenue = priced.reduce((total, row) => total + (row.estimatedRevenue ?? 0), 0);
  const high = rows.filter((row) => row.status === "high").length;
  const low = rows.filter((row) => row.status === "low" || row.status === "none").length;
  const month = forecastMonth ? formatMonth(forecastMonth) : "ирэх сар";

  return (
    <div className="grid grid--stats">
      <StatCard
        label="Таамагласан нийт тоо"
        value={
          <>
            {formatNumber(totalUnits)}
            <span className="stat__unit">ширхэг</span>
          </>
        }
        foot={
          <>
            {month} · {formatNumber(rows.length)} бүтээгдэхүүн
          </>
        }
      />

      {/* Prices come from recorded sales, so this card only appears when they exist. */}
      {priced.length > 0 && (
        <StatCard
          label="Таамагласан орлого"
          value={formatCurrency(revenue)}
          foot={
            <>
              орлого (ашиг биш) ·{" "}
              {priced.length === rows.length
                ? "сүүлийн бүртгэгдсэн үнээр"
                : `${formatNumber(rows.length)}-аас ${formatNumber(priced.length)} нь үнэтэй`}
            </>
          }
        />
      )}

      <StatCard
        label="Эрэлт өндөр бүтээгдэхүүн"
        value={formatNumber(high)}
        foot={<>сүүлийн дунджаасаа дээгүүр таамаглагдсан</>}
      />

      <StatCard
        label="Эрэлт бага бүтээгдэхүүн"
        value={formatNumber(low)}
        foot={<>сүүлийн дунджаасаа доогуур таамаглагдсан</>}
      />
    </div>
  );
}

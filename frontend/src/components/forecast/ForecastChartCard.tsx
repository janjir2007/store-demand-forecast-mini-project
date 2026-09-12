import { Card } from "../ui/Card";
import { AsyncSection, LoadingChart } from "../ui/States";
import { RankBarChart } from "../charts/RankBarChart";
import { formatNumber } from "../../lib/format";
import type { ForecastRow } from "../../lib/forecast";

interface ForecastChartCardProps {
  rows: ForecastRow[];
  running: boolean;
}

/** Predicted quantity per product, highest first. */
export function ForecastChartCard({ rows, running }: ForecastChartCardProps) {
  const ranked = [...rows]
    .filter((row) => row.prediction.predicted_quantity > 0)
    .sort((a, b) => b.prediction.predicted_quantity - a.prediction.predicted_quantity);

  return (
    <Card
      title="Бүтээгдэхүүнээрх таамагласан эрэлт"
      subtitle="Таамагласан тоогоор эрэмбэлсэн"
      flush
    >
      <AsyncSection
        loading={running && rows.length === 0}
        error={null}
        isEmpty={ranked.length === 0}
        emptyTitle={rows.length ? "Эерэг таамаг байхгүй" : "Таамаг хараахан гараагүй"}
        emptyDescription={
          rows.length
            ? "Таамагласан бүх бүтээгдэхүүн ирэх сард огт борлогдохгүй гэж гарлаа."
            : "Бүтээгдэхүүнүүдийг харьцуулахын тулд таамаг гаргана уу."
        }
        skeleton={<LoadingChart />}
      >
        <div className="card__chart">
          <RankBarChart
            valueLabel="Таамагласан тоо"
            valueFormatter={(value) => `${formatNumber(value)} ширхэг`}
            data={ranked.map((row) => ({
              label: row.prediction.product_name,
              value: row.prediction.predicted_quantity,
            }))}
          />
        </div>
      </AsyncSection>
    </Card>
  );
}

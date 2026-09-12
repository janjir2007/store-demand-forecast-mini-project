import { Link } from "react-router-dom";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { AsyncSection } from "../ui/States";
import { DataTable } from "../ui/DataTable";
import type { Column } from "../ui/DataTable";
import { formatMonth, formatNumber } from "../../lib/format";
import { STATUS_LABEL, STATUS_TONE } from "../../lib/forecast";
import type { ForecastRow } from "../../lib/forecast";

interface ForecastPreviewCardProps {
  rows: ForecastRow[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function ForecastPreviewCard({ rows, loading, error, onRetry }: ForecastPreviewCardProps) {
  const month = rows[0]?.prediction.forecast_month;

  const columns: Column<ForecastRow>[] = [
    {
      key: "product",
      header: "Бүтээгдэхүүн",
      render: (row) => <span className="cell-strong">{row.prediction.product_name}</span>,
    },
    {
      key: "predicted",
      header: "Таамагласан тоо",
      align: "right",
      render: (row) => formatNumber(row.prediction.predicted_quantity),
    },
    {
      key: "recent",
      header: "Сүүлийн саруудын дундаж",
      align: "right",
      render: (row) => <span className="cell-muted">{formatNumber(row.recentAverage, 1)}</span>,
    },
    {
      key: "status",
      header: "Эрэлт",
      align: "right",
      render: (row) => <Badge tone={STATUS_TONE[row.status]}>{STATUS_LABEL[row.status]}</Badge>,
    },
  ];

  return (
    <Card
      title="Ирэх сарын таамаг"
      subtitle={
        month
          ? `${formatMonth(month)} · одоогийн тэргүүлэгч бүтээгдэхүүний таамаг`
          : "Одоогийн тэргүүлэгч бүтээгдэхүүний таамаг"
      }
      flush
      actions={
        <Link className="btn btn--ghost btn--sm" to="/forecast">
          Бусад бүтээгдэхүүн таамаглах
        </Link>
      }
    >
      <AsyncSection
        loading={loading}
        error={error}
        onRetry={onRetry}
        isEmpty={rows.length === 0}
        emptyTitle="Таамаг гараагүй байна"
        emptyDescription="Тэргүүлэгч бүтээгдэхүүнүүдийн аль нь ч загвар ажиллуулах хангалттай түүхгүй байна."
      >
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.prediction.product_id}
          caption="Тэргүүлэгч бүтээгдэхүүний ирэх сарын таамаг"
        />
      </AsyncSection>
    </Card>
  );
}

import { useMemo } from "react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { DataTable } from "../ui/DataTable";
import type { Column } from "../ui/DataTable";
import { AsyncSection, LoadingRows } from "../ui/States";
import { useSortableRows } from "../../hooks/useSortableRows";
import type { Accessors } from "../../hooks/useSortableRows";
import { formatCurrency, formatMonth, formatNumber } from "../../lib/format";
import { RECOMMENDATION, STATUS_LABEL, STATUS_TONE } from "../../lib/forecast";
import type { ForecastRow } from "../../lib/forecast";

interface ForecastTableCardProps {
  rows: ForecastRow[];
  running: boolean;
  hasPrices: boolean;
  failures: number;
}

export function ForecastTableCard({ rows, running, hasPrices, failures }: ForecastTableCardProps) {
  const accessors = useMemo<Accessors<ForecastRow>>(
    () => ({
      product: (row) => row.prediction.product_name,
      predicted: (row) => row.prediction.predicted_quantity,
      recent: (row) => row.recentAverage,
      change: (row) => row.change,
      status: (row) => STATUS_LABEL[row.status],
      revenue: (row) => row.estimatedRevenue,
    }),
    [],
  );

  const { sorted, sort, toggleSort } = useSortableRows(rows, accessors, {
    key: "predicted",
    direction: "desc",
  });

  const columns: Column<ForecastRow>[] = [
    {
      key: "product",
      header: "Бүтээгдэхүүн",
      sortable: true,
      render: (row) => (
        <span className="forecast-cell-product">
          <span className="cell-strong">{row.prediction.product_name}</span>
          {!row.modelFitted && (
            <span
              className="forecast-flag"
              title={`API нь ${row.prediction.observations} сарын түүх байгааг мэдээлсэн. Загвар тохируулахад шаардлагатай 4 сараас бага тул энгийн дундаж утга буцаасан.`}
            >
              {row.prediction.observations} сарын түүх
            </span>
          )}
        </span>
      ),
    },
    {
      key: "predicted",
      header: "Таамагласан тоо",
      align: "right",
      sortable: true,
      render: (row) => (
        <span className="cell-strong">{formatNumber(row.prediction.predicted_quantity)}</span>
      ),
    },
    {
      key: "recent",
      header: "Сүүлийн саруудын дундаж",
      align: "right",
      sortable: true,
      render: (row) => <span className="cell-muted">{formatNumber(row.recentAverage, 1)}</span>,
    },
    {
      key: "change",
      header: "Өөрчлөлт",
      align: "right",
      sortable: true,
      render: (row) =>
        row.change === null ? (
          <span className="cell-muted">—</span>
        ) : (
          <span className={row.change >= 0 ? "delta delta--up" : "delta delta--down"}>
            {row.change > 0 ? "+" : ""}
            {row.change.toFixed(0)}%
          </span>
        ),
    },
    {
      key: "status",
      header: "Эрэлтийн төлөв",
      sortable: true,
      render: (row) => <Badge tone={STATUS_TONE[row.status]}>{STATUS_LABEL[row.status]}</Badge>,
    },
    ...(hasPrices
      ? [
          {
            key: "revenue",
            header: "Таамаглах орлого",
            align: "right" as const,
            sortable: true,
            render: (row: ForecastRow) =>
              row.estimatedRevenue == null ? (
                <span className="cell-muted">—</span>
              ) : (
                formatCurrency(row.estimatedRevenue)
              ),
          },
        ]
      : []),
    {
      key: "recommendation",
      header: "Импортын зөвлөмж",
      render: (row) => <span className="cell-muted cell-wrap">{RECOMMENDATION[row.status]}</span>,
    },
  ];

  const month = rows[0]?.prediction.forecast_month;
  const model = rows[0]?.prediction.model_name;

  return (
    <Card
      title="Бүтээгдэхүүний таамаг"
      subtitle={
        month
          ? `Таамаглах сар: ${formatMonth(month)} · ${model}${hasPrices ? " · орлогыг сүүлийн бүртгэгдсэн үнээр тооцов" : ""}`
          : "Хүснэгтийг дүүргэхийн тулд таамаг гаргана уу"
      }
      flush
    >
      <AsyncSection
        loading={running && rows.length === 0}
        error={null}
        isEmpty={rows.length === 0}
        emptyTitle="Таамаг хараахан гараагүй"
        emptyDescription="Дээрээс таамаглах бүтээгдэхүүнээ сонгоод таамаг гаргана уу."
        skeleton={<LoadingRows rows={8} />}
      >
        <>
          <DataTable
            columns={columns}
            rows={sorted}
            rowKey={(row) => row.prediction.product_id}
            caption="Бүтээгдэхүүн тус бүрийн таамагласан эрэлт"
            sort={sort}
            onSortChange={toggleSort}
          />
          {failures > 0 && (
            <p className="table-foot">
              {formatNumber(failures)} бүтээгдэхүүнийг таамаглаж чадсангүй — борлуулалтын түүхгүй
              бүтээгдэхүүнийг API хүлээж авдаггүй.
            </p>
          )}
        </>
      </AsyncSection>
    </Card>
  );
}

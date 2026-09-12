import { useMemo } from "react";
import { Card } from "../ui/Card";
import { TextField } from "../ui/Field";
import { DataTable, TablePager } from "../ui/DataTable";
import type { Column } from "../ui/DataTable";
import { AsyncSection, LoadingRows } from "../ui/States";
import { useSortableRows } from "../../hooks/useSortableRows";
import type { Accessors } from "../../hooks/useSortableRows";
import { formatCurrency, formatMonthShort, formatNumber } from "../../lib/format";
import type { Sale } from "../../lib/types";

const PAGE_SIZE = 12;

export interface SaleRow extends Sale {
  productName: string;
  lineTotal: number | null;
}

interface SalesTableCardProps {
  rows: SaleRow[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  page: number;
  onPageChange: (page: number) => void;
}

/** Columns map one-to-one onto the fields `/sales` actually returns. */
export function SalesTableCard({
  rows,
  loading,
  error,
  onRetry,
  search,
  onSearchChange,
  page,
  onPageChange,
}: SalesTableCardProps) {
  const accessors = useMemo<Accessors<SaleRow>>(
    () => ({
      month: (row) => row.sale_month,
      product: (row) => row.productName,
      quantity: (row) => row.quantity,
      price: (row) => row.unit_price,
      total: (row) => row.lineTotal,
    }),
    [],
  );

  const { sorted, sort, toggleSort } = useSortableRows(rows, accessors, {
    key: "month",
    direction: "desc",
  });

  const pageRows = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const columns: Column<SaleRow>[] = [
    { key: "month", header: "Сар", sortable: true, render: (row) => formatMonthShort(row.sale_month) },
    {
      key: "product",
      header: "Бүтээгдэхүүн",
      sortable: true,
      render: (row) => <span className="cell-strong">{row.productName}</span>,
    },
    {
      key: "quantity",
      header: "Ширхэг",
      align: "right",
      sortable: true,
      render: (row) => formatNumber(row.quantity),
    },
    {
      key: "price",
      header: "Нэгж үнэ",
      align: "right",
      sortable: true,
      render: (row) =>
        row.unit_price == null ? <span className="cell-muted">—</span> : formatCurrency(row.unit_price),
    },
    {
      key: "total",
      header: "Дүн",
      align: "right",
      sortable: true,
      render: (row) =>
        row.lineTotal == null ? <span className="cell-muted">—</span> : formatCurrency(row.lineTotal),
    },
  ];

  return (
    <Card
      title="Борлуулалтын бүртгэл"
      subtitle={`Энэ хугацаанд ${formatNumber(sorted.length)} мөр`}
      flush
      actions={
        <TextField
          className="field--compact"
          value={search}
          placeholder="Бүтээгдэхүүн хайх…"
          aria-label="Бүтээгдэхүүний нэрээр хайх"
          onChange={(event) => onSearchChange(event.target.value)}
        />
      }
    >
      <AsyncSection
        loading={loading}
        error={error}
        onRetry={onRetry}
        isEmpty={sorted.length === 0}
        emptyTitle={search ? "Хайлтад тохирох бүртгэл олдсонгүй" : "Энэ хугацаанд борлуулалт алга"}
        emptyDescription={
          search ? "Өөр нэрээр хайж үзнэ үү." : "Илүү өргөн хугацаа сонгож үзнэ үү."
        }
        skeleton={<LoadingRows rows={8} />}
      >
        <>
          <DataTable
            columns={columns}
            rows={pageRows}
            rowKey={(row) => row.id}
            caption="Борлуулалтын бүртгэл"
            sort={sort}
            onSortChange={toggleSort}
          />
          <TablePager page={page} pageSize={PAGE_SIZE} total={sorted.length} onChange={onPageChange} />
        </>
      </AsyncSection>
    </Card>
  );
}

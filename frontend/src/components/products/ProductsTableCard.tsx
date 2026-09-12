import { useMemo } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { TextField } from "../ui/Field";
import { DataTable, TablePager } from "../ui/DataTable";
import type { Column } from "../ui/DataTable";
import { AsyncSection, LoadingRows } from "../ui/States";
import { IconEdit, IconSearch, IconTrash } from "../ui/Icons";
import { useSortableRows } from "../../hooks/useSortableRows";
import type { Accessors } from "../../hooks/useSortableRows";
import { formatCurrency, formatDate, formatMonthShort, formatNumber } from "../../lib/format";
import type { ProductRow } from "../../lib/products";

const PAGE_SIZE = 12;

interface ProductsTableCardProps {
  rows: ProductRow[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  onView: (row: ProductRow) => void;
  onEdit: (row: ProductRow) => void;
  onDelete: (row: ProductRow) => void;
  totalProducts: number;
}

export function ProductsTableCard({
  rows,
  loading,
  error,
  onRetry,
  search,
  onSearchChange,
  page,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  totalProducts,
}: ProductsTableCardProps) {
  const accessors = useMemo<Accessors<ProductRow>>(
    () => ({
      name: (row) => row.product.name,
      units: (row) => row.quantity,
      revenue: (row) => row.revenue,
      price: (row) => row.latestPrice,
      last: (row) => row.lastMonth,
      added: (row) => row.product.created_at,
    }),
    [],
  );

  const { sorted, sort, toggleSort } = useSortableRows(rows, accessors, {
    key: "units",
    direction: "desc",
  });
  const pageRows = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const columns: Column<ProductRow>[] = [
    {
      key: "name",
      header: "Бүтээгдэхүүн",
      sortable: true,
      render: (row) => (
        <button className="link-cell" onClick={() => onView(row)} title="Бүтээгдэхүүний тоймыг харах">
          <span className="cell-strong">{row.product.name}</span>
          <span className="id-chip">#{row.product.id}</span>
        </button>
      ),
    },
    {
      key: "units",
      header: "Борлуулсан тоо",
      align: "right",
      sortable: true,
      render: (row) =>
        row.quantity ? formatNumber(row.quantity) : <span className="cell-muted">0</span>,
    },
    {
      key: "revenue",
      header: "Орлого",
      align: "right",
      sortable: true,
      render: (row) =>
        row.revenue ? formatCurrency(row.revenue) : <span className="cell-muted">—</span>,
    },
    {
      key: "price",
      header: "Сүүлийн үнэ",
      align: "right",
      sortable: true,
      render: (row) =>
        row.latestPrice == null ? (
          <span className="cell-muted">—</span>
        ) : (
          formatCurrency(row.latestPrice)
        ),
    },
    {
      key: "last",
      header: "Сүүлд зарагдсан",
      sortable: true,
      render: (row) =>
        row.lastMonth ? formatMonthShort(row.lastMonth) : <span className="cell-muted">Хэзээ ч үгүй</span>,
    },
    {
      key: "added",
      header: "Бүртгэсэн",
      sortable: true,
      render: (row) => <span className="cell-muted">{formatDate(row.product.created_at)}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      width: 92,
      render: (row) => (
        <div className="row-actions">
          <Button
            variant="ghost"
            size="sm"
            aria-label={`${row.product.name} засах`}
            icon={<IconEdit />}
            onClick={() => onEdit(row)}
          />
          <Button
            variant="ghost"
            size="sm"
            danger
            aria-label={`${row.product.name} устгах`}
            icon={<IconTrash />}
            onClick={() => onDelete(row)}
          />
        </div>
      ),
    },
  ];

  return (
    <Card
      title="Бүтээгдэхүүний жагсаалт"
      subtitle={
        search
          ? `${formatNumber(totalProducts)} бүтээгдэхүүнээс ${formatNumber(sorted.length)} нь тохирлоо`
          : `Нийт ${formatNumber(totalProducts)} бүтээгдэхүүн`
      }
      flush
      actions={
        <TextField
          className="field--compact"
          value={search}
          placeholder="Нэрээр хайх…"
          aria-label="Бүтээгдэхүүнийг нэрээр хайх"
          onChange={(event) => onSearchChange(event.target.value)}
        />
      }
    >
      <AsyncSection
        loading={loading}
        error={error}
        onRetry={onRetry}
        isEmpty={sorted.length === 0}
        emptyTitle={search ? "Хайлтад тохирох бүтээгдэхүүн олдсонгүй" : "Бүтээгдэхүүн байхгүй байна"}
        emptyDescription={
          search ? "Өөр нэрээр хайж үзнэ үү." : "Эхний бүтээгдэхүүнээ нэмнэ үү."
        }
        skeleton={<LoadingRows rows={8} />}
      >
        <>
          <DataTable
            columns={columns}
            rows={pageRows}
            rowKey={(row) => row.product.id}
            caption="Бүтээгдэхүүн"
            sort={sort}
            onSortChange={toggleSort}
          />
          <TablePager
            page={page}
            pageSize={PAGE_SIZE}
            total={sorted.length}
            onChange={onPageChange}
          />
        </>
      </AsyncSection>
      {!loading && !error && sorted.length === 0 && search && (
        <p className="table-foot">
          <IconSearch size={13} /> Хайлт зөвхөн бүтээгдэхүүний нэрээр ажиллана — API өөр хайх
          боломжтой талбар хадгалдаггүй.
        </p>
      )}
    </Card>
  );
}

import { useMemo, useState } from "react";
import { PageHeader } from "../components/layout/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { StatCard, StatCardSkeleton } from "../components/ui/StatCard";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { ToastStack } from "../components/ui/ToastStack";
import { ErrorState } from "../components/ui/States";
import { IconRefresh } from "../components/ui/Icons";
import { ProductsTableCard } from "../components/products/ProductsTableCard";
import { ProductFormModal } from "../components/products/ProductFormModal";
import { ProductOverviewModal } from "../components/products/ProductOverviewModal";
import { useStoreData } from "../hooks/useStoreData";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useToast } from "../hooks/useToast";
import { ApiError, api } from "../lib/api";
import { buildProductRows, salesCountFor } from "../lib/products";
import type { ProductRow } from "../lib/products";
import { formatCurrency, formatNumber } from "../lib/format";
import type { Product } from "../lib/types";

type Dialog =
  | { kind: "none" }
  | { kind: "add" }
  | { kind: "edit"; product: Product }
  | { kind: "delete"; row: ProductRow };

export function ProductsPage() {
  useDocumentTitle("Products");
  const { data, loading, error, reload } = useStoreData();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [dialog, setDialog] = useState<Dialog>({ kind: "none" });
  const [viewing, setViewing] = useState<ProductRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  const rows = useMemo(
    () => (data ? buildProductRows(data.products, data.sales) : []),
    [data],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? rows.filter((row) => row.product.name.toLowerCase().includes(term)) : rows;
  }, [rows, search]);

  /** Lower-cased name → id, for duplicate detection before the request. */
  const existingNames = useMemo(
    () => new Map(rows.map((row) => [row.product.name.toLowerCase(), row.product.id])),
    [rows],
  );

  const summary = useMemo(() => {
    const withSales = rows.filter((row) => row.quantity > 0);
    return {
      total: rows.length,
      withSales: withSales.length,
      neverSold: rows.length - withSales.length,
      units: rows.reduce((sum, row) => sum + row.quantity, 0),
      revenue: rows.reduce((sum, row) => sum + row.revenue, 0),
    };
  }, [rows]);

  function closeDialog() {
    setDialog({ kind: "none" });
    setDialogError(null);
  }

  async function submit(action: () => Promise<unknown>, message: string) {
    setBusy(true);
    setDialogError(null);
    try {
      await action();
      reload();
      closeDialog();
      toast.success(message);
    } catch (caught) {
      const text = caught instanceof ApiError ? caught.message : "Өөрчлөлтийг хадгалж чадсангүй.";
      setDialogError(text);
      toast.error(text);
    } finally {
      setBusy(false);
    }
  }

  if (error && !loading) {
    return (
      <div className="page">
        <PageHeader
          title="Products"
          description="Борлуулалтын таамаглалын системд ашиглагдаж буй бүтээгдэхүүнийг харах, удирдах."
        />
        <Card>
          <ErrorState message={error} onRetry={reload} />
        </Card>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        title="Products"
        description="Борлуулалтын таамаглалын системд ашиглагдаж буй бүтээгдэхүүнийг харах, удирдах."
        actions={
          <>
            <Button
              variant="secondary"
              icon={<IconRefresh size={14} />}
              onClick={reload}
              loading={loading}
            >
              Шинэчлэх
            </Button>
            <Button variant="primary" onClick={() => setDialog({ kind: "add" })} disabled={loading}>
              Бүтээгдэхүүн нэмэх
            </Button>
          </>
        }
      />

      <div className="grid grid--stats">
        {loading ? (
          Array.from({ length: 4 }, (_, index) => <StatCardSkeleton key={index} />)
        ) : (
          <>
            <StatCard label="Нийт бүтээгдэхүүн" value={formatNumber(summary.total)} />
            <StatCard
              label="Борлуулалттай"
              value={formatNumber(summary.withSales)}
              foot={<>{formatNumber(summary.neverSold)} нь огт зарагдаагүй</>}
            />
            <StatCard label="Нийт борлуулсан тоо" value={formatNumber(summary.units)} />
            <StatCard label="Нийт орлого" value={formatCurrency(summary.revenue)} />
          </>
        )}
      </div>

      <ProductsTableCard
        rows={filtered}
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
        onView={setViewing}
        onEdit={(row) => setDialog({ kind: "edit", product: row.product })}
        onDelete={(row) => setDialog({ kind: "delete", row })}
        totalProducts={rows.length}
      />

      <ProductFormModal
        open={dialog.kind === "add" || dialog.kind === "edit"}
        product={dialog.kind === "edit" ? dialog.product : null}
        existingNames={existingNames}
        busy={busy}
        serverError={dialogError}
        onClose={closeDialog}
        onSubmit={(name) => {
          if (dialog.kind === "edit") {
            const { id } = dialog.product;
            submit(() => api.updateProduct(id, name), `Нэрийг "${name}" болгож өөрчиллөө.`);
          } else {
            submit(() => api.createProduct(name), `"${name}" нэмэгдлээ.`);
          }
        }}
      />

      <ConfirmDialog
        open={dialog.kind === "delete"}
        title="Бүтээгдэхүүн устгах"
        confirmLabel="Бүрмөсөн устгах"
        busy={busy}
        error={dialogError}
        onCancel={closeDialog}
        onConfirm={() => {
          if (dialog.kind !== "delete") return;
          const { product } = dialog.row;
          submit(() => api.deleteProduct(product.id), `"${product.name}" устгагдлаа.`);
        }}
      >
        {dialog.kind === "delete" && (
          <>
            <p>
              <strong>{dialog.row.product.name}</strong>-г устгах уу?
            </p>
            <p className="confirm__warning">
              Мэдээллийн сан нь бүтээгдэхүүнийг устгахдаа түүний борлуулалтыг хамт устгадаг тул энэ
              бүтээгдэхүүний{" "}
              <strong>
                {formatNumber(salesCountFor(dialog.row.product.id, data?.sales ?? []))} борлуулалтын
                бүртгэл
              </strong>{" "}
              мөн устана. Бусад хуудасны нийт дүн болон таамаг өөрчлөгдөнө.
            </p>
            <p className="cell-muted">Энэ үйлдлийг системээс буцаах боломжгүй.</p>
          </>
        )}
      </ConfirmDialog>

      <ProductOverviewModal
        product={viewing?.product ?? null}
        sales={data?.sales ?? []}
        unitPrice={viewing?.latestPrice ?? null}
        onClose={() => setViewing(null)}
      />

      <ToastStack toasts={toast.toasts} onDismiss={toast.dismiss} />
    </div>
  );
}

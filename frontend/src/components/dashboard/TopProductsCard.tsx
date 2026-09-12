import { Link } from "react-router-dom";
import { Card } from "../ui/Card";
import { AsyncSection, LoadingChart } from "../ui/States";
import { RankBarChart } from "../charts/RankBarChart";
import { formatNumber } from "../../lib/format";
import type { ProductRollup } from "../../lib/analytics";

interface TopProductsCardProps {
  products: ProductRollup[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function TopProductsCard({ products, loading, error, onRetry }: TopProductsCardProps) {
  return (
    <Card
      title="Тэргүүлэгч бүтээгдэхүүн"
      subtitle="Бүх хугацааны борлуулсан тоогоор"
      flush
      actions={
        <Link className="btn btn--ghost btn--sm" to="/products">
          Бүгдийг харах
        </Link>
      }
    >
      <AsyncSection
        loading={loading}
        error={error}
        onRetry={onRetry}
        isEmpty={!products.some((entry) => entry.quantity > 0)}
        emptyTitle="Бүтээгдэхүүний борлуулалт байхгүй"
        emptyDescription="Борлуулалт бүртгэгдсэний дараа эрэмбэ харагдана."
        skeleton={<LoadingChart />}
      >
        <div className="card__chart">
          <RankBarChart
            valueLabel="Ширхэг"
            valueFormatter={(value) => `${formatNumber(value)} ширхэг`}
            data={products.map((entry) => ({ label: entry.name, value: entry.quantity }))}
          />
        </div>
      </AsyncSection>
    </Card>
  );
}

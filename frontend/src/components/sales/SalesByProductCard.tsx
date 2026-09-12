import { useState } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { SegmentedControl } from "../ui/SegmentedControl";
import { AsyncSection, LoadingChart } from "../ui/States";
import { RankBarChart } from "../charts/RankBarChart";
import { formatCurrency, formatNumber } from "../../lib/format";
import type { ProductRollup } from "../../lib/analytics";

type Measure = "quantity" | "revenue";

const STEP = 10;

interface SalesByProductCardProps {
  /** Already sorted highest-first by units. */
  products: ProductRollup[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

/**
 * Ranked horizontal bars. The catalogue runs to hundreds of products, so this
 * shows a slice and grows on demand rather than rendering an unreadable wall.
 */
export function SalesByProductCard({ products, loading, error, onRetry }: SalesByProductCardProps) {
  const [measure, setMeasure] = useState<Measure>("quantity");
  const [visible, setVisible] = useState(STEP);

  const ranked = [...products]
    .filter((entry) => entry[measure] > 0)
    .sort((a, b) => b[measure] - a[measure]);
  const shown = ranked.slice(0, visible);
  const format = measure === "revenue" ? formatCurrency : (value: number) => `${formatNumber(value)} ширхэг`;

  return (
    <Card
      title="Бүтээгдэхүүнээр"
      subtitle={
        ranked.length > shown.length
          ? `Борлуулалттай ${formatNumber(ranked.length)} бүтээгдэхүүнээс эхний ${shown.length}`
          : `Борлуулалттай ${formatNumber(ranked.length)} бүтээгдэхүүн`
      }
      flush
      actions={
        <SegmentedControl
          ariaLabel="Эрэмбэлэх үзүүлэлт"
          value={measure}
          onChange={(next) => {
            setMeasure(next);
            setVisible(STEP);
          }}
          segments={[
            { value: "quantity", label: "Ширхэг" },
            { value: "revenue", label: "Орлого" },
          ]}
        />
      }
    >
      <AsyncSection
        loading={loading}
        error={error}
        onRetry={onRetry}
        isEmpty={ranked.length === 0}
        emptyTitle="Энэ хугацаанд борлуулалт алга"
        emptyDescription="Хугацааг өргөжүүлж эрэмбийг харна уу."
        skeleton={<LoadingChart />}
      >
        <>
          <div className="card__chart">
            <RankBarChart
              valueLabel={measure === "revenue" ? "Орлого" : "Ширхэг"}
              valueFormatter={format}
              data={shown.map((entry) => ({ label: entry.name, value: entry[measure] }))}
            />
          </div>
          {ranked.length > shown.length && (
            <div className="card__footer-action">
              <Button variant="ghost" size="sm" onClick={() => setVisible((count) => count + STEP)}>
                Дараагийн {Math.min(STEP, ranked.length - shown.length)}-г харах
              </Button>
            </div>
          )}
        </>
      </AsyncSection>
    </Card>
  );
}

import { useState } from "react";
import { Card } from "../ui/Card";
import { SegmentedControl } from "../ui/SegmentedControl";
import { AsyncSection, LoadingChart } from "../ui/States";
import { TrendChart } from "./TrendChart";
import { formatCurrency, formatNumber } from "../../lib/format";
import type { MonthlyPoint } from "../../lib/analytics";

type Measure = "quantity" | "revenue";

interface MonthlyTrendCardProps {
  title: string;
  subtitle: string;
  monthly: MonthlyPoint[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

/** Monthly units or revenue over time. Shared by the Dashboard and Sales History. */
export function MonthlyTrendCard({
  title,
  subtitle,
  monthly,
  loading,
  error,
  onRetry,
  emptyTitle = "Борлуулалт бүртгэгдээгүй байна",
  emptyDescription = "Мэдээллийн санд борлуулалт бүртгэгдсэний дараа хандлага харагдана.",
}: MonthlyTrendCardProps) {
  const [measure, setMeasure] = useState<Measure>("quantity");

  return (
    <Card
      title={title}
      subtitle={subtitle}
      flush
      actions={
        <SegmentedControl
          ariaLabel="Графикт харуулах үзүүлэлт"
          value={measure}
          onChange={setMeasure}
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
        isEmpty={monthly.length === 0}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        skeleton={<LoadingChart />}
      >
        <div className="card__chart">
          <TrendChart
            data={monthly}
            series={[{ key: measure, label: measure === "quantity" ? "Ширхэг" : "Орлого" }]}
            valueFormatter={measure === "revenue" ? formatCurrency : (value) => formatNumber(value)}
          />
        </div>
      </AsyncSection>
    </Card>
  );
}

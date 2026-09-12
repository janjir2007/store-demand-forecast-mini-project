import type { ReactNode } from "react";

type Tone = "neutral" | "positive" | "negative" | "brand";

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

/** Renders a month-over-month delta, or a dash when there is nothing to compare. */
export function DeltaBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="cell-muted">—</span>;
  const tone = value > 0 ? "positive" : value < 0 ? "negative" : "neutral";
  return (
    <Badge tone={tone}>
      {value > 0 ? "▲" : value < 0 ? "▼" : "•"} {Math.abs(value).toFixed(1)}%
    </Badge>
  );
}

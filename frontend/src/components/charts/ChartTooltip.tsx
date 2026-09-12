import type { TooltipProps } from "recharts";
import { formatNumber } from "../../lib/format";

interface Props extends TooltipProps<number, string> {
  labelFormatter?: (label: string) => string;
  valueFormatter?: (value: number, key: string) => string;
}

export function ChartTooltip({ active, payload, label, labelFormatter, valueFormatter }: Props) {
  if (!active || !payload?.length) return null;

  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__label">{labelFormatter ? labelFormatter(String(label)) : String(label)}</p>
      {payload.map((entry) => (
        <div key={String(entry.dataKey)} className="chart-tooltip__row">
          <span className="chart-tooltip__dot" style={{ background: entry.color }} />
          <span>{entry.name}</span>
          <span className="chart-tooltip__value">
            {valueFormatter
              ? valueFormatter(Number(entry.value), String(entry.dataKey))
              : formatNumber(Number(entry.value))}
          </span>
        </div>
      ))}
    </div>
  );
}

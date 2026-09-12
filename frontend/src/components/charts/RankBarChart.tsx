import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART, SERIES } from "./chartTheme";
import { ChartTooltip } from "./ChartTooltip";
import { formatNumber } from "../../lib/format";

export interface RankDatum {
  label: string;
  value: number;
}

/** Horizontal bars — magnitude compared across named products. */
export function RankBarChart({
  data,
  valueLabel,
  valueFormatter,
}: {
  data: RankDatum[];
  valueLabel: string;
  valueFormatter?: (value: number) => string;
}) {
  return (
    <div className="chart" style={{ height: Math.max(180, data.length * 34 + 30) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 20, bottom: 0, left: 8 }} barCategoryGap={6}>
          <CartesianGrid stroke={CHART.grid} horizontal={false} />
          <XAxis
            type="number"
            tick={CHART.tick}
            tickLine={false}
            axisLine={{ stroke: CHART.grid }}
            tickFormatter={(value: number) => formatNumber(value)}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={CHART.tick}
            tickLine={false}
            axisLine={false}
            width={168}
            // Product names run long; the tooltip still carries the full name.
            tickFormatter={(label: string) => (label.length > 26 ? `${label.slice(0, 25)}…` : label)}
          />
          <Tooltip
            cursor={{ fill: "rgba(160, 86, 31, 0.06)" }}
            content={
              <ChartTooltip
                valueFormatter={(value) => (valueFormatter ? valueFormatter(value) : formatNumber(value))}
              />
            }
          />
          <Bar
            dataKey="value"
            name={valueLabel}
            fill={SERIES[0]}
            radius={[0, 4, 4, 0]}
            maxBarSize={18}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART, SERIES } from "./chartTheme";
import { ChartTooltip } from "./ChartTooltip";
import { ChartLegend } from "./Legend";
import { formatMonthAxis, formatMonth, formatNumber } from "../../lib/format";

export interface TrendSeries {
  key: string;
  label: string;
  /** Dashed marks read as projected rather than observed. */
  dashed?: boolean;
}

interface TrendChartProps {
  data: object[];
  series: TrendSeries[];
  height?: "default" | "short";
  valueFormatter?: (value: number) => string;
}

export function TrendChart({ data, series, height = "default", valueFormatter }: TrendChartProps) {
  const items = series.map((entry, index) => ({ label: entry.label, color: SERIES[index % SERIES.length] }));

  return (
    <>
      <ChartLegend items={items} />
      <div className={`chart ${height === "short" ? "chart--short" : ""}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={CHART.margin}>
            <CartesianGrid stroke={CHART.grid} vertical={false} />
            <XAxis
              dataKey="month"
              tickFormatter={formatMonthAxis}
              tick={CHART.tick}
              tickLine={false}
              axisLine={{ stroke: CHART.grid }}
              tickMargin={8}
              minTickGap={12}
            />
            <YAxis
              tick={CHART.tick}
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={(value: number) => formatNumber(value)}
            />
            <Tooltip
              cursor={{ stroke: CHART.axis, strokeWidth: 1, strokeDasharray: "3 3" }}
              content={
                <ChartTooltip
                  labelFormatter={formatMonth}
                  valueFormatter={(value) => (valueFormatter ? valueFormatter(value) : formatNumber(value))}
                />
              }
            />
            {series.map((entry, index) => (
              <Line
                key={entry.key}
                type="monotone"
                dataKey={entry.key}
                name={entry.label}
                stroke={SERIES[index % SERIES.length]}
                strokeWidth={2}
                strokeDasharray={entry.dashed ? "5 4" : undefined}
                dot={{ r: 3, strokeWidth: 2, fill: CHART.surface }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: CHART.surface }}
                connectNulls
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

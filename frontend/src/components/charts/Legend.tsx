export interface LegendItem {
  label: string;
  color: string;
}

/** Identity is never carried by color alone — every multi-series chart gets this. */
export function ChartLegend({ items }: { items: LegendItem[] }) {
  if (items.length < 2) return null;
  return (
    <div className="legend">
      {items.map((item) => (
        <span key={item.label} className="legend__item">
          <span className="legend__swatch" style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

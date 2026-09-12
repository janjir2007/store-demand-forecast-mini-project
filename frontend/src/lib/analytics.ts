import type { Product, Sale } from "./types";

export interface MonthlyPoint {
  month: string;
  quantity: number;
  revenue: number;
}

export interface ProductRollup {
  productId: number;
  name: string;
  quantity: number;
  revenue: number;
  months: number;
  lastMonth: string | null;
  avgPrice: number | null;
}

/** The backend exposes no aggregate endpoints, so overview figures are derived here. */
export function monthlyTotals(sales: Sale[]): MonthlyPoint[] {
  const buckets = new Map<string, MonthlyPoint>();
  for (const sale of sales) {
    const point = buckets.get(sale.sale_month) ?? { month: sale.sale_month, quantity: 0, revenue: 0 };
    point.quantity += sale.quantity;
    point.revenue += sale.quantity * (sale.unit_price ?? 0);
    buckets.set(sale.sale_month, point);
  }
  return [...buckets.values()].sort((a, b) => a.month.localeCompare(b.month));
}

interface Accumulator {
  productId: number;
  name: string;
  quantity: number;
  revenue: number;
  months: Set<string>;
  lastMonth: string | null;
  pricedQuantity: number;
}

function blank(productId: number, name: string): Accumulator {
  return {
    productId,
    name,
    quantity: 0,
    revenue: 0,
    months: new Set<string>(),
    lastMonth: null,
    pricedQuantity: 0,
  };
}

export function rollupByProduct(sales: Sale[], products: Product[]): ProductRollup[] {
  const names = new Map(products.map((product) => [product.id, product.name]));
  const buckets = new Map<number, Accumulator>();

  // Products with no sales still belong in the list.
  for (const product of products) {
    buckets.set(product.id, blank(product.id, product.name));
  }

  for (const sale of sales) {
    let entry = buckets.get(sale.product_id);
    if (!entry) {
      entry = blank(sale.product_id, names.get(sale.product_id) ?? `Product #${sale.product_id}`);
      buckets.set(sale.product_id, entry);
    }
    entry.quantity += sale.quantity;
    entry.months.add(sale.sale_month);
    if (sale.unit_price != null) {
      entry.revenue += sale.quantity * sale.unit_price;
      entry.pricedQuantity += sale.quantity;
    }
    if (!entry.lastMonth || sale.sale_month > entry.lastMonth) entry.lastMonth = sale.sale_month;
  }

  return [...buckets.values()].map((entry) => ({
    productId: entry.productId,
    name: entry.name,
    quantity: entry.quantity,
    revenue: entry.revenue,
    months: entry.months.size,
    lastMonth: entry.lastMonth,
    avgPrice: entry.pricedQuantity > 0 ? entry.revenue / entry.pricedQuantity : null,
  }));
}

/** Percentage change between the two most recent months, null when undefined. */
export function momChange(points: MonthlyPoint[], key: "quantity" | "revenue" = "quantity"): number | null {
  if (points.length < 2) return null;
  const previous = points[points.length - 2][key];
  const latest = points[points.length - 1][key];
  if (previous === 0) return null;
  return ((latest - previous) / previous) * 100;
}

export function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function average(values: number[]): number {
  return values.length ? sum(values) / values.length : 0;
}

export function monthRange(sales: Sale[]): { first: string | null; last: string | null; count: number } {
  const months = [...new Set(sales.map((sale) => sale.sale_month))].sort();
  return { first: months[0] ?? null, last: months[months.length - 1] ?? null, count: months.length };
}

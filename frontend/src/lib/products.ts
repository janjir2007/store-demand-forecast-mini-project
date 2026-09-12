import type { Product, Sale } from "./types";
import { latestUnitPrices } from "./forecast";

/**
 * A product plus the sales context derived for it.
 *
 * The products table holds only id, name and created_at, so everything else
 * here is aggregated from /sales rather than read off the product record.
 */
export interface ProductRow {
  product: Product;
  quantity: number;
  revenue: number;
  months: number;
  lastMonth: string | null;
  latestPrice: number | null;
}

export function buildProductRows(products: Product[], sales: Sale[]): ProductRow[] {
  const prices = latestUnitPrices(sales);
  const stats = new Map<number, { quantity: number; revenue: number; months: Set<string>; last: string | null }>();

  for (const sale of sales) {
    const entry = stats.get(sale.product_id) ?? {
      quantity: 0,
      revenue: 0,
      months: new Set<string>(),
      last: null,
    };
    entry.quantity += sale.quantity;
    entry.revenue += sale.quantity * (sale.unit_price ?? 0);
    entry.months.add(sale.sale_month);
    if (!entry.last || sale.sale_month > entry.last) entry.last = sale.sale_month;
    stats.set(sale.product_id, entry);
  }

  return products.map((product) => {
    const entry = stats.get(product.id);
    return {
      product,
      quantity: entry?.quantity ?? 0,
      revenue: entry?.revenue ?? 0,
      months: entry?.months.size ?? 0,
      lastMonth: entry?.last ?? null,
      latestPrice: prices.get(product.id) ?? null,
    };
  });
}

/** Sales rows that would be removed along with a product (delete cascades). */
export function salesCountFor(productId: number, sales: Sale[]): number {
  return sales.filter((sale) => sale.product_id === productId).length;
}

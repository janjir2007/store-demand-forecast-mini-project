import type { MonthlyPoint, ProductRollup } from "./analytics";
import { average } from "./analytics";
import { formatMonth, formatNumber } from "./format";
import type { Sale } from "./types";

export type InsightTone = "positive" | "negative" | "neutral";

export interface Insight {
  id: string;
  tone: InsightTone;
  title: string;
  detail: string;
}

/** A trend is only called out once it clears the noise floor. */
const TREND_THRESHOLD = 8;
/** Share of the latest month a product must hold to count as a standout. */
const STANDOUT_SHARE = 0.15;
/** Below this lifetime volume a product going quiet is not worth reporting. */
const ATTENTION_MIN_UNITS = 3;
/** Leading a field of one or two is not a standout, so require a real field. */
const STANDOUT_MIN_FIELD = 3;

/**
 * Derives insights that the data actually supports. Every branch is gated on
 * having enough history — when nothing clears the bar the caller gets an empty
 * list and shows nothing rather than a filler headline.
 */
export function buildInsights(
  monthly: MonthlyPoint[],
  rollups: ProductRollup[],
  sales: Sale[],
): Insight[] {
  const insights: Insight[] = [];
  const momentum = momentumInsight(monthly);
  if (momentum) insights.push(momentum);

  const standout = standoutInsight(monthly, sales, rollups);
  if (standout) insights.push(standout);

  const attention = attentionInsight(monthly, sales, rollups);
  if (attention) insights.push(attention);

  return insights.slice(0, 3);
}

/** Recent three months against the three before them. Needs 4+ months. */
function momentumInsight(monthly: MonthlyPoint[]): Insight | null {
  if (monthly.length < 4) return null;

  const quantities = monthly.map((point) => point.quantity);
  const recent = quantities.slice(-3);
  const prior = quantities.slice(-6, -3);
  if (!prior.length) return null;

  const priorAverage = average(prior);
  if (priorAverage === 0) return null;

  const change = ((average(recent) - priorAverage) / priorAverage) * 100;
  const window = `${formatMonth(monthly[monthly.length - recent.length].month)} – ${formatMonth(
    monthly[monthly.length - 1].month,
  )}`;

  if (change >= TREND_THRESHOLD) {
    return {
      id: "momentum-up",
      tone: "positive",
      title: `Борлуулалт өсч байна — ${change.toFixed(0)}% өссөн`,
      detail: `${window} хугацаанд сард дунджаар ${formatNumber(average(recent), 1)} ширхэг зарагдсан нь өмнөх 3 сарын ${formatNumber(priorAverage, 1)}-тай харьцуулахад өндөр байна.`,
    };
  }
  if (change <= -TREND_THRESHOLD) {
    return {
      id: "momentum-down",
      tone: "negative",
      title: `Борлуулалт буурч байна — ${Math.abs(change).toFixed(0)}% буурсан`,
      detail: `${window} хугацаанд сард дунджаар ${formatNumber(average(recent), 1)} ширхэг зарагдсан нь өмнөх 3 сарын ${formatNumber(priorAverage, 1)}-тай харьцуулахад бага байна.`,
    };
  }
  return {
    id: "momentum-flat",
    tone: "neutral",
    title: "Борлуулалт тогтвортой байна",
    detail: `Сүүлийн 3 сар нь өмнөх 3 сараас ${TREND_THRESHOLD}%-иас бага зөрүүтэй, сард дунджаар ${formatNumber(average(recent), 1)} ширхэг байна.`,
  };
}

/** A product carrying an unusually large share of the most recent month. */
function standoutInsight(
  monthly: MonthlyPoint[],
  sales: Sale[],
  rollups: ProductRollup[],
): Insight | null {
  const latest = monthly[monthly.length - 1];
  if (!latest || latest.quantity === 0) return null;

  const byProduct = unitsInMonth(sales, latest.month);
  if (byProduct.size < STANDOUT_MIN_FIELD) return null;
  const names = new Map(rollups.map((entry) => [entry.productId, entry.name]));

  let leaderId: number | null = null;
  let leaderUnits = 0;
  for (const [productId, units] of byProduct) {
    if (units > leaderUnits) {
      leaderId = productId;
      leaderUnits = units;
    }
  }
  if (leaderId === null) return null;

  const share = leaderUnits / latest.quantity;
  if (share < STANDOUT_SHARE) return null;

  return {
    id: `standout-${leaderId}`,
    tone: "positive",
    title: `${names.get(leaderId) ?? `Бүтээгдэхүүн #${leaderId}`} сайн борлогдож байна`,
    detail: `${formatMonth(latest.month)}д ${formatNumber(leaderUnits)} ширхэг зарагдсан нь тухайн сарын нийт борлуулалтын ${(share * 100).toFixed(0)}% юм.`,
  };
}

/** A product with real history that sold nothing in the latest month. */
function attentionInsight(
  monthly: MonthlyPoint[],
  sales: Sale[],
  rollups: ProductRollup[],
): Insight | null {
  const latest = monthly[monthly.length - 1];
  if (!latest || monthly.length < 3) return null;

  const soldLatest = unitsInMonth(sales, latest.month);
  const candidates = rollups.filter(
    (entry) =>
      entry.quantity >= ATTENTION_MIN_UNITS &&
      entry.months >= 2 &&
      !soldLatest.has(entry.productId) &&
      entry.lastMonth !== null &&
      entry.lastMonth < latest.month,
  );
  if (!candidates.length) return null;

  const worst = candidates.reduce((best, entry) => (entry.quantity > best.quantity ? entry : best));
  return {
    id: `attention-${worst.productId}`,
    tone: "negative",
    title: `${worst.name} анхаарал шаардаж магадгүй`,
    detail: `${worst.months} сарын хугацаанд нийт ${formatNumber(worst.quantity)} ширхэг зарагдсан ч ${formatMonth(latest.month)}д огт борлогдоогүй. Сүүлд ${formatMonth(worst.lastMonth!)}д зарагдсан.`,
  };
}

function unitsInMonth(sales: Sale[], month: string): Map<number, number> {
  const totals = new Map<number, number>();
  for (const sale of sales) {
    if (sale.sale_month !== month) continue;
    totals.set(sale.product_id, (totals.get(sale.product_id) ?? 0) + sale.quantity);
  }
  return totals;
}

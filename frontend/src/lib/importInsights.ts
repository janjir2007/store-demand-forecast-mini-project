import type { Insight } from "./insights";
import type { ForecastRow } from "./forecast";
import { formatNumber } from "./format";

/** Lists at most this many product names before switching to a count. */
const NAME_LIMIT = 2;

function names(rows: ForecastRow[]): string {
  const listed = rows.slice(0, NAME_LIMIT).map((row) => row.prediction.product_name);
  const rest = rows.length - listed.length;
  return rest > 0 ? `${listed.join(", ")} болон бусад ${rest}` : listed.join(", ");
}

/**
 * Turns a finished forecast run into import guidance.
 *
 * Every branch is a direct restatement of what the predictions say — no claim
 * is made that the rows do not support, and an empty run yields no insights.
 */
export function buildImportInsights(rows: ForecastRow[]): Insight[] {
  if (!rows.length) return [];

  const insights: Insight[] = [];
  const byPredicted = [...rows].sort(
    (a, b) => b.prediction.predicted_quantity - a.prediction.predicted_quantity,
  );

  const high = byPredicted.filter((row) => row.status === "high");
  const low = byPredicted.filter((row) => row.status === "low");
  const none = byPredicted.filter((row) => row.status === "none");
  const unfitted = rows.filter((row) => !row.modelFitted);

  if (high.length) {
    insights.push({
      id: "import-high",
      tone: "positive",
      title: `${high.length} бүтээгдэхүүний эрэлт өснө гэж таамаглаж байна`,
      detail: `${names(high)} — импортын хэмжээг нэмэхийг зөвлөж байна. Хамгийн өндөр нь ${high[0].prediction.product_name}, ${formatNumber(high[0].prediction.predicted_quantity)} ширхэг.`,
    });
  }

  if (low.length) {
    insights.push({
      id: "import-low",
      tone: "negative",
      title: `${low.length} бүтээгдэхүүний эрэлт буурна гэж таамаглаж байна`,
      detail: `${names(low)} — сүүлийн саруудын дундажтай харьцуулж импортын хэмжээг багасгах эсвэл дахин хянана уу.`,
    });
  }

  if (none.length) {
    insights.push({
      id: "import-none",
      tone: "negative",
      title: `${none.length} бүтээгдэхүүн огт борлогдохгүй гэж таамаглагдлаа`,
      detail: `${names(none)} — дараагийн импорт хийхээсээ өмнө дахин хянана уу.`,
    });
  }

  if (unfitted.length) {
    insights.push({
      id: "import-thin-history",
      tone: "neutral",
      title: `${unfitted.length} таамаглал хангалтгүй түүхэн дээр үндэслэсэн`,
      detail: `${names(unfitted)} нь 4 сараас бага борлуулалтын түүхтэй тул загвар тохируулах боломжгүй, энгийн дундаж утга буцаасан. Чиг хандлага болгон авч үзнэ үү.`,
    });
  }

  return insights;
}

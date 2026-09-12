/** Огноог монгол хэлбэрээр харуулах туслах функцууд. */

export function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

/** "2026-08-01" -> "2026 оны 8-р сар". Тайлбар, гарчигт ашиглана. */
export function formatMonth(iso: string): string {
  const date = parseIsoDate(iso);
  return `${date.getFullYear()} оны ${date.getMonth() + 1}-р сар`;
}

/** "2026-08-01" -> "2026.08". Хүснэгтийн нүд зэрэг богино зайд ашиглана. */
export function formatMonthShort(iso: string): string {
  const date = parseIsoDate(iso);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** Графикийн тэнхлэг: "8-р сар", 1-р сард он солигдохыг "2026.01" гэж заана. */
export function formatMonthAxis(iso: string): string {
  const date = parseIsoDate(iso);
  return date.getMonth() === 0 ? `${date.getFullYear()}.01` : `${date.getMonth() + 1}-р сар`;
}

/** created_at нь ISO datetime; UI-д зөвхөн огноо нь утгатай. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getFullYear()} оны ${date.getMonth() + 1}-р сарын ${date.getDate()}`;
}

export function formatNumber(value: number, maximumFractionDigits = 0): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(value);
}

/** Үнэ төгрөгөөр. Том дүнг богиносгож харуулна. */
export function formatCurrency(value: number): string {
  return `${new Intl.NumberFormat("en-US", {
    notation: value >= 1_000_000 ? "compact" : "standard",
    maximumFractionDigits: value >= 1_000_000 ? 1 : 0,
  }).format(value)} ₮`;
}

export function initials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

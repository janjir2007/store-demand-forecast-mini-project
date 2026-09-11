"""Convert the supplied monthly Excel blocks into clean sales rows.

The copied 2025.10 and 2025.11 blocks were intentionally duplicated to make
the workbook look like 12 months. They are excluded. September 2026 is also
excluded because it is only a partial current-month export. The model uses
complete real months from 2025-12 through 2026-08.
"""
from pathlib import Path
import re
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / "upload" / "MIni project excel data.xlsx"
OUTPUT = ROOT / "app" / "data" / "cleaned_sales.csv"
VALID_MONTHS = {f"2026-{m:02d}" for m in range(1, 9)} | {"2025-12"}
MONTH_RE = re.compile(r"(20\d{2})\.(\d{1,2})\s*сар", re.I)


def main() -> None:
    data = pd.read_excel(SOURCE, header=None)
    current_month = None
    rows = []
    for source_row, row in data.iterrows():
        first = row.iloc[0]
        text = str(first).strip() if pd.notna(first) else ""
        match = MONTH_RE.fullmatch(text)
        if match:
            current_month = f"{match.group(1)}-{int(match.group(2)):02d}"
            continue
        if current_month not in VALID_MONTHS or not text:
            continue
        quantity = row.iloc[8]
        price = row.iloc[7]
        if not isinstance(quantity, (int, float)) or pd.isna(quantity) or quantity <= 0:
            continue
        rows.append({
            "product_name": text,
            "sale_month": f"{current_month}-01",
            "quantity": float(quantity),
            "unit_price": "" if pd.isna(price) else float(price),
            "source_row": int(source_row) + 1,
        })
    result = pd.DataFrame(rows)
    result.to_csv(OUTPUT, index=False, encoding="utf-8")
    print(f"Wrote {len(result)} sale rows for {result.sale_month.nunique()} real months to {OUTPUT}")


if __name__ == "__main__":
    main()

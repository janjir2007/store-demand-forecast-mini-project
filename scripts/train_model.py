"""Train the per-product demand models from the database and save them.

Run after the sales data changes:  python scripts/train_model.py
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.config import MODEL_PATH  # noqa: E402
from app.database import Base, SessionLocal, engine  # noqa: E402
from app.forecast import train_models  # noqa: E402
from app.seed import seed_database  # noqa: E402


def main() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_database(db)
        bundle = train_models(db)
    print(f"Saved {len(bundle['models'])} models trained on {bundle['trained_on_rows']} sale rows to {MODEL_PATH}")


if __name__ == "__main__":
    main()

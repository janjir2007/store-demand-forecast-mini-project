import csv
from datetime import date
from pathlib import Path
from sqlalchemy.orm import Session
from .config import ADMIN_PASSWORD, ADMIN_USERNAME
from .models import Product, Sale, User
from .security import hash_password

DATA_FILE = Path(__file__).parent / "data" / "cleaned_sales.csv"


def seed_database(db: Session) -> None:
    if not db.query(User).filter_by(username=ADMIN_USERNAME).first():
        db.add(User(username=ADMIN_USERNAME, password_hash=hash_password(ADMIN_PASSWORD)))
    if db.query(Sale).first() or not DATA_FILE.exists():
        db.commit()
        return
    products: dict[str, Product] = {}
    with DATA_FILE.open(encoding="utf-8") as f:
        for row in csv.DictReader(f):
            name = row["product_name"].strip()
            product = products.get(name)
            if not product:
                product = Product(name=name)
                db.add(product)
                db.flush()
                products[name] = product
            db.add(Sale(product_id=product.id, sale_month=date.fromisoformat(row["sale_month"]),
                        quantity=float(row["quantity"]), unit_price=float(row["unit_price"]) if row["unit_price"] else None,
                        source_row=int(row["source_row"])))
    db.commit()

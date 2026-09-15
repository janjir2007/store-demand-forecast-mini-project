from collections import defaultdict
from datetime import date
import logging
import joblib
import pandas as pd
from sklearn.linear_model import LinearRegression
from sqlalchemy.orm import Session
from .config import MODEL_PATH
from .models import Product, Sale

logger = logging.getLogger(__name__)

FEATURES = ["index", "lag_1", "rolling_3"]
_bundle: dict | None = None


def next_month(month: date) -> date:
    return date(month.year + (month.month == 12), 1 if month.month == 12 else month.month + 1, 1)


def monthly_series(rows: list[Sale]) -> pd.Series:
    """Monthly unit totals with gaps filled as zero-sale months."""
    frame = pd.DataFrame([{"month": r.sale_month, "quantity": r.quantity} for r in rows])
    frame["month"] = pd.to_datetime(frame["month"])
    monthly = frame.groupby("month", as_index=True)["quantity"].sum().sort_index()
    all_months = pd.date_range(monthly.index.min(), monthly.index.max(), freq="MS")
    return monthly.reindex(all_months, fill_value=0.0)


def training_frame(series: pd.Series) -> pd.DataFrame:
    work = pd.DataFrame({"quantity": series})
    work["index"] = range(len(work))
    work["lag_1"] = work["quantity"].shift(1)
    work["rolling_3"] = work["quantity"].shift(1).rolling(3, min_periods=1).mean()
    return work.dropna()


def train_models(db: Session) -> dict:
    """Fit one LinearRegression per product with enough history and save them to MODEL_PATH."""
    rows = db.query(Sale).order_by(Sale.product_id, Sale.sale_month).all()
    by_product: dict[int, list[Sale]] = defaultdict(list)
    for row in rows:
        by_product[row.product_id].append(row)

    models = {}
    for product_id, product_rows in by_product.items():
        train = training_frame(monthly_series(product_rows))
        if len(train) >= 3:
            models[product_id] = LinearRegression().fit(train[FEATURES], train["quantity"])

    bundle = {"models": models, "features": FEATURES, "trained_on_rows": len(rows)}
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(bundle, MODEL_PATH)
    logger.info("Saved %s product models trained on %s sale rows to %s", len(models), len(rows), MODEL_PATH)
    return bundle


def load_models() -> dict:
    global _bundle
    _bundle = joblib.load(MODEL_PATH)
    logger.info("Loaded %s product models from %s", len(_bundle["models"]), MODEL_PATH)
    return _bundle


def predict_product_demand(db: Session, product_id: int) -> tuple[Product, date, int, int]:
    product = db.get(Product, product_id)
    if not product:
        raise ValueError("Product not found")
    rows = db.query(Sale).filter(Sale.product_id == product_id).order_by(Sale.sale_month).all()
    if not rows:
        raise ValueError("This product has no sales history")

    series = monthly_series(rows)
    forecast_month = next_month(series.index.max().date())
    model = (_bundle or load_models())["models"].get(product_id)

    if model is not None:
        features = pd.DataFrame(
            [[len(series), float(series.iloc[-1]), float(series.tail(3).mean())]], columns=FEATURES
        )
        predicted = model.predict(features)[0]
    else:
        # Products without enough history at training time use the monthly average.
        predicted = series.mean()
    result = max(0, round(float(predicted)))
    logger.info("Forecast product_id=%s month=%s quantity=%s", product_id, forecast_month, result)
    return product, forecast_month, result, len(series)

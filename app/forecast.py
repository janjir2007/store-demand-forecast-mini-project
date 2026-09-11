from datetime import date
import logging
import pandas as pd
from sklearn.linear_model import LinearRegression
from sqlalchemy.orm import Session
from .models import Product, Sale

logger = logging.getLogger(__name__)


def next_month(month: date) -> date:
    return date(month.year + (month.month == 12), 1 if month.month == 12 else month.month + 1, 1)


def predict_product_demand(db: Session, product_id: int) -> tuple[Product, date, int, int]:
    product = db.get(Product, product_id)
    if not product:
        raise ValueError("Product not found")
    rows = db.query(Sale).filter(Sale.product_id == product_id).order_by(Sale.sale_month).all()
    if not rows:
        raise ValueError("This product has no sales history")

    frame = pd.DataFrame([{"month": r.sale_month, "quantity": r.quantity} for r in rows])
    frame["month"] = pd.to_datetime(frame["month"])
    monthly = frame.groupby("month", as_index=True)["quantity"].sum().sort_index()
    all_months = pd.date_range(monthly.index.min(), monthly.index.max(), freq="MS")
    series = monthly.reindex(all_months, fill_value=0.0)
    work = pd.DataFrame({"quantity": series})
    work["index"] = range(len(work))
    work["lag_1"] = work["quantity"].shift(1)
    work["rolling_3"] = work["quantity"].shift(1).rolling(3, min_periods=1).mean()
    train = work.dropna()
    forecast_month = next_month(series.index.max().date())

    if len(train) >= 3:
        model = LinearRegression().fit(train[["index", "lag_1", "rolling_3"]], train["quantity"])
        features = [[len(work), float(series.iloc[-1]), float(series.tail(3).mean())]]
        predicted = model.predict(features)[0]
        method = "LinearRegression (lag-1 + 3-month average)"
    else:
        predicted = series.mean()
        method = "Average fallback (insufficient history)"
    result = max(0, round(float(predicted)))
    logger.info("Forecast product_id=%s month=%s quantity=%s", product_id, forecast_month, result)
    return product, forecast_month, result, len(series)

from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)


class ProductOut(ProductCreate):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class SaleCreate(BaseModel):
    product_id: int
    sale_month: date
    quantity: float = Field(gt=0)
    unit_price: float | None = Field(default=None, ge=0)


class SaleOut(SaleCreate):
    id: int
    source_row: int | None
    model_config = ConfigDict(from_attributes=True)


class PredictionRequest(BaseModel):
    product_id: int


class PredictionOut(BaseModel):
    product_id: int
    product_name: str
    forecast_month: date
    predicted_quantity: int
    model_name: str
    observations: int

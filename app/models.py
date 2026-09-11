from datetime import datetime
from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Product(Base):
    __tablename__ = "products"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    sales: Mapped[list["Sale"]] = relationship(back_populates="product", cascade="all, delete-orphan")


class Sale(Base):
    __tablename__ = "sales"
    __table_args__ = (UniqueConstraint("product_id", "sale_month", "source_row", name="uq_sale_source"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    sale_month: Mapped[datetime] = mapped_column(Date, index=True)
    quantity: Mapped[float] = mapped_column(Float)
    unit_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    source_row: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    product: Mapped[Product] = relationship(back_populates="sales")


class PredictionResult(Base):
    __tablename__ = "prediction_results"
    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    forecast_month: Mapped[datetime] = mapped_column(Date, index=True)
    predicted_quantity: Mapped[float] = mapped_column(Float)
    model_name: Mapped[str] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

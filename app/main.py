import logging
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .database import Base, engine, get_db
from .config import MODEL_PATH
from .forecast import load_models, predict_product_demand, train_models
from .models import PredictionResult, Product, Sale, User
from .schemas import PredictionOut, PredictionRequest, ProductCreate, ProductOut, SaleCreate, SaleOut, Token
from .security import create_access_token, current_user, verify_password
from .seed import seed_database

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
app = FastAPI(title="Store Demand Forecast API", version="1.0.0")


@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)
    with next(get_db()) as db:
        seed_database(db)
        # The saved model file is the source of predictions; build it only if absent.
        if not MODEL_PATH.exists():
            train_models(db)
    load_models()


@app.get("/")
def root():
    return {"message": "Store Demand Forecast API", "docs": "/docs"}


@app.post("/auth/login", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form.username).first()
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    return Token(access_token=create_access_token(user.username))


@app.get("/products", response_model=list[ProductOut])
def list_products(_: User = Depends(current_user), db: Session = Depends(get_db)):
    return db.query(Product).order_by(Product.name).all()


@app.post("/products", response_model=ProductOut, status_code=201)
def create_product(payload: ProductCreate, _: User = Depends(current_user), db: Session = Depends(get_db)):
    if db.query(Product).filter(Product.name == payload.name.strip()).first():
        raise HTTPException(status_code=409, detail="Product already exists")
    product = Product(name=payload.name.strip())
    db.add(product); db.commit(); db.refresh(product)
    return product


@app.put("/products/{product_id}", response_model=ProductOut)
def update_product(product_id: int, payload: ProductCreate, _: User = Depends(current_user), db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product: raise HTTPException(status_code=404, detail="Product not found")
    product.name = payload.name.strip(); db.commit(); db.refresh(product)
    return product


@app.delete("/products/{product_id}", status_code=204)
def delete_product(product_id: int, _: User = Depends(current_user), db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product: raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product); db.commit()


@app.get("/sales", response_model=list[SaleOut])
def list_sales(_: User = Depends(current_user), db: Session = Depends(get_db)):
    return db.query(Sale).order_by(Sale.sale_month, Sale.id).all()


@app.post("/sales", response_model=SaleOut, status_code=201)
def create_sale(payload: SaleCreate, _: User = Depends(current_user), db: Session = Depends(get_db)):
    if not db.get(Product, payload.product_id): raise HTTPException(status_code=404, detail="Product not found")
    sale = Sale(**payload.model_dump()); db.add(sale); db.commit(); db.refresh(sale)
    return sale


@app.put("/sales/{sale_id}", response_model=SaleOut)
def update_sale(sale_id: int, payload: SaleCreate, _: User = Depends(current_user), db: Session = Depends(get_db)):
    sale = db.get(Sale, sale_id)
    if not sale: raise HTTPException(status_code=404, detail="Sale not found")
    if not db.get(Product, payload.product_id): raise HTTPException(status_code=404, detail="Product not found")
    for key, value in payload.model_dump().items(): setattr(sale, key, value)
    db.commit(); db.refresh(sale); return sale


@app.delete("/sales/{sale_id}", status_code=204)
def delete_sale(sale_id: int, _: User = Depends(current_user), db: Session = Depends(get_db)):
    sale = db.get(Sale, sale_id)
    if not sale: raise HTTPException(status_code=404, detail="Sale not found")
    db.delete(sale); db.commit()


@app.post("/predict", response_model=PredictionOut)
def predict(payload: PredictionRequest, _: User = Depends(current_user), db: Session = Depends(get_db)):
    try:
        product, month, quantity, observations = predict_product_demand(db, payload.product_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    db.add(PredictionResult(product_id=product.id, forecast_month=month, predicted_quantity=quantity,
                            model_name="LinearRegression"))
    db.commit()
    return PredictionOut(product_id=product.id, product_name=product.name, forecast_month=month,
                         predicted_quantity=quantity, model_name="LinearRegression", observations=observations)

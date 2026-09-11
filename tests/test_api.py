import os
from pathlib import Path
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]
db_file = ROOT / "store_demand.db"
if db_file.exists():
    os.remove(db_file)

from app.main import app  # noqa: E402


def auth_headers(client: TestClient):
    response = client.post("/auth/login", data={"username": "admin", "password": "admin123"})
    assert response.status_code == 200
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def test_login_products_and_prediction():
    with TestClient(app) as client:
        headers = auth_headers(client)
        products = client.get("/products", headers=headers)
        assert products.status_code == 200
        assert len(products.json()) > 0
        product_id = products.json()[0]["id"]
        predicted = client.post("/predict", headers=headers, json={"product_id": product_id})
        assert predicted.status_code == 200
        assert predicted.json()["predicted_quantity"] >= 0


def test_create_and_delete_product():
    with TestClient(app) as client:
        headers = auth_headers(client)
        created = client.post("/products", headers=headers, json={"name": "Test product"})
        assert created.status_code == 201
        deleted = client.delete(f"/products/{created.json()['id']}", headers=headers)
        assert deleted.status_code == 204

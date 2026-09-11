# Store Demand Forecast — Mini Project

Энэ нь дэлгүүрийн сарын борлуулалтын түүхээс ирэх сарын бүтээгдэхүүн тус бүрийн эрэлтийг таамагладаг сургалтын mini project юм.

## Шаардлага хэрхэн биелсэн бэ

| Шаардлага | Хэрэгжүүлэлт |
| --- | --- |
| 3+ холбоотой хүснэгт | SQLite: `users`, `products`, `sales`, `prediction_results` |
| FastAPI CRUD | `/products`, `/sales` дээр create, list, update, delete |
| Нэвтрэлт | JWT bearer token, demo user `admin` / `admin123` |
| ML API | `POST /predict` — LinearRegression, өмнөх сарын борлуулалт ба 3 сарын дундажийг ашиглана |
| Log | API ба таамаг гарсан үйлдэл console log-д бичигдэнэ |
| Test | `pytest` API login, CRUD, predict-ийг шалгана |
| Deploy | `Dockerfile`, `render.yaml` бэлэн |

## Data

Эх Excel нь нэг sheet дотор сар бүрийн хэсгүүдээр хадгалагдсан байсан. `scripts/extract_sales.py` нь сар бүрийн гарчгийг мөр бүрт оноож, `A` баганын барааны нэр, `I` баганын зарагдсан тоо, `H` баганын нэгж үнийг авна.

2025.10, 2025.11 гэсэн зориуд давхар хуулсан хэсгүүдийг ашиглаагүй. 2026.09 нь дутуу сар байсан тул мөн хассан. Бодит, бүтэн 2025.12–2026.08 өгөгдлийг ашигласан.

## Ажиллуулах

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python scripts/extract_sales.py
uvicorn app.main:app --reload
```

Дараа нь браузераар `http://127.0.0.1:8000/docs` нээнэ. Эхлээд `/auth/login` дээр `admin` / `admin123` ашиглан token авна. Дараа нь Swagger-ийн **Authorize** товчоор `Bearer <token>` оруулж API-уудыг ажиллуулна.

## `/predict` жишээ

```json
{ "product_id": 1 }
```

```json
{
  "product_id": 1,
  "product_name": "510 shine zagvar shar",
  "forecast_month": "2026-10-01",
  "predicted_quantity": 2,
  "model_name": "LinearRegression",
  "observations": 10
}
```

## Deploy

1. Project-оо GitHub repository-д upload хийнэ.
2. Render дээр **New → Blueprint** сонгоод repository-гаа холбоно.
3. `render.yaml` автоматаар service үүсгэнэ.
4. Үүссэн URL дээр `/docs` нэмээд багшдаа өгнө.

Production-д deploy хийхийн өмнө `SECRET_KEY` болон demo password-ийг орчны хувьсагчаар сольж ашиглана.

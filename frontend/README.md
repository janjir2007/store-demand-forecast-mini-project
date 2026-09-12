# Frontend — Demand Forecast Dashboard

Internal dashboard for the furniture store's sales forecasting API. React + TypeScript + Vite.

## Running

The backend must be running first:

```bash
# from the project root
uvicorn app.main:app --reload      # http://127.0.0.1:8000
```

Then:

```bash
cd frontend
npm install
npm run dev                        # http://localhost:5173
```

Sign in with the backend's demo account (`admin` / `admin123`).

### Why a proxy

`app/main.py` has no CORS middleware, so a browser on `:5173` cannot call `:8000`
directly. `vite.config.ts` proxies `/api/*` to the backend instead, which keeps the
browser same-origin and leaves the backend untouched.

For a real deployment either add `CORSMiddleware` to the API, or build the frontend
(`npm run build`) and serve `dist/` from the same origin as the API. Set
`VITE_API_BASE` if the API lives somewhere other than `/api`.

## Structure

```
src/
  auth/            AuthContext (JWT), RequireAuth route guard
  components/
    charts/        Recharts wrappers + the shared chart theme
    layout/        AppLayout, Sidebar, PageHeader, nav definition
    ui/            Button, Card, StatCard, Badge, Field, DataTable, States, Icons
  hooks/           useAsync (loading/error/retry), useStoreData, useDocumentTitle
  lib/             api client, types, analytics, formatters
  pages/           Dashboard, SalesHistory, Forecast, Products, Login
  styles/          tokens · base · layout · components · pages
```

## Endpoints used

| Page | Calls |
|---|---|
| Login | `POST /auth/login` (form-urlencoded) |
| Dashboard | `GET /products`, `GET /sales` |
| Sales History | `GET /products`, `GET /sales` |
| Forecast | `GET /products`, `GET /sales`, `POST /predict` |
| Products | `GET /products`, `GET /sales`, `POST`/`PUT`/`DELETE /products` |

No business figures are hardcoded. The API exposes no aggregate endpoints, so KPIs,
monthly totals and per-product rollups are derived in `src/lib/analytics.ts` from
`/sales` and `/products`.

## Design tokens

Everything visual is driven by `src/styles/tokens.css` — change a value there and it
propagates. Primary is a warm brown (`--brand: #8b5e3c`) on white, Montserrat
throughout, light grey borders, subtle shadows, rounded corners.

The chart series colors (`--chart-1` … `--chart-5`) are a separate, deliberately
slightly stronger set: they were validated for lightness banding, chroma, contrast
against white, and colorblind separation, which thin 2px lines need and the softer
UI brown does not survive. They are assigned in fixed order and never cycled.

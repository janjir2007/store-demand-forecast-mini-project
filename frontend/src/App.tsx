import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { RequireAuth } from "./auth/RequireAuth";
import { DashboardPage } from "./pages/DashboardPage";
import { ForecastPage } from "./pages/ForecastPage";
import { LoginPage } from "./pages/LoginPage";
import { ProductsPage } from "./pages/ProductsPage";
import { SalesHistoryPage } from "./pages/SalesHistoryPage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="sales" element={<SalesHistoryPage />} />
          <Route path="forecast" element={<ForecastPage />} />
          <Route path="products" element={<ProductsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

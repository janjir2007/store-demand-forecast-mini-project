import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ApiError } from "../lib/api";
import { Button } from "../components/ui/Button";
import { TextField } from "../components/ui/Field";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function LoginPage() {
  useDocumentTitle("Нэвтрэх");
  const { isAuthenticated, signIn } = useAuth();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    const from = (location.state as { from?: string } | null)?.from ?? "/";
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await signIn(username.trim(), password);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Нэвтэрч чадсангүй. Дахин оролдоно уу.");
      setSubmitting(false);
    }
  }

  return (
    <div className="login">
      <div className="login__card">
        <span className="login__mark">DF</span>
        <h1>Demand Forecast</h1>
        <p className="login__desc">Тавилгын дэлгүүрийн борлуулалтын таамаглалын дотоод систем.</p>

        <form className="login__form" onSubmit={handleSubmit}>
          <TextField
            label="Нэвтрэх нэр"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            autoFocus
            required
          />
          <TextField
            label="Нууц үг"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
          {error && <p className="inline-error">{error}</p>}
          <Button type="submit" variant="primary" loading={submitting}>
            Нэвтрэх
          </Button>
        </form>

        <p className="login__hint">Зөвхөн дэлгүүрийн ажилтны эрхээр нэвтэрнэ.</p>
      </div>
    </div>
  );
}

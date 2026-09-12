import type { Prediction, Product, Sale, Token } from "./types";

// Vite proxies /api to the FastAPI backend in dev (see vite.config.ts).
const BASE = import.meta.env.VITE_API_BASE ?? "/api";
const TOKEN_KEY = "sdf.token";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

/** Fired on any 401 so the auth provider can drop the session. */
export const UNAUTHORIZED_EVENT = "sdf:unauthorized";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, { ...init, headers });
  } catch {
    throw new ApiError("Сервертэй холбогдож чадсангүй. API ажиллаж байгаа эсэхийг шалгана уу.", 0);
  }

  if (response.status === 401) {
    window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    throw new ApiError("Нэвтрэх хугацаа дууссан байна. Дахин нэвтэрнэ үү.", 401);
  }

  if (!response.ok) {
    throw new ApiError(await readError(response), response.status);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

async function readError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    const detail = body?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return String(detail[0].msg);
  } catch {
    /* fall through to the generic message */
  }
  return `Хүсэлт амжилтгүй боллоо (${response.status})`;
}

function json(body: unknown): RequestInit {
  return { body: JSON.stringify(body), headers: { "Content-Type": "application/json" } };
}

export const api = {
  /** The backend expects an OAuth2 password form, not JSON. */
  login(username: string, password: string) {
    const form = new URLSearchParams({ username, password });
    return request<Token>("/auth/login", {
      method: "POST",
      body: form,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },

  listProducts: () => request<Product[]>("/products"),
  createProduct: (name: string) => request<Product>("/products", { method: "POST", ...json({ name }) }),
  updateProduct: (id: number, name: string) =>
    request<Product>(`/products/${id}`, { method: "PUT", ...json({ name }) }),
  deleteProduct: (id: number) => request<void>(`/products/${id}`, { method: "DELETE" }),

  listSales: () => request<Sale[]>("/sales"),

  predict: (productId: number) =>
    request<Prediction>("/predict", { method: "POST", ...json({ product_id: productId }) }),
};

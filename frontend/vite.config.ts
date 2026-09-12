import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Avoids pulling in @types/node just to read one env var.
declare const process: { env: Record<string, string | undefined> };

// The FastAPI backend has no CORS middleware, so the dev server proxies
// /api/* to it instead. Keeps the backend untouched and the browser same-origin.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_PROXY_TARGET ?? "http://127.0.0.1:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});

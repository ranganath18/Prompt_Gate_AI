import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// During development, Vite forwards API calls to FastAPI, so the browser
// only ever talks to one address (http://localhost:5173) and CORS never matters.
const BACKEND_URL = "http://127.0.0.1:8000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": BACKEND_URL,
      "/health": BACKEND_URL,
    },
  },
});

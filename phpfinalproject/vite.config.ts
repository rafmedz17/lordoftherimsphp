import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// The PHP API runs separately during development (`npm run dev:api` on port 8000).
// changeOrigin stays false so PHP sees the browser's Host header, which its
// same-origin (CSRF) check compares against the Origin header.
const PHP_DEV_SERVER = { target: "http://127.0.0.1:8000", changeOrigin: false };

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": PHP_DEV_SERVER,
      "/uploads": PHP_DEV_SERVER,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

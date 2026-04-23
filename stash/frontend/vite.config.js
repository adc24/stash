import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// During dev, proxy /api to Flask on :5000.
// In production, Flask serves the built /dist folder directly.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});

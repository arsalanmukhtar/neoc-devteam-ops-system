import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",          // ✅ allow access from public IP / LAN
    port: 5175,
    strictPort: true,

    // (optional) if you want Vite to accept requests for these hosts
    allowedHosts: [
      "182.188.28.163",
      "172.18.7.39",
      "localhost",
    ],

    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      "@src": path.resolve(__dirname, "./src"),
    },
  },
});

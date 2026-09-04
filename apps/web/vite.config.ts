import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "AgriAngola OS",
        short_name: "AgriAngola",
        description: "A infraestrutura digital do agronegócio angolano",
        theme_color: "#163525",
        background_color: "#f6f1e7",
        display: "standalone",
        lang: "pt",
        icons: [
          { src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /\/api\/v1\/(listings|demands|maps|prices|weather)/,
            handler: "NetworkFirst",
            options: { cacheName: "agri-api", networkTimeoutSeconds: 4, expiration: { maxEntries: 80 } },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@agriangola/shared": path.resolve(__dirname, "../../packages/shared/src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});

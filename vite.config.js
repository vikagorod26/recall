import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { resolve } from "node:path";

// base "./" keeps every URL relative, so the build works on GitHub Pages
// under https://<user>.github.io/<repo>/ without knowing the repo name.
export default defineConfig({
  base: "./",
  plugins: [
    react(),
    // PWA: web app manifest + service worker (offline, installable).
    // Colors = --color-bg, so the launch screen matches the splash (no white flash).
    VitePWA({
      registerType: "autoUpdate",       // new versions activate on the next launch
      injectRegister: "script-defer",
      includeAssets: ["icons/*.png", "splash/*.jpg", "robots.txt"],
      manifest: {
        id: "./",
        name: "Recall",
        short_name: "Recall",
        description: "Less queueing. More living. What to do instead of one more game.",
        lang: "en",
        start_url: "./",
        scope: "./",
        display: "standalone",
        orientation: "portrait",
        background_color: "#0B0D10",
        theme_color: "#0B0D10",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // everything the app needs offline: pages, JS, CSS, fonts, icon sprite
        globPatterns: ["**/*.{html,js,css,woff2,svg,png}"],
        globIgnores: ["splash/**"],      // iPhone launch screens: only fetched once at install
        navigateFallback: "index.html",
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  build: {
    target: "es2022",
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        styleguide: resolve(import.meta.dirname, "styleguide.html"),
        review: resolve(import.meta.dirname, "tips-review.html"),
      },
    },
  },
});

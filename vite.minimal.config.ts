
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Configuration Vite simplifiée pour le mode minimal
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    cors: true,
  },
  plugins: [
    react({
      jsxRuntime: 'automatic',
      babel: {
        // Désactiver les plugins Babel problématiques
        plugins: []
      }
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    }
  },
  build: {
    minify: false, // Désactiver la minification pour le débogage
    sourcemap: true,
    // Éviter les chunks pour une version minimale
    rollupOptions: {
      output: {
        manualChunks: {},
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('development'),
    'process.env.VITE_MINIMAL_MODE': JSON.stringify('true'),
    'process.env.VITE_DISABLE_SENTRY': JSON.stringify('true'),
  },
  // Assurer des chemins relatifs
  base: './',
});

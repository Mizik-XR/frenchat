
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Configuration Vite minimaliste pour le mode diagnostic
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
        plugins: []
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    }
  },
  build: {
    minify: false, // Désactiver la minification pour le débogage
    sourcemap: true,
    outDir: 'dist',
    rollupOptions: {
      external: [
        'https://cdn.gpteng.co/gptengineer.js'
      ]
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('development'),
    'process.env.VITE_MINIMAL_MODE': JSON.stringify('true'),
    'process.env.VITE_DISABLE_SENTRY': JSON.stringify('true'),
  },
  base: './', // Utiliser des chemins relatifs
});

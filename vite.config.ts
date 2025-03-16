
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react({
      // Configuration la plus simple possible
      jsxRuntime: 'automatic',
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Configuration simplifiée
  build: {
    minify: 'esbuild',
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Séparer React dans son propre chunk
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            return 'vendor';
          }
        },
      },
    },
    outDir: 'dist',
  },
  // Éviter les conflits de build
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    force: true, // Forcer la précompilation
  },
  // Définitions globales simplifiées
  define: {
    'process.env': {},
    'global': 'window',
  }
});

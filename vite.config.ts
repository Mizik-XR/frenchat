
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react({
      // Configurer React pour éviter les conflits
      jsxRuntime: 'automatic',
      babel: {
        plugins: [],
        // Configuration simplifiée pour éviter les problèmes
        babelrc: false,
        configFile: false
      }
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Configuration optimisée pour la production
  build: {
    // Utilisation d'esbuild pour la minification
    minify: mode === 'production' ? 'esbuild' : false,
    target: 'es2015',
    sourcemap: mode !== 'production',
    // Séparer le vendor bundle pour un meilleur caching
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
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
  // Configuration optimisée pour le développement
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  // Définitions pour éviter les conflits
  define: {
    'process.env': {},
    'global': 'window',
  }
}));

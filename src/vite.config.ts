
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react({
      // Configuration explicite de React pour éviter les problèmes d'initialisation
      jsxRuntime: 'automatic',
      babel: {
        plugins: []
      }
    }),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Alias explicites pour React pour éviter les doublons
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
    dedupe: ['react', 'react-dom'],
  },
  // Configuration optimisée pour la production
  build: {
    // Empêcher la minification pour mieux diagnostiquer les problèmes
    minify: mode === 'production' ? 'esbuild' : false,
    target: 'es2015',
    rollupOptions: {
      output: {
        // Garantir que React est dans un seul chunk pour éviter les doublons
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('@radix-ui')) return 'vendor-radix';
            if (id.includes('lucide')) return 'vendor-lucide';
            return 'vendor'; // autres libs
          }
        },
      },
      external: [
        // Exclure le script gptengineer.js du processus de bundling
        'https://cdn.gpteng.co/gptengineer.js'
      ]
    },
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
  },
  // Optimisation des dépendances pour éviter les problèmes d'initialisation
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['gptengineer'],
    esbuildOptions: {
      target: 'es2020',
    },
    // Force le pré-bundling pour garantir une initialisation correcte
    force: true,
  },
  // Variables d'environnement pour le mode développement et production
  define: {
    __LOVABLE_MODE__: JSON.stringify(mode),
    // Forcer la définition globale de React pour éviter les problèmes d'initialisation
    'global.React': 'React',
  }
}));


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
      // Configuration explicite de Babel avec les transformations nécessaires
      babel: {
        plugins: [
          '@babel/plugin-transform-react-jsx',
        ],
        presets: [
          ['@babel/preset-react', { runtime: 'automatic' }]
        ],
        babelrc: true,
        configFile: false,
      }
    }),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
    dedupe: ['react', 'react-dom'], // Dédupliquer React pour éviter les conflits
  },
  build: {
    minify: 'esbuild',
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('react') || id.includes('react-dom')) return 'vendor-react';
            if (id.includes('@radix-ui')) return 'vendor-radix';
            if (id.includes('lucide')) return 'vendor-lucide';
            return 'vendor'; // autres libs
          }
        },
      },
      external: [], // Ne pas externaliser React
    },
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
    // Activer la copie des ressources
    assetsInlineLimit: 0, // Ne pas inliner les ressources (important pour les GIFs et images)
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@babel/plugin-transform-react-jsx'],
    force: true, // Forcer l'optimisation des dépendances
  },
  // Configuration de la gestion des assets
  assetsInclude: ['**/*.gif', '**/*.png', '**/*.jpg', '**/*.svg', '**/*.ico'],
  // Configurer le comportement de base de publicPath
  base: './',
  // Préserve le script gptengineer.js et empêche Vite de le manipuler
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (filename.includes('gptengineer.js')) {
        return 'https://cdn.gpteng.co/gptengineer.js';
      }
      return { relative: true };
    }
  }
}));

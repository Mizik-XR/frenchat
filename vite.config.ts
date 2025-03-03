
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
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Configuration améliorée pour la production
  build: {
    // Utilisation d'esbuild au lieu de terser pour la minification
    minify: 'esbuild',
    // Configuration d'esbuild pour la minification
    target: 'es2015',
    rollupOptions: {
      output: {
        // Séparation du code en chunks pour un meilleur chargement
        manualChunks: (id) => {
          // On crée un chunk pour chaque lib importante
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('react') || id.includes('react-dom')) return 'vendor-react';
            if (id.includes('@radix-ui')) return 'vendor-radix';
            if (id.includes('lucide')) return 'vendor-lucide';
            return 'vendor'; // autres libs
          }
        },
      },
    },
    // Activer la compression
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000, // Augmenter la limite d'avertissement
  },
  // Configuration pour améliorer le comportement du cache
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  // Configuration de la gestion des assets
  assetsInclude: ['**/*.gif', '**/*.png', '**/*.jpg', '**/*.svg'],
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

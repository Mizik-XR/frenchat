
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
      // Configurer React pour éviter les conflits potentiels
      jsxRuntime: 'automatic',
      // La propriété fastRefresh n'est pas reconnue, supprimons-la
      babel: {
        plugins: []
      }
    }),
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
      external: [
        // Exclure le script gptengineer.js du processus de bundling
        'https://cdn.gpteng.co/gptengineer.js'
      ]
    },
    // Activer la compression
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000, // Augmenter la limite d'avertissement
  },
  // Configuration pour améliorer le comportement du cache
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['gptengineer']
  },
  // Configuration script pour le mode développement et production
  define: {
    __LOVABLE_MODE__: JSON.stringify(mode),
    // Forcer la définition globale de React pour éviter les problèmes d'initialisation
    'global.React': 'React',
  }
}));

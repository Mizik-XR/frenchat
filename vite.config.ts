
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
      // Configuration optimisée pour React
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
    },
  },
  build: {
    // Optimisations
    minify: mode === 'production' ? 'esbuild' : false,
    target: 'es2015',
    sourcemap: mode === 'development',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Amélioration de la distribution des chunks
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Empêcher les problèmes d'initialisation de React
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            // Séparation fine des modules Radix et Toast
            if (id.includes('@radix-ui/react-toast')) {
              return 'vendor-radix-toast';
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-radix';
            }
            // Séparation du système de toast pour éviter les dépendances circulaires
            if (id.includes('sonner') || id.includes('toast')) {
              return 'vendor-toast-system';
            }
            // Autres librairies communes
            if (id.includes('lucide')) return 'vendor-lucide';
            if (id.includes('@tanstack')) return 'vendor-tanstack';
            if (id.includes('@supabase')) return 'vendor-supabase';
            return 'vendor'; // autres libs
          }
        },
        // Format de sortie avec entryFileNames et chunkFileNames pour mieux contrôler le nommage
        entryFileNames: 'assets/js/[name].[hash].js',
        chunkFileNames: 'assets/js/[name].[hash].js',
        assetFileNames: 'assets/[ext]/[name].[hash].[ext]'
      },
      // Exclure le script gptengineer.js du bundling
      external: ['https://cdn.gpteng.co/gptengineer.js']
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      '@radix-ui/react-toast',
      'lucide-react',
      'sonner'
    ],
    exclude: ['gptengineer', 'lovable-tagger']
  },
  define: {
    // Définir des constantes globales
    __LOVABLE_MODE__: JSON.stringify(mode === 'development' ? "development" : "production"),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  // Améliorer les performances et l'expérience de développement
  esbuild: {
    // Configuration optimisée
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    // Optimisations pour les navigateurs plus récents
    target: ['es2020', 'chrome80', 'edge79', 'firefox72', 'safari13']
  }
}));

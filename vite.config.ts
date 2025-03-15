
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
        // Distribution optimisée des chunks pour éviter les erreurs "Cannot access X before initialization"
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Empêcher les problèmes d'initialisation de React
            if (id.includes('react/') || id.includes('react-dom/')) {
              return 'vendor-react';
            }
            
            // Séparation des modules de toast pour éviter toute dépendance circulaire
            if (id.includes('@radix-ui/react-toast')) {
              return 'vendor-toast-radix';
            }
            if (id.includes('sonner') || id.includes('toast')) {
              return 'vendor-toast-system';
            }
            
            // Autres séparations
            if (id.includes('lucide')) return 'vendor-lucide';
            if (id.includes('@tanstack')) return 'vendor-tanstack';
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('@radix-ui')) return 'vendor-radix';
            
            return 'vendor';
          }
          
          // Isoler les hooks et utils pour éviter les dépendances circulaires
          if (id.includes('/hooks/toast/')) {
            return 'app-toast-system';
          }
          if (id.includes('/hooks/')) {
            return 'app-hooks';
          }
          if (id.includes('/utils/')) {
            return 'app-utils';
          }
        },
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
  esbuild: {
    // Optimisations avancées
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    target: ['es2020', 'chrome80', 'edge79', 'firefox72', 'safari13'],
    // Désactiver certaines options qui pourraient causer des problèmes
    keepNames: true,
    treeShaking: true,
    legalComments: 'none'
  }
}));

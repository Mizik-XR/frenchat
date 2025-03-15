
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
          // Éviter le problème d'ordre d'initialisation des modules
          if (id.includes('node_modules')) {
            // Créer des chunks plus spécifiques pour les bibliothèques volumineuses
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('react-dom')) return 'vendor-react-dom';
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('@radix-ui/react-toast')) return 'vendor-radix-toast';
            if (id.includes('@radix-ui')) return 'vendor-radix';
            if (id.includes('lucide')) return 'vendor-lucide';
            if (id.includes('@tanstack')) return 'vendor-tanstack';
            return 'vendor'; // autres libs
          }
        },
        // Format de sortie avec entryFileNames et chunkFileNames pour mieux contrôler le nommage
        entryFileNames: 'assets/js/[name]-[hash].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
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
      'lucide-react'
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
    // Désactiver JSX auto pour éviter les erreurs de build
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    // Optimisations pour les navigateurs plus récents
    target: ['es2020', 'chrome80', 'edge79', 'firefox72', 'safari13']
  }
}));

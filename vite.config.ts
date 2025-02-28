
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// Commentons temporairement cet import qui peut causer des problèmes de build
// import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  // Charger les variables d'environnement en fonction du mode
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: true,
      port: 8080,
      strictPort: true,
      open: true,
    },
    optimizeDeps: {
      include: ['react-dropzone', 'date-fns']
    },
    plugins: [
      react(),
      // mode === 'development' &&
      // componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ['react-dropzone', 'react', 'react-dom', 'date-fns']
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            // Commentons cette ligne qui essaie d'importer tout le dossier ui
            // 'ui-components': ['@/components/ui'],
          },
        },
      },
    },
  };
});

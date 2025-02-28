
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

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
    ],
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
          },
        },
      },
    },
    // Configuration pour gérer correctement les assets en production
    base: './', // Utiliser des chemins relatifs en production
  };
});


import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  // Charger les variables d'environnement en fonction du mode
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: true,
      port: 8080, // Changement du port à 8080
      strictPort: true, // Utiliser strictement le port 8080
      open: true, // Ouvrir automatiquement le navigateur (une seule fois)
    },
    optimizeDeps: {
      include: ['react-dropzone']
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ['react-dropzone', 'react']
    },
  };
});

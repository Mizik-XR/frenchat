
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
      port: mode === 'development' ? 5173 : parseInt(env.PORT || '5173'),
      strictPort: true // Force Vite à utiliser uniquement le port spécifié
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

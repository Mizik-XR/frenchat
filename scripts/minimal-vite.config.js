
/**
 * Configuration Vite minimale pour le mode de récupération
 * Utilisée uniquement lorsque la configuration standard échoue
 */

import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  // Configuration minimale sans plugins
  build: {
    minify: false,
    target: 'es2015',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, '../index.html'),
      },
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-other': ['@tanstack/react-query'],
        },
      }
    },
  },
  define: {
    // Forcer le mode de récupération
    'window.__RECOVERY_MODE__': 'true',
    'process.env.NODE_ENV': '"production"',
  }
});

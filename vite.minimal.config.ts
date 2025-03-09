
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  // Configuration pour la version minimale
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'process.env.VITE_MINIMAL_MODE': JSON.stringify('true'),
    'process.env.VITE_DISABLE_SENTRY': JSON.stringify('true'),
  },
  build: {
    rollupOptions: {
      input: {
        minimal: resolve(__dirname, 'public/minimal.html'),
      },
    },
  },
  server: {
    open: '/minimal.html',
  },
});

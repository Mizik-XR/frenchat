
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.VITE_MINIMAL_MODE': JSON.stringify('true'),
    'process.env.VITE_DISABLE_SENTRY': JSON.stringify('true'),
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        minimal: './public/minimal.html',
      },
    },
    minify: false, // Désactiver la minification pour faciliter le débogage
  },
})

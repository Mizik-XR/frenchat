
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from 'fs';

// Plugin to ensure scripts in index.html use relative paths
const ensureRelativePaths = () => {
  return {
    name: 'ensure-relative-paths',
    writeBundle: {
      sequential: true,
      order: 'post',
      handler: () => {
        const indexPath = path.resolve('./dist/index.html');
        if (fs.existsSync(indexPath)) {
          let content = fs.readFileSync(indexPath, 'utf-8');
          // Convert absolute paths to relative paths
          content = content.replace(/src="\//g, 'src="./');
          content = content.replace(/href="\//g, 'href="./');
          // Update index.html with relative paths
          fs.writeFileSync(indexPath, content);
          console.log('✅ Updated paths in index.html to be relative');
        } else {
          console.log('❌ Could not find dist/index.html');
        }
      }
    }
  };
};

// Plugin to ensure Lovable script is included
const ensureLovableScript = () => {
  return {
    name: 'ensure-lovable-script',
    writeBundle: {
      sequential: true,
      order: 'post',
      handler: () => {
        const indexPath = path.resolve('./dist/index.html');
        if (fs.existsSync(indexPath)) {
          let content = fs.readFileSync(indexPath, 'utf-8');
          // Check if the Lovable script is missing
          if (!content.includes('cdn.gpteng.co/gptengineer.js')) {
            // Find the closing </body> tag and insert script before it
            content = content.replace(
              '</body>',
              '  <script src="https://cdn.gpteng.co/gptengineer.js" type="module"></script>\n</body>'
            );
            // Update index.html with the script
            fs.writeFileSync(indexPath, content);
            console.log('✅ Added Lovable script to index.html');
          } else {
            console.log('✅ Lovable script already exists in index.html');
          }
        } else {
          console.log('❌ Could not find dist/index.html');
        }
      }
    }
  };
};

// Plugin for copying the files _redirects and _headers to the dist folder
const copyRedirectsAndHeaders = () => {
  return {
    name: 'copy-redirects-headers',
    closeBundle: () => {
      // File paths
      const redirectsSrc = path.resolve('./_redirects');
      const redirectsDest = path.resolve('./dist/_redirects');
      const headersSrc = path.resolve('./_headers');
      const headersDest = path.resolve('./dist/_headers');
      
      // Copy _redirects if it exists
      if (fs.existsSync(redirectsSrc)) {
        fs.copyFileSync(redirectsSrc, redirectsDest);
        console.log('✅ _redirects copied to dist');
      } else {
        // Create a basic _redirects file
        fs.writeFileSync(redirectsDest, '/* /index.html 200\n');
        console.log('✅ _redirects created in dist');
      }
      
      // Copy _headers if it exists
      if (fs.existsSync(headersSrc)) {
        fs.copyFileSync(headersSrc, headersDest);
        console.log('✅ _headers copied to dist');
      } else if (fs.existsSync('scripts/_headers')) {
        // Try to copy from scripts directory if not found in root
        fs.copyFileSync('scripts/_headers', headersDest);
        console.log('✅ _headers copied from scripts directory to dist');
      }
    }
  };
};

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react({
      // Configure React to avoid potential conflicts
      jsxRuntime: 'automatic',
      // The fastRefresh property is not recognized, let's remove it
      babel: {
        plugins: []
      }
    }),
    mode === 'development' && componentTagger(),
    copyRedirectsAndHeaders(), // Plugin to copy the files
    ensureRelativePaths(), // Plugin to ensure relative paths
    ensureLovableScript(), // Plugin to ensure Lovable script is included
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Improved configuration for production
  build: {
    // Use esbuild instead of terser for minification
    minify: 'esbuild',
    // esbuild configuration for minification
    target: 'es2015',
    // Ensure important static files are copied in the build
    rollupOptions: {
      output: {
        // Split code into chunks for better loading
        manualChunks: (id) => {
          // Create a chunk for each important lib
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('react') || id.includes('react-dom')) return 'vendor-react';
            if (id.includes('@radix-ui')) return 'vendor-radix';
            if (id.includes('lucide')) return 'vendor-lucide';
            return 'vendor'; // other libs
          }
        },
      },
      external: [
        // Exclude the gptengineer.js script from the bundling process
        'https://cdn.gpteng.co/gptengineer.js'
      ]
    },
    // Enable compression
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000, // Increase warning limit
    // Ensure _redirects and _headers files are copied to the build folder
    copyPublicDir: true,
  },
  // Configuration to improve cache behavior
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['gptengineer']
  },
  // Asset management configuration
  assetsInclude: ['**/*.gif', '**/*.png', '**/*.jpg', '**/*.svg'],
  // Script configuration for development and production mode
  define: {
    __LOVABLE_MODE__: JSON.stringify(mode),
  },
  // Configuration to ensure relative paths
  base: './',
}));

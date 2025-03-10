
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from 'fs';
import type { PluginOption } from 'vite';

// Plugin pour assurer que les scripts dans index.html utilisent des chemins relatifs
const ensureRelativePaths = (): PluginOption => {
  return {
    name: 'ensure-relative-paths',
    enforce: 'post', // S'assurer qu'il s'exécute après tous les autres plugins
    writeBundle: {
      sequential: true,
      order: "post" as const,
      handler() {
        console.log('⚙️ Exécution du plugin ensure-relative-paths...');
        const indexPath = path.resolve('./dist/index.html');
        if (fs.existsSync(indexPath)) {
          let content = fs.readFileSync(indexPath, 'utf-8');
          const originalContent = content;
          
          // Convertir tous les chemins absolus en chemins relatifs
          content = content.replace(/src="\//g, 'src="./');
          content = content.replace(/href="\//g, 'href="./');
          
          // Traiter spécifiquement les imports de modules et les assets
          content = content.replace(/from="\//g, 'from="./');
          content = content.replace(/import="\//g, 'import="./');
          
          // Mettre à jour index.html avec des chemins relatifs
          if (content !== originalContent) {
            fs.writeFileSync(indexPath, content);
            console.log('✅ Chemins mis à jour dans index.html pour être relatifs');
          } else {
            console.log('ℹ️ Aucun chemin absolu détecté dans index.html');
          }
          
          // Vérifier également les fichiers JS dans dist/assets
          if (fs.existsSync('./dist/assets')) {
            const jsFiles = fs.readdirSync('./dist/assets', { withFileTypes: true })
              .filter(file => file.isFile() && (file.name.endsWith('.js') || file.name.endsWith('.mjs')))
              .map(file => path.join('./dist/assets', file.name));
            
            let jsFilesFixed = 0;
            
            jsFiles.forEach(jsFile => {
              try {
                let jsContent = fs.readFileSync(jsFile, 'utf-8');
                let originalJsContent = jsContent;
                
                // Corriger les imports relatifs dans les fichiers JS
                jsContent = jsContent.replace(/from"\//g, 'from"./');
                jsContent = jsContent.replace(/import"\//g, 'import"./');
                
                // S'il y a eu des changements, sauvegarder le fichier
                if (jsContent !== originalJsContent) {
                  fs.writeFileSync(jsFile, jsContent);
                  jsFilesFixed++;
                }
              } catch (error) {
                console.error(`❌ Erreur lors de la modification de ${jsFile}:`, error);
              }
            });
            
            if (jsFilesFixed > 0) {
              console.log(`✅ Chemins corrigés dans ${jsFilesFixed} fichiers JS`);
            } else {
              console.log('ℹ️ Aucun chemin absolu détecté dans les fichiers JS');
            }
          }
        } else {
          console.log('❌ Impossible de trouver dist/index.html');
        }
      }
    }
  };
};

// Plugin pour copier les fichiers _redirects et _headers dans le dossier dist
const copyRedirectsAndHeaders = (): PluginOption => {
  return {
    name: 'copy-redirects-headers',
    closeBundle() {
      // Copier le fichier diagnostic.html vers dist
      if (fs.existsSync('./public/diagnostic.html')) {
        fs.copyFileSync('./public/diagnostic.html', './dist/diagnostic.html');
        console.log('✅ diagnostic.html copié dans dist');
      }
      
      // Copier le fichier _redirects vers dist
      if (fs.existsSync('./_redirects')) {
        fs.copyFileSync('./_redirects', './dist/_redirects');
        console.log('✅ _redirects copié dans dist');
      } else {
        // Créer un fichier _redirects basique
        fs.writeFileSync('./dist/_redirects', '/* /index.html 200\n');
        console.log('✅ _redirects créé dans dist');
      }

      // Copier le fichier _headers vers dist
      if (fs.existsSync('./_headers')) {
        fs.copyFileSync('./_headers', './dist/_headers');
        console.log('✅ _headers copié dans dist');
      }
      
      // Copier le GIF d'animation dans dist
      if (fs.existsSync('./public/filechat-animation.gif')) {
        fs.copyFileSync('./public/filechat-animation.gif', './dist/filechat-animation.gif');
        console.log('✅ filechat-animation.gif copié dans dist');
      }
    }
  };
};

// Utiliser defineConfig pour typer correctement la configuration
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization, apikey, x-client-info",
    },
  },
  plugins: [
    react({
      jsxRuntime: 'automatic',
      babel: {
        plugins: []
      }
    }),
    mode === 'development' ? componentTagger() : undefined,
    copyRedirectsAndHeaders(), 
    ensureRelativePaths()
  ].filter(Boolean) as PluginOption[],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    }
  },
  build: {
    minify: 'terser',
    sourcemap: true, // Activer les sourcemaps pour le débogage en production
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash].[ext]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
        
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('react') || id.includes('react-dom')) return 'vendor-react';
            if (id.includes('@radix-ui')) return 'vendor-radix';
            if (id.includes('lucide')) return 'vendor-lucide';
            return 'vendor';
          }
        },
      },
      external: [
        'https://cdn.gpteng.co/gptengineer.js'
      ]
    },
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
    copyPublicDir: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['gptengineer']
  },
  assetsInclude: ['**/*.gif', '**/*.png', '**/*.jpg', '**/*.svg'],
  define: {
    __LOVABLE_MODE__: JSON.stringify(mode),
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
  base: './', // Fondamental pour les chemins relatifs
}));

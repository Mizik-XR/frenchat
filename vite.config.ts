
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from 'fs';
import type { PluginOption } from 'vite';

// Plugin amélioré pour assurer que les chemins sont relatifs
const ensureRelativePaths = (): PluginOption => {
  return {
    name: 'ensure-relative-paths',
    enforce: 'post',
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
                jsContent = jsContent.replace(/asset:\//g, 'asset:./');
                
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
            }
          }
        } else {
          console.log('❌ Impossible de trouver dist/index.html');
        }
      }
    }
  };
};

// Plugin amélioré pour copier les fichiers importants avec plus de logs
const copyImportantFiles = (): PluginOption => {
  return {
    name: 'copy-important-files',
    closeBundle() {
      console.log('⚙️ Copie des fichiers importants vers le dossier dist...');
      
      // Créer le dossier assets s'il n'existe pas
      if (!fs.existsSync('./dist/assets')) {
        fs.mkdirSync('./dist/assets', { recursive: true });
        console.log('✅ Dossier assets créé dans dist');
      }
      
      // Liste des fichiers à copier avec leurs sources et destinations
      const filesToCopy = [
        { src: './public/filechat-animation.gif', dest: './dist/filechat-animation.gif' },
        { src: './public/filechat-animation.gif', dest: './dist/assets/filechat-animation.gif' },
        { src: './public/diagnostic.html', dest: './dist/diagnostic.html' },
        { src: './_redirects', dest: './dist/_redirects' },
        { src: './_headers', dest: './dist/_headers' },
        // Assurez-vous que le custom-placeholder.svg est copié également
        { src: './src/assets/custom-placeholder.svg', dest: './dist/assets/custom-placeholder.svg' }
      ];
      
      // Copier chaque fichier
      filesToCopy.forEach(file => {
        try {
          if (fs.existsSync(file.src)) {
            // Créer le répertoire de destination s'il n'existe pas
            const destDir = path.dirname(file.dest);
            if (!fs.existsSync(destDir)) {
              fs.mkdirSync(destDir, { recursive: true });
            }
            
            fs.copyFileSync(file.src, file.dest);
            console.log(`✅ Fichier ${file.src} copié vers ${file.dest}`);
          } else {
            console.warn(`⚠️ Fichier source ${file.src} introuvable, création de la valeur par défaut`);
            
            // Créer un fichier par défaut si nécessaire
            if (file.dest.includes('_redirects')) {
              fs.writeFileSync(file.dest, '/* /index.html 200\n');
              console.log(`✅ Fichier ${file.dest} créé avec valeur par défaut`);
            }
          }
        } catch (error) {
          console.error(`❌ Erreur lors de la copie de ${file.src} vers ${file.dest}:`, error);
        }
      });
      
      console.log('✅ Copie des fichiers terminée');
    }
  };
};

// Configuration Vite optimisée
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
    copyImportantFiles(),
    ensureRelativePaths()
  ].filter(Boolean) as PluginOption[],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    }
  },
  build: {
    minify: 'terser',
    sourcemap: true,
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    assetsInlineLimit: 0, // Désactiver l'inlining des petits fichiers pour garantir qu'ils sont toujours copiés
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

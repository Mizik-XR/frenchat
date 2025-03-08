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
          content = content.replace(/src="\/assets/g, 'src="./assets');
          content = content.replace(/href="\/assets/g, 'href="./assets');
          
          // S'assurer que les vendors sont aussi avec des chemins relatifs
          content = content.replace(/src="\/vendor-/g, 'src="./vendor-');
          content = content.replace(/from="\/vendor-/g, 'from="./vendor-');
          
          // Mettre à jour index.html avec des chemins relatifs
          if (content !== originalContent) {
            fs.writeFileSync(indexPath, content);
            console.log('✅ Chemins mis à jour dans index.html pour être relatifs');
          } else {
            console.log('ℹ️ Aucun chemin absolu détecté dans index.html');
          }
          
          // Vérifier également les fichiers JS dans dist
          const jsFiles = fs.readdirSync('./dist', { withFileTypes: true })
            .filter(file => file.isFile() && (file.name.endsWith('.js') || file.name.endsWith('.mjs')))
            .map(file => path.join('./dist', file.name));
          
          let jsFilesFixed = 0;
          
          jsFiles.forEach(jsFile => {
            try {
              let jsContent = fs.readFileSync(jsFile, 'utf-8');
              let originalJsContent = jsContent;
              
              // Corriger les imports relatifs dans les fichiers JS
              jsContent = jsContent.replace(/from"\//g, 'from"./');
              jsContent = jsContent.replace(/import"\//g, 'import"./');
              jsContent = jsContent.replace(/fetch\("\/assets/g, 'fetch("./assets');
              jsContent = jsContent.replace(/fetch\('\//g, 'fetch(\'./');
              jsContent = jsContent.replace(/new URL\("\//g, 'new URL("./');
              jsContent = jsContent.replace(/new URL\('\//g, 'new URL(\'./');
              
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
        } else {
          console.log('❌ Impossible de trouver dist/index.html');
        }
      }
    }
  };
};

// Plugin pour assurer que le script Lovable est inclus
const ensureLovableScript = (): PluginOption => {
  return {
    name: 'ensure-lovable-script',
    writeBundle: {
      sequential: true,
      order: "post" as const,
      handler() {
        const indexPath = path.resolve('./dist/index.html');
        if (fs.existsSync(indexPath)) {
          let content = fs.readFileSync(indexPath, 'utf-8');
          // Vérifier si le script Lovable est manquant
          if (!content.includes('cdn.gpteng.co/gptengineer.js')) {
            // Trouver la balise </body> de fermeture et insérer le script avant celle-ci
            content = content.replace(
              '</body>',
              '  <script src="https://cdn.gpteng.co/gptengineer.js" type="module"></script>\n</body>'
            );
            // Mettre à jour index.html avec le script
            fs.writeFileSync(indexPath, content);
            console.log('✅ Script Lovable ajouté à index.html');
          } else {
            console.log('✅ Le script Lovable existe déjà dans index.html');
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
      // Chemins des fichiers
      const redirectsSrc = path.resolve('./_redirects');
      const redirectsDest = path.resolve('./dist/_redirects');
      const headersSrc = path.resolve('./_headers');
      const headersDest = path.resolve('./dist/_headers');
      
      // Copier _redirects s'il existe
      if (fs.existsSync(redirectsSrc)) {
        fs.copyFileSync(redirectsSrc, redirectsDest);
        console.log('✅ _redirects copié dans dist');
      } else {
        // Créer un fichier _redirects basique
        fs.writeFileSync(redirectsDest, '/* /index.html 200\n');
        console.log('✅ _redirects créé dans dist');
      }
      
      // Copier _headers s'il existe
      if (fs.existsSync(headersSrc)) {
        fs.copyFileSync(headersSrc, headersDest);
        console.log('✅ _headers copié dans dist');
      } else if (fs.existsSync('scripts/_headers')) {
        // Essayer de copier depuis le répertoire scripts si non trouvé à la racine
        fs.copyFileSync('scripts/_headers', headersDest);
        console.log('✅ _headers copié depuis le répertoire scripts vers dist');
      }
    }
  };
};

// Nouveau plugin pour le post-traitement des builds Netlify
const postBuildProcessing = (): PluginOption => {
  return {
    name: 'post-build-processing',
    closeBundle() {
      console.log('⚙️ Exécution du post-traitement du build...');
      
      // Ajouter des variables d'environnement de build
      const indexPath = path.resolve('./dist/index.html');
      if (fs.existsSync(indexPath)) {
        let content = fs.readFileSync(indexPath, 'utf-8');
        
        // Injecter des variables de build dans une balise script pour la détection côté client
        const buildInfo = `
        <script>
          window.BUILD_INFO = {
            buildTime: "${new Date().toISOString()}",
            version: "${process.env.npm_package_version || '1.0.0'}",
            environment: "${process.env.NODE_ENV || 'production'}",
            netlify: true
          };
        </script>`;
        
        // Insérer avant la balise de fermeture </head>
        content = content.replace('</head>', `${buildInfo}\n</head>`);
        fs.writeFileSync(indexPath, content);
        
        console.log('✅ Informations de build injectées dans index.html');
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
    ensureRelativePaths(), 
    ensureLovableScript(),
    postBuildProcessing()
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
    'import.meta.env.VITE_BUILD_TIME': JSON.stringify(new Date().toISOString()),
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version || '1.0.0')
  },
  base: './', // Fondamental pour les chemins relatifs
}));

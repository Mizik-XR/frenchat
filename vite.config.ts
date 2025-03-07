
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
    writeBundle: {
      sequential: true,
      order: "post" as const,
      handler() {
        const indexPath = path.resolve('./dist/index.html');
        if (fs.existsSync(indexPath)) {
          let content = fs.readFileSync(indexPath, 'utf-8');
          
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
          fs.writeFileSync(indexPath, content);
          console.log('✅ Chemins mis à jour dans index.html pour être relatifs');
          
          // Vérifier également les fichiers JS dans dist
          const jsFiles = fs.readdirSync('./dist', { withFileTypes: true })
            .filter(file => file.isFile() && file.name.endsWith('.js'))
            .map(file => path.join('./dist', file.name));
          
          jsFiles.forEach(jsFile => {
            try {
              let jsContent = fs.readFileSync(jsFile, 'utf-8');
              let originalContent = jsContent;
              
              // Corriger les imports relatifs dans les fichiers JS
              jsContent = jsContent.replace(/from"\//g, 'from"./');
              jsContent = jsContent.replace(/import"\//g, 'import"./');
              jsContent = jsContent.replace(/import"\.\//g, 'import"./');
              
              // S'il y a eu des changements, sauvegarder le fichier
              if (jsContent !== originalContent) {
                fs.writeFileSync(jsFile, jsContent);
                console.log(`✅ Chemins corrigés dans ${path.basename(jsFile)}`);
              }
            } catch (error) {
              console.error(`❌ Erreur lors de la modification de ${jsFile}:`, error);
            }
          });
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
      // Configurer React pour éviter les conflits potentiels
      jsxRuntime: 'automatic',
      babel: {
        plugins: []
      }
    }),
    mode === 'development' ? componentTagger() : undefined,
    copyRedirectsAndHeaders(), 
    ensureRelativePaths(), 
    ensureLovableScript()
  ].filter(Boolean) as PluginOption[],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Configuration améliorée pour la production
  build: {
    // Utiliser esbuild au lieu de terser pour la minification
    minify: 'esbuild',
    // Configuration esbuild pour la minification
    target: 'es2015',
    // S'assurer que les fichiers statiques importants sont copiés dans le build
    rollupOptions: {
      output: {
        // Assurer que les assets utilisent des chemins relatifs
        assetFileNames: 'assets/[name].[hash].[ext]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
        
        // Diviser le code en chunks pour un meilleur chargement
        manualChunks: (id) => {
          // Créer un chunk pour chaque lib importante
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('react') || id.includes('react-dom')) return 'vendor-react';
            if (id.includes('@radix-ui')) return 'vendor-radix';
            if (id.includes('lucide')) return 'vendor-lucide';
            return 'vendor'; // autres libs
          }
        },
      },
      external: [
        // Exclure le script gptengineer.js du processus de bundling
        'https://cdn.gpteng.co/gptengineer.js'
      ]
    },
    // Activer la compression
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000, // Augmenter la limite d'avertissement
    // S'assurer que les fichiers _redirects et _headers sont copiés dans le dossier de build
    copyPublicDir: true,
  },
  // Configuration pour améliorer le comportement du cache
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['gptengineer']
  },
  // Configuration de gestion des assets
  assetsInclude: ['**/*.gif', '**/*.png', '**/*.jpg', '**/*.svg'],
  // Configuration de script pour les modes développement et production
  define: {
    __LOVABLE_MODE__: JSON.stringify(mode),
  },
  // Configuration pour assurer des chemins relatifs
  base: './',
}));

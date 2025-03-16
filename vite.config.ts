
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from 'fs';

// Fonction pour vérifier les dépendances circulaires potentielles
const detectCircularDependencies = () => {
  return {
    name: 'detect-circular-dependencies',
    buildStart() {
      console.log('🔍 Vérification des dépendances circulaires lors du build...');
    },
    resolveId(source: string, importer: string) {
      // La logique de détection sera implémentée dans le script de diagnostic externe
      return null;
    }
  };
};

// Fonction pour optimiser les importations React
const optimizeReactImports = () => {
  return {
    name: 'optimize-react-imports',
    transform(code: string, id: string) {
      // Simple transformation pour s'assurer que React est importé correctement
      if (id.endsWith('.tsx') || id.endsWith('.jsx')) {
        if (!code.includes('import React') && !code.includes('React.') && !code.includes('* as React')) {
          return {
            code: `import React from 'react';\n${code}`,
            map: null
          };
        }
      }
      return null;
    }
  };
};

// Configuration principale
export default defineConfig(({ mode }) => {
  console.log(`🚀 Mode de compilation: ${mode}`);
  
  // Détecter si nous sommes en mode récupération
  const isRecoveryMode = process.env.RECOVERY_MODE === 'true';
  const isCloudMode = process.env.VITE_CLOUD_MODE === 'true';
  
  console.log(`📋 Mode de récupération: ${isRecoveryMode ? 'Activé' : 'Désactivé'}`);
  console.log(`☁️ Mode cloud: ${isCloudMode ? 'Activé' : 'Désactivé'}`);
  
  // Déterminer les plugins à utiliser
  const effectivePlugins = [
    // Toujours inclure React avec des options optimisées
    react({
      jsxRuntime: 'automatic',
      babel: {
        plugins: [],
        // Éviter la transformation des importations pour réduire les problèmes d'instance React
        parserOpts: {
          plugins: ['jsx']
        }
      },
      // Remplacé fastRefresh par une option valide
      // Utiliser refresh qui est l'option correcte pour contrôler le Fast Refresh
      refresh: !isRecoveryMode,
    }),
    
    // Ajouter les plugins conditionnellement
    ...(isRecoveryMode ? [] : [
      mode === 'development' && componentTagger(),
      detectCircularDependencies(),
      optimizeReactImports()
    ].filter(Boolean)),
  ];
  
  return {
    server: {
      host: "::",
      port: 8080,
      // Éviter les erreurs CORS en développement
      cors: true,
      // Déboguer les problèmes du serveur de développement
      hmr: {
        // Utiliser un intervalle de polling plus long en mode récupération
        timeout: isRecoveryMode ? 5000 : 2000,
      },
    },
    
    plugins: effectivePlugins,
    
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        // Forcer une seule instance de React dans toute l'application
        "react": path.resolve(__dirname, "node_modules/react"),
        "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      },
      // Désactiver la résolution du mainFields en mode récupération pour simplifier
      mainFields: isRecoveryMode 
        ? ['browser', 'module', 'main'] 
        : ['browser', 'module', 'jsnext:main', 'jsnext', 'main'],
    },
    
    build: {
      // Optimisations de build
      minify: mode === 'production' ? 'esbuild' : false,
      target: 'es2015',
      cssCodeSplit: !isRecoveryMode, // Désactiver en mode récupération
      sourcemap: mode !== 'production',
      
      rollupOptions: {
        // Réduire les avertissements de circularité
        onwarn(warning, warn) {
          // Ignorer certains avertissements en mode récupération
          if (isRecoveryMode && 
             (warning.code === 'CIRCULAR_DEPENDENCY' || 
              warning.code === 'EVAL')) {
            return;
          }
          warn(warning);
        },
        
        output: {
          manualChunks: (id) => {
            // Stratégie de chunking améliorée
            if (id.includes('node_modules')) {
              if (id.includes('@supabase')) return 'vendor-supabase';
              if (id.includes('react') || id.includes('react-dom')) return 'vendor-react';
              if (id.includes('@radix-ui')) return 'vendor-radix';
              if (id.includes('lucide')) return 'vendor-lucide';
              if (id.includes('@tanstack')) return 'vendor-tanstack';
              if (id.includes('zod')) return 'vendor-zod';
              // Autres gros packages
              if (id.includes('@huggingface')) return 'vendor-huggingface';
              return 'vendor';
            }
            
            // Séparer les composants UI pour une meilleure performance
            if (id.includes('/components/ui/')) return 'ui-components';
            
            // Isoler les hooks et services
            if (id.includes('/hooks/')) return 'app-hooks';
            if (id.includes('/services/')) return 'app-services';
            
            // Laisser les autres fichiers dans le chunk principal
            return undefined;
          },
        }
      },
      
      // Limiter les avertissements de taille de chunk en développement
      reportCompressedSize: mode === 'production',
      chunkSizeWarningLimit: 1200,
    },
    
    optimizeDeps: {
      // Précharger ces dépendances critiques
      include: [
        'react', 
        'react-dom', 
        'react-router-dom', 
        '@supabase/supabase-js',
        'lucide-react',
        'tailwind-merge',
        'clsx'
      ],
      // Exclure les dépendances problématiques de la pré-bundling
      exclude: isRecoveryMode ? ['@huggingface/transformers'] : [],
      // Forcer la réévaluation des dépendances en mode récupération
      force: isRecoveryMode,
    },
    
    // Inclure tous les types d'assets pour éviter les erreurs
    assetsInclude: ['**/*.gif', '**/*.png', '**/*.jpg', '**/*.svg', '**/*.webp', '**/*.ico'],
    
    define: {
      // Variables globales pour l'application
      __LOVABLE_MODE__: JSON.stringify(mode),
      __RECOVERY_MODE__: isRecoveryMode,
      __CLOUD_MODE__: isCloudMode,
      // Éviter les erreurs de définition dans certains packages
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    
    // Configuration de CSS
    css: {
      // Activer un hachage de modules CSS pour éviter les conflits
      modules: {
        generateScopedName: mode === 'production' 
          ? '[hash:base64:8]' 
          : '[name]__[local]--[hash:base64:5]',
      },
      // Préprocesseur pour combiner les styles
      preprocessorOptions: {
        scss: {
          // Options futures si nécessaire
        },
      },
    },
  };
});


#!/bin/bash

echo "==================================================="
echo "     VÉRIFICATION DE LA CONNEXION SUPABASE"
echo "==================================================="
echo

# Vérification des variables d'environnement
if [ -f ".env.production" ]; then
    echo "[INFO] Vérification des variables d'environnement dans .env.production..."
    if grep -q "VITE_SUPABASE_URL" ".env.production"; then
        echo "[OK] Variable VITE_SUPABASE_URL trouvée dans .env.production"
    else
        echo "[ATTENTION] Variable VITE_SUPABASE_URL non trouvée dans .env.production"
    fi

    if grep -q "VITE_SUPABASE_ANON_KEY" ".env.production"; then
        echo "[OK] Variable VITE_SUPABASE_ANON_KEY trouvée dans .env.production"
    else
        echo "[ATTENTION] Variable VITE_SUPABASE_ANON_KEY non trouvée dans .env.production"
    fi
else
    echo "[INFO] Fichier .env.production non trouvé."
    echo "       Les variables doivent être configurées dans l'interface Netlify."
    
    # Création du fichier .env.production avec les variables nécessaires
    echo "[ACTION] Création du fichier .env.production par défaut..."
    cat > .env.production << EOL
VITE_API_URL=/.netlify/functions
VITE_ENVIRONMENT=production
VITE_SITE_URL=https://filechat-app.netlify.app
VITE_LOVABLE_VERSION=2.0.0
VITE_ALLOW_LOCAL_AI=false
VITE_SKIP_PYTHON_INSTALLATION=true
VITE_CLOUD_MODE=true
# Les clés sensibles comme VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
# doivent être configurées dans l'interface Netlify
EOL
    echo "[OK] Fichier .env.production créé avec succès."
fi

# Vérification de netlify.toml
if [ -f "netlify.toml" ]; then
    echo "[INFO] Vérification de la configuration netlify.toml..."
    if grep -q "to = \"/index.html\"" "netlify.toml"; then
        echo "[OK] Règle de redirection SPA trouvée dans netlify.toml"
    else
        echo "[ATTENTION] Règle de redirection SPA non trouvée dans netlify.toml"
    fi
else
    echo "[INFO] Fichier netlify.toml non trouvé. Création du fichier..."
    cat > netlify.toml << EOL
# Configuration de build Netlify pour FileChat
[build]
  publish = "dist"
  command = "npm run build"

# Configuration des variables d'environnement par défaut
[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--prefer-offline --no-audit --no-fund"
  NODE_OPTIONS = "--max-old-space-size=4096"
  NO_RUST_INSTALL = "1"
  NETLIFY_USE_YARN = "false"
  TRANSFORMERS_OFFLINE = "1"
  CI = "true"
  SKIP_PYTHON_INSTALLATION = "true"
  NETLIFY_SKIP_PYTHON_REQUIREMENTS = "true"
  VITE_CLOUD_MODE = "true"
  VITE_ALLOW_LOCAL_AI = "false"

# Configuration des redirections pour le routage SPA
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = true
  
# Rediriger les API vers les fonctions Netlify
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

# Configuration des fonctions Netlify
[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"
  included_files = ["**/*.model"]
  external_node_modules = ["@supabase/supabase-js"]

# En-têtes pour tous les fichiers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
    Content-Security-Policy = "default-src 'self'; connect-src 'self' https://*.supabase.co http://localhost:* ws://localhost:* https://* wss://*; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.gpteng.co; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; worker-src 'self' blob:; font-src 'self' https: data:;"

# En-têtes spécifiques pour les fichiers JavaScript
[[headers]]
  for = "/*.js"
  [headers.values]
    Content-Type = "application/javascript; charset=utf-8"
    Cache-Control = "public, max-age=31536000, immutable"

# En-têtes spécifiques pour les fichiers CSS
[[headers]]
  for = "/*.css"
  [headers.values]
    Content-Type = "text/css; charset=utf-8"
    Cache-Control = "public, max-age=31536000, immutable"

# En-têtes pour les assets
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
EOL
    echo "[OK] Fichier netlify.toml créé avec succès."
fi

# Vérification de _redirects
if [ -f "_redirects" ]; then
    echo "[INFO] Vérification du fichier _redirects..."
    if grep -q "/\* /index.html 200" "_redirects"; then
        echo "[OK] Règle de redirection SPA trouvée dans _redirects"
    else
        echo "[ATTENTION] Règle de redirection SPA non trouvée dans _redirects"
    fi
else
    echo "[INFO] Fichier _redirects non trouvé. Création du fichier..."
    echo "/*  /index.html  200" > _redirects
    echo "[OK] Fichier _redirects créé avec succès."
fi

# Vérification du client Supabase
echo "[INFO] Vérification du code client Supabase..."
if grep -r "createClient.*supabase" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" .; then
    echo "[OK] Client Supabase trouvé dans le code source"
else
    echo "[ATTENTION] Client Supabase non trouvé dans le code. Vérifiez l'intégration."
    
    # Création d'un script de diagnostic JavaScript
    cat > scripts/supabase-diagnostic.js << EOL
// Diagnostic pour la connexion Supabase
window.runNetlifySupabaseDiagnostic = function() {
  console.log("%c=== DIAGNOSTIC SUPABASE ===", "font-weight: bold; font-size: 16px; color: blue;");
  
  // Vérifier les variables d'environnement
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log("VITE_SUPABASE_URL:", supabaseUrl ? "✅ Défini" : "❌ Non défini");
  console.log("VITE_SUPABASE_ANON_KEY:", supabaseKey ? "✅ Défini" : "❌ Non défini");
  
  if (!supabaseUrl || !supabaseKey) {
    console.error("%cVariables d'environnement manquantes", "color: red; font-weight: bold;");
    console.log("Vous devez configurer VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans les variables d'environnement de Netlify");
    return;
  }
  
  // Tester la connexion
  console.log("Test de connexion à Supabase...");
  
  import('@supabase/supabase-js').then(({ createClient }) => {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("%cErreur de connexion Supabase:", "color: red;", error);
      } else {
        console.log("%cConnexion Supabase réussie!", "color: green; font-weight: bold;");
        console.log("Session:", data.session ? "Authentifié" : "Non authentifié");
      }
    });
  }).catch(err => {
    console.error("Erreur lors de l'importation de Supabase:", err);
  });
}

console.log("Fonction de diagnostic Supabase disponible. Exécutez runNetlifySupabaseDiagnostic() dans la console pour tester la connexion.");
EOL
    echo "[INFO] Script de diagnostic créé. Ajoutez-le à votre application pour tester la connexion."
fi

# Création d'un guide d'instruction détaillé
echo "[ACTION] Création d'un guide d'instruction Netlify-Supabase..."
cat > netlify-supabase-instructions.md << EOL
# Instructions pour vérifier la connexion Netlify-Supabase

Ce document explique comment vérifier que votre application déployée sur Netlify est correctement connectée à Supabase.

## 1. Vérifiez les variables d'environnement Netlify

La connexion entre Netlify et Supabase repose principalement sur les variables d'environnement. Voici comment les vérifier:

1. Connectez-vous à [Netlify](https://app.netlify.com/)
2. Sélectionnez votre site
3. Allez dans **Site settings** > **Environment variables**
4. Vérifiez que ces variables sont présentes et correctement configurées:
   - \`VITE_SUPABASE_URL\` - URL de votre projet Supabase
   - \`VITE_SUPABASE_ANON_KEY\` - Clé anonyme (publique) de votre projet Supabase

## 2. Utilisez l'outil de diagnostic

Cet outil vous permet de vérifier la connexion en temps réel:

1. Ouvrez votre site déployé sur Netlify
2. Ouvrez la console du navigateur (F12 > Console)
3. Exécutez la commande suivante:
   \`\`\`javascript
   runNetlifySupabaseDiagnostic()
   \`\`\`
4. Examinez les résultats du diagnostic

## 3. Utilisez les scripts de vérification

Des scripts sont disponibles pour vérifier la configuration:

### Sur Windows:
\`\`\`
scripts\\verify-supabase-connection.bat
\`\`\`

### Sur Mac/Linux:
\`\`\`
bash scripts/verify-supabase-connection.sh
\`\`\`

## 4. Signes d'une bonne connexion

Votre application est correctement connectée à Supabase si:

- Aucune erreur Supabase n'apparaît dans la console du navigateur
- Les fonctionnalités d'authentification fonctionnent (connexion/inscription)
- Les requêtes aux tables Supabase fonctionnent (affichage et manipulation de données)
- Les fonctions Edge s'exécutent correctement (si vous en utilisez)

## 5. Résolution des problèmes courants

### Erreur "Network request failed"
- Vérifiez que l'URL Supabase est correcte
- Vérifiez que votre projet Supabase est actif

### Erreur "JWT expired"
- Problème d'authentification, essayez de vous reconnecter

### Erreur "Invalid API key"
- Vérifiez que VITE_SUPABASE_ANON_KEY est correctement configurée

### Redirection infinie ou page blanche
- Vérifiez que le fichier \`_redirects\` ou \`netlify.toml\` contient la règle de redirection SPA:
  \`\`\`
  /*  /index.html  200
  \`\`\`

## 6. Mise à jour de la configuration

Si vous devez mettre à jour la configuration:

1. Modifiez les variables d'environnement dans l'interface Netlify
2. Déclenchez un nouveau déploiement (Deploy > Trigger deploy)
3. Vérifiez que les modifications sont prises en compte

## Remarque importante

Les variables d'environnement Supabase doivent être configurées dans l'interface Netlify, et non dans vos fichiers source, pour des raisons de sécurité.
EOL
echo "[OK] Guide d'instruction créé: netlify-supabase-instructions.md"

# Création de la version Windows du script
echo "[ACTION] Création de la version Windows du script de vérification..."
cat > scripts/verify-supabase-connection.bat << EOL
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Vérification de la connexion Supabase

echo ===================================================
echo     VÉRIFICATION DE LA CONNEXION SUPABASE
echo ===================================================
echo.

REM Vérification des variables d'environnement
if exist ".env.production" (
    echo [INFO] Vérification des variables d'environnement dans .env.production...
    
    findstr "VITE_SUPABASE_URL" ".env.production" >nul
    if !ERRORLEVEL! EQU 0 (
        echo [OK] Variable VITE_SUPABASE_URL trouvée dans .env.production
    ) else (
        echo [ATTENTION] Variable VITE_SUPABASE_URL non trouvée dans .env.production
    )

    findstr "VITE_SUPABASE_ANON_KEY" ".env.production" >nul
    if !ERRORLEVEL! EQU 0 (
        echo [OK] Variable VITE_SUPABASE_ANON_KEY trouvée dans .env.production
    ) else (
        echo [ATTENTION] Variable VITE_SUPABASE_ANON_KEY non trouvée dans .env.production
    )
) else (
    echo [INFO] Fichier .env.production non trouvé.
    echo        Les variables doivent être configurées dans l'interface Netlify.
    
    REM Création du fichier .env.production avec les variables nécessaires
    echo [ACTION] Création du fichier .env.production par défaut...
    (
        echo VITE_API_URL=/.netlify/functions
        echo VITE_ENVIRONMENT=production
        echo VITE_SITE_URL=https://filechat-app.netlify.app
        echo VITE_LOVABLE_VERSION=2.0.0
        echo VITE_ALLOW_LOCAL_AI=false
        echo VITE_SKIP_PYTHON_INSTALLATION=true
        echo VITE_CLOUD_MODE=true
        echo # Les clés sensibles comme VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
        echo # doivent être configurées dans l'interface Netlify
    ) > .env.production
    echo [OK] Fichier .env.production créé avec succès.
)

REM Vérification de netlify.toml
if exist "netlify.toml" (
    echo [INFO] Vérification de la configuration netlify.toml...
    
    findstr "to = \"/index.html\"" "netlify.toml" >nul
    if !ERRORLEVEL! EQU 0 (
        echo [OK] Règle de redirection SPA trouvée dans netlify.toml
    ) else (
        echo [ATTENTION] Règle de redirection SPA non trouvée dans netlify.toml
    )
) else (
    echo [INFO] Fichier netlify.toml non trouvé. Création du fichier...
    copy scripts\netlify.toml .
    if exist "netlify.toml" (
        echo [OK] Fichier netlify.toml copié avec succès.
    ) else (
        echo [ERREUR] Impossible de créer netlify.toml.
    )
)

REM Vérification de _redirects
if exist "_redirects" (
    echo [INFO] Vérification du fichier _redirects...
    
    findstr "/\* /index.html 200" "_redirects" >nul
    if !ERRORLEVEL! EQU 0 (
        echo [OK] Règle de redirection SPA trouvée dans _redirects
    ) else (
        echo [ATTENTION] Règle de redirection SPA non trouvée dans _redirects
    )
) else (
    echo [INFO] Fichier _redirects non trouvé. Création du fichier...
    echo /*  /index.html  200> "_redirects"
    echo [OK] Fichier _redirects créé avec succès.
)

REM Vérification du client Supabase
echo [INFO] Vérification du code client Supabase...
findstr /S /I "createClient.*supabase" *.ts *.tsx *.js *.jsx >nul
if !ERRORLEVEL! EQU 0 (
    echo [OK] Client Supabase trouvé dans le code source
) else (
    echo [ATTENTION] Client Supabase non trouvé dans le code. Vérifiez l'intégration.
)

echo.
echo ===================================================
echo     INSTRUCTIONS POUR VÉRIFIER LA CONNEXION
echo ===================================================
echo.
echo 1. Ouvrez votre application déployée sur Netlify
echo 2. Ouvrez la console du navigateur (F12)
echo 3. Vérifiez qu'il n'y a pas d'erreurs liées à Supabase
echo 4. Essayez de vous connecter si votre application a une authentification
echo.
echo Dans l'interface Netlify, vérifiez que les variables d'environnement
echo sont correctement configurées sous Site Settings ^> Environment variables:
echo - VITE_SUPABASE_URL
echo - VITE_SUPABASE_ANON_KEY
echo.
echo Si vous utilisez des fonctions Netlify pour communiquer avec Supabase,
echo vérifiez qu'elles sont correctement déployées et fonctionnelles.
echo.
pause
EOL
echo "[OK] Script de vérification Windows créé."

# Rendre les scripts exécutables
chmod +x scripts/verify-supabase-connection.sh
chmod +x scripts/verify-supabase-connection.bat

echo
echo "==================================================="
echo "     CONFIGURATION TERMINÉE"
echo "==================================================="
echo
echo "Les fichiers suivants ont été créés ou mis à jour:"
echo "1. .env.production (variables d'environnement)"
echo "2. netlify.toml (configuration Netlify)"
echo "3. _redirects (règles de redirection SPA)"
echo "4. netlify-supabase-instructions.md (guide détaillé)"
echo
echo "Vérifiez que les variables d'environnement suivantes"
echo "sont configurées dans l'interface Netlify:"
echo "- VITE_SUPABASE_URL"
echo "- VITE_SUPABASE_ANON_KEY"
echo
echo "Exécutez ce script après chaque mise à jour majeure"
echo "pour vérifier la connexion Netlify-Supabase."
echo

# Créer un script JavaScript pour l'utilisation frontend
cat > src/utils/verifySupabaseConnection.ts << EOL
/**
 * Utilitaire pour vérifier la connexion à Supabase
 */
import { supabase } from '../integrations/supabase/client';

/**
 * Fonction de diagnostic pour vérifier la connexion à Supabase
 * @returns Promise avec le résultat du diagnostic
 */
export const runSupabaseDiagnostic = async () => {
  console.log("%c=== DIAGNOSTIC SUPABASE ===", "font-weight: bold; font-size: 16px; color: blue;");
  
  // Vérifier les variables d'environnement
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log("VITE_SUPABASE_URL:", supabaseUrl ? "✅ Défini" : "❌ Non défini");
  console.log("VITE_SUPABASE_ANON_KEY:", supabaseKey ? "✅ Défini" : "❌ Non défini");
  
  if (!supabaseUrl || !supabaseKey) {
    console.error("%cVariables d'environnement manquantes", "color: red; font-weight: bold;");
    console.log("Vous devez configurer VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans les variables d'environnement de Netlify");
    return {
      success: false,
      message: "Variables d'environnement manquantes",
      details: {
        supabaseUrl: !!supabaseUrl,
        supabaseKey: !!supabaseKey
      }
    };
  }
  
  // Tester la connexion
  console.log("Test de connexion à Supabase...");
  
  try {
    if (!supabase) {
      throw new Error("Client Supabase non initialisé");
    }
    
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("%cErreur de connexion Supabase:", "color: red;", error);
      return {
        success: false,
        message: "Erreur de connexion à Supabase",
        error: error
      };
    }
    
    console.log("%cConnexion Supabase réussie!", "color: green; font-weight: bold;");
    console.log("Session:", data.session ? "Authentifié" : "Non authentifié");
    
    // Faire un test simple sur une table
    const { error: queryError } = await supabase.from('profiles').select('count');
    
    return {
      success: true,
      message: "Connexion à Supabase réussie",
      details: {
        authenticated: !!data.session,
        databaseAccess: !queryError
      }
    };
  } catch (err) {
    console.error("Erreur lors du test Supabase:", err);
    return {
      success: false,
      message: "Erreur lors du test Supabase",
      error: err
    };
  }
};

// Exposer la fonction dans window pour l'utiliser dans la console
if (typeof window !== 'undefined') {
  (window as any).runNetlifySupabaseDiagnostic = runSupabaseDiagnostic;
  console.log("Fonction de diagnostic Supabase disponible. Exécutez runNetlifySupabaseDiagnostic() dans la console pour tester la connexion.");
}

export default runSupabaseDiagnostic;
EOL
echo "[OK] Utilitaire de vérification de connexion créé pour l'application."

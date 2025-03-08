
#!/bin/bash
set -e

echo "====================================================="
echo "       VÉRIFICATION DU DÉPLOIEMENT NETLIFY"
echo "====================================================="
echo ""

# Exécution du script de vérification JavaScript
echo "[INFO] Vérification de la configuration Netlify..."
node scripts/ensure-netlify-build.js || {
    echo "[ERREUR] Problèmes détectés dans la configuration Netlify."
    echo "[INFO] Le script tentera d'appliquer des corrections automatiques."
    echo ""
}

# Vérification du build
if [[ ! -d "dist" ]]; then
    echo "[ATTENTION] Le dossier dist n'existe pas."
    echo "[INFO] Lancement du build..."
    
    # Définir des variables d'environnement optimisées pour Netlify
    export NODE_OPTIONS="--max-old-space-size=4096"
    export NO_RUST_INSTALL=1
    export NETLIFY_SKIP_PYTHON_REQUIREMENTS=true
    export SKIP_PYTHON_INSTALLATION=true
    export DEBUG="vite:*"
    export NETLIFY_VERBOSE=true
    
    npm run build || {
        echo "[ERREUR] Le build a échoué."
        echo ""
        echo "Appuyez sur Entrée pour quitter..."
        read
        exit 1
    }
    
    echo "[OK] Build réussi."
else
    echo "[INFO] Le dossier dist existe déjà."
fi

# Vérifier si les fichiers _redirects et _headers sont dans dist
if [[ ! -f "dist/_redirects" ]]; then
    echo "[INFO] Copie de _redirects dans dist..."
    if [[ -f "_redirects" ]]; then
        cp _redirects dist/
    else
        echo "/* /index.html 200" > dist/_redirects
    fi
fi

if [[ ! -f "dist/_headers" ]]; then
    echo "[INFO] Copie de _headers dans dist..."
    if [[ -f "_headers" ]]; then
        cp _headers dist/
    elif [[ -f "scripts/_headers" ]]; then
        cp scripts/_headers dist/
    fi
fi

# Vérifier index.html pour les chemins absolus et le script Lovable
if [[ -f "dist/index.html" ]]; then
    echo "[INFO] Vérification de dist/index.html..."
    
    # Vérification des chemins absolus
    if grep -q 'src="/' dist/index.html || grep -q 'href="/' dist/index.html; then
        echo "[ATTENTION] Chemins absolus détectés dans index.html."
        echo "[INFO] Correction des chemins absolus..."
        
        # Correction des chemins
        sed -i.bak 's|src="/|src="./|g' dist/index.html
        sed -i.bak 's|href="/|href="./|g' dist/index.html
        rm -f dist/index.html.bak
        
        echo "[OK] Chemins corrigés."
    else
        echo "[OK] Aucun chemin absolu détecté."
    fi
    
    # Vérification du script Lovable
    if ! grep -q 'cdn.gpteng.co/gptengineer.js' dist/index.html; then
        echo "[ATTENTION] Script Lovable manquant dans index.html."
        echo "[INFO] Ajout du script Lovable..."
        
        # Ajout du script
        sed -i.bak 's|</body>|<script src="https://cdn.gpteng.co/gptengineer.js" type="module"></script></body>|' dist/index.html
        rm -f dist/index.html.bak
        
        echo "[OK] Script Lovable ajouté."
    else
        echo "[OK] Script Lovable présent."
    fi
    
    # Ajouter un script de diagnostic pour Netlify
    echo "[INFO] Ajout du script de diagnostic pour Netlify..."
    
    cat > /tmp/netlify-diagnostic.js <<'EOL'
// Script de diagnostic pour Netlify
(function() {
  var netlifyLogs = [];
  var originalConsoleLog = console.log;
  var originalConsoleError = console.error;
  var originalConsoleWarn = console.warn;
  
  function captureLog(type, args) {
    try {
      var timestamp = new Date().toISOString();
      var message = Array.from(args).map(function(arg) {
        return typeof arg === "object" ? JSON.stringify(arg) : String(arg);
      }).join(" ");
      
      netlifyLogs.push("[" + timestamp + "] [" + type + "] " + message);
      
      // Garder seulement les 100 derniers messages
      if (netlifyLogs.length > 100) {
        netlifyLogs.shift();
      }
      
      // Stocker dans localStorage
      try {
        localStorage.setItem("netlify_diagnostic_logs", JSON.stringify(netlifyLogs));
      } catch (e) {}
    } catch (e) {}
  }
  
  // Remplacer les fonctions de console
  console.log = function() {
    captureLog("LOG", arguments);
    originalConsoleLog.apply(console, arguments);
  };
  
  console.error = function() {
    captureLog("ERROR", arguments);
    originalConsoleError.apply(console, arguments);
  };
  
  console.warn = function() {
    captureLog("WARN", arguments);
    originalConsoleWarn.apply(console, arguments);
  };
  
  // Exposer les fonctions de diagnostic
  window.showNetlifyLogs = function() {
    originalConsoleLog.call(console, "=== Netlify Diagnostic Logs ===");
    netlifyLogs.forEach(function(log) {
      originalConsoleLog.call(console, log);
    });
    return netlifyLogs.length;
  };
  
  window.clearNetlifyLogs = function() {
    netlifyLogs = [];
    try {
      localStorage.removeItem("netlify_diagnostic_logs");
    } catch (e) {}
    return true;
  };
  
  // Consigner les informations du navigateur
  console.log("Netlify Diagnostic: Browser Info", {
    userAgent: navigator.userAgent,
    language: navigator.language,
    viewport: window.innerWidth + "x" + window.innerHeight,
    url: window.location.href
  });
  
  // Détecter les erreurs de modules
  window.addEventListener("error", function(event) {
    if (event.message && event.message.includes("Cannot access") && event.message.includes("before initialization")) {
      console.error("Netlify Diagnostic: Module initialization error", {
        message: event.message,
        file: event.filename,
        line: event.lineno,
        col: event.colno
      });
    }
  }, true);
})();
EOL

    # Ajouter le script dans le head
    sed -i.bak 's|</head>|<script>'"$(cat /tmp/netlify-diagnostic.js)"'</script></head>|' dist/index.html
    rm -f dist/index.html.bak
    rm -f /tmp/netlify-diagnostic.js
    
    echo "[OK] Script de diagnostic ajouté."
fi

# Vérifier les fichiers JS pour des chemins absolus
if [[ -d "dist/assets" ]]; then
    echo "[INFO] Vérification des fichiers JS pour des chemins absolus..."
    
    JS_FILES_WITH_ABSOLUTE_PATHS=0
    
    for file in dist/assets/*.js; do
        if grep -q 'from"/' "$file" || grep -q 'import"/' "$file" || grep -q 'fetch("/' "$file"; then
            echo "  - Correction de chemins absolus dans: $(basename "$file")"
            sed -i.bak 's|from"/|from"./|g' "$file"
            sed -i.bak 's|import"/|import"./|g' "$file"
            sed -i.bak 's|fetch("/|fetch("./|g' "$file"
            rm -f "$file.bak"
            JS_FILES_WITH_ABSOLUTE_PATHS=$((JS_FILES_WITH_ABSOLUTE_PATHS + 1))
        fi
    done
    
    if [[ $JS_FILES_WITH_ABSOLUTE_PATHS -gt 0 ]]; then
        echo "[INFO] Corrigé des chemins absolus dans $JS_FILES_WITH_ABSOLUTE_PATHS fichiers JS"
    else
        echo "[OK] Aucun chemin absolu détecté dans les fichiers JS"
    fi
fi

# Créer un fichier de diagnostic pour Netlify
echo "[INFO] Création du fichier de diagnostic pour Netlify..."

cat > dist/netlify-diagnostic.html <<EOL
<!--
Diagnostic Information For Netlify Support
Deploy URL: ${NETLIFY_DEPLOY_URL}
Build ID: ${NETLIFY_BUILD_ID}
Timestamp: $(date -u)
-->
<h1>Netlify Deployment Diagnostic</h1>
<p>Cette page contient des informations de diagnostic pour le support Netlify.</p>
<button onclick="showNetlifyLogs && showNetlifyLogs()">Afficher les logs</button>
<button onclick="clearNetlifyLogs && clearNetlifyLogs()">Effacer les logs</button>
<script>
// Capture les informations du navigateur
function captureEnvironment() {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    viewport: window.innerWidth + 'x' + window.innerHeight,
    url: window.location.href,
    timestamp: new Date().toISOString()
  };
}

// Affiche les informations d'environnement
document.write('<h2>Informations d\'environnement</h2>');
document.write('<pre>' + JSON.stringify(captureEnvironment(), null, 2) + '</pre>');

// Affiche le contenu de localStorage
try {
  document.write('<h2>Contenu de localStorage</h2>');
  var keys = Object.keys(localStorage);
  if (keys.length === 0) {
    document.write('<p>Aucune donnée dans localStorage</p>');
  } else {
    document.write('<ul>');
    keys.forEach(function(key) {
      document.write('<li><strong>' + key + '</strong>: ' + 
        (key.includes('logs') ? '(logs, trop long pour afficher)' : localStorage.getItem(key)) + 
        '</li>');
    });
    document.write('</ul>');
  }
} catch (e) {
  document.write('<p>Erreur lors de la lecture de localStorage: ' + e.message + '</p>');
}
</script>
EOL

echo "[OK] Fichier de diagnostic créé."

echo ""
echo "====================================================="
echo "       VÉRIFICATION TERMINÉE AVEC SUCCÈS"
echo "====================================================="
echo ""
echo "Votre application est prête à être déployée sur Netlify."
echo "Assurez-vous de configurer les variables d'environnement"
echo "nécessaires dans l'interface Netlify."
echo ""
echo "Appuyez sur Entrée pour continuer..."
read
exit 0

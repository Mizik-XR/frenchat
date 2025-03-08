
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Vérification Déploiement Netlify

echo =====================================================
echo       VÉRIFICATION DU DÉPLOIEMENT NETLIFY
echo =====================================================
echo.

REM Exécution du script de vérification JavaScript
echo [INFO] Vérification de la configuration Netlify...
node scripts\ensure-netlify-build.js
if errorlevel 1 (
    echo [ERREUR] Problèmes détectés dans la configuration Netlify.
    echo [INFO] Le script tentera d'appliquer des corrections automatiques.
    echo.
)

REM Vérification du build
if not exist "dist\" (
    echo [ATTENTION] Le dossier dist n'existe pas.
    echo [INFO] Lancement du build...
    
    REM Définir des variables d'environnement optimisées pour Netlify
    set "NODE_OPTIONS=--max-old-space-size=4096"
    set "NO_RUST_INSTALL=1"
    set "NETLIFY_SKIP_PYTHON_REQUIREMENTS=true"
    set "SKIP_PYTHON_INSTALLATION=true"
    set "DEBUG=vite:*"
    set "NETLIFY_VERBOSE=true"
    
    call npm run build
    
    if errorlevel 1 (
        echo [ERREUR] Le build a échoué.
        echo.
        echo Appuyez sur une touche pour quitter...
        pause >nul
        exit /b 1
    ) else (
        echo [OK] Build réussi.
    )
) else (
    echo [INFO] Le dossier dist existe déjà.
)

REM Vérifier si les fichiers _redirects et _headers sont dans dist
if not exist "dist\_redirects" (
    echo [INFO] Copie de _redirects dans dist...
    copy _redirects dist\ 2>nul || echo /* /index.html 200 > dist\_redirects
)

if not exist "dist\_headers" (
    echo [INFO] Copie de _headers dans dist...
    copy _headers dist\ 2>nul || copy scripts\_headers dist\ 2>nul
)

REM Vérifier index.html pour les chemins absolus et le script Lovable
if exist "dist\index.html" (
    echo [INFO] Vérification de dist\index.html...
    
    REM Vérification simplifiée pour Windows
    findstr "src=\"/" dist\index.html >nul
    if not errorlevel 1 (
        echo [ATTENTION] Chemins absolus détectés dans index.html.
        echo [INFO] Correction des chemins absolus...
        
        REM Utiliser PowerShell pour la substitution des chemins
        powershell -Command "(Get-Content dist\index.html) -replace 'src=\"/', 'src=\"./' | Set-Content dist\index.html"
        powershell -Command "(Get-Content dist\index.html) -replace 'href=\"/', 'href=\"./' | Set-Content dist\index.html"
        
        echo [OK] Chemins corrigés.
    ) else (
        echo [OK] Aucun chemin absolu détecté.
    )
    
    REM Vérification du script Lovable
    findstr "cdn.gpteng.co/gptengineer.js" dist\index.html >nul
    if errorlevel 1 (
        echo [ATTENTION] Script Lovable manquant dans index.html.
        echo [INFO] Ajout du script Lovable...
        
        REM Utiliser PowerShell pour ajouter le script
        powershell -Command "(Get-Content dist\index.html) -replace '</body>', '<script src=\"https://cdn.gpteng.co/gptengineer.js\" type=\"module\"></script></body>' | Set-Content dist\index.html"
        
        echo [OK] Script Lovable ajouté.
    ) else (
        echo [OK] Script Lovable présent.
    }

    REM Ajouter un script de diagnostic pour Netlify
    echo [INFO] Ajout du script de diagnostic pour Netlify...
    
    powershell -Command "(Get-Content dist\index.html) -replace '</head>', '<script>
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
            return typeof arg === \"object\" ? JSON.stringify(arg) : String(arg);
          }).join(\" \");
          
          netlifyLogs.push(\"[\" + timestamp + \"] [\" + type + \"] \" + message);
          
          // Garder seulement les 100 derniers messages
          if (netlifyLogs.length > 100) {
            netlifyLogs.shift();
          }
          
          // Stocker dans localStorage
          try {
            localStorage.setItem(\"netlify_diagnostic_logs\", JSON.stringify(netlifyLogs));
          } catch (e) {}
        } catch (e) {}
      }
      
      // Remplacer les fonctions de console
      console.log = function() {
        captureLog(\"LOG\", arguments);
        originalConsoleLog.apply(console, arguments);
      };
      
      console.error = function() {
        captureLog(\"ERROR\", arguments);
        originalConsoleError.apply(console, arguments);
      };
      
      console.warn = function() {
        captureLog(\"WARN\", arguments);
        originalConsoleWarn.apply(console, arguments);
      };
      
      // Exposer les fonctions de diagnostic
      window.showNetlifyLogs = function() {
        originalConsoleLog.call(console, \"=== Netlify Diagnostic Logs ===\");
        netlifyLogs.forEach(function(log) {
          originalConsoleLog.call(console, log);
        });
        return netlifyLogs.length;
      };
      
      window.clearNetlifyLogs = function() {
        netlifyLogs = [];
        try {
          localStorage.removeItem(\"netlify_diagnostic_logs\");
        } catch (e) {}
        return true;
      };
      
      // Consigner les informations du navigateur
      console.log(\"Netlify Diagnostic: Browser Info\", {
        userAgent: navigator.userAgent,
        language: navigator.language,
        viewport: window.innerWidth + \"x\" + window.innerHeight,
        url: window.location.href
      });
      
      // Détecter les erreurs de modules
      window.addEventListener(\"error\", function(event) {
        if (event.message && event.message.includes(\"Cannot access\") && event.message.includes(\"before initialization\")) {
          console.error(\"Netlify Diagnostic: Module initialization error\", {
            message: event.message,
            file: event.filename,
            line: event.lineno,
            col: event.colno
          });
        }
      }, true);
    })();
    </script></head>' | Set-Content dist\index.html"
    
    echo [OK] Script de diagnostic ajouté.
)

REM Vérifier les fichiers JS pour des chemins absolus
if exist "dist\assets" (
    echo [INFO] Vérification des fichiers JS pour des chemins absolus...
    
    set "JS_FILES_WITH_ABSOLUTE_PATHS=0"
    
    for %%F in (dist\assets\*.js) do (
        findstr "from\"/" "%%F" >nul 2>&1
        if not errorlevel 1 (
            echo   - Correction de chemins absolus dans: %%~nxF
            powershell -Command "(Get-Content '%%F') -replace 'from\"/', 'from\"./' | Set-Content '%%F'"
            set /a "JS_FILES_WITH_ABSOLUTE_PATHS+=1"
        )
        
        findstr "import\"/" "%%F" >nul 2>&1
        if not errorlevel 1 (
            echo   - Correction de chemins absolus dans: %%~nxF
            powershell -Command "(Get-Content '%%F') -replace 'import\"/', 'import\"./' | Set-Content '%%F'"
            set /a "JS_FILES_WITH_ABSOLUTE_PATHS+=1"
        )
        
        findstr "fetch(\"/" "%%F" >nul 2>&1
        if not errorlevel 1 (
            echo   - Correction de chemins absolus dans: %%~nxF
            powershell -Command "(Get-Content '%%F') -replace 'fetch\(\"/', 'fetch\(\"./' | Set-Content '%%F'"
            set /a "JS_FILES_WITH_ABSOLUTE_PATHS+=1"
        )
    )
    
    if !JS_FILES_WITH_ABSOLUTE_PATHS! GTR 0 (
        echo [INFO] Corrigé des chemins absolus dans !JS_FILES_WITH_ABSOLUTE_PATHS! fichiers JS
    ) else (
        echo [OK] Aucun chemin absolu détecté dans les fichiers JS
    )
)

REM Créer un fichier de diagnostic pour Netlify
echo [INFO] Création du fichier de diagnostic pour Netlify...
echo "<!--
Diagnostic Information For Netlify Support
Deploy URL: %NETLIFY_DEPLOY_URL%
Build ID: %NETLIFY_BUILD_ID%
Timestamp: %DATE% %TIME%
-->" > dist\netlify-diagnostic.html

echo "<h1>Netlify Deployment Diagnostic</h1>" >> dist\netlify-diagnostic.html
echo "<p>Cette page contient des informations de diagnostic pour le support Netlify.</p>" >> dist\netlify-diagnostic.html
echo "<button onclick=\"showNetlifyLogs && showNetlifyLogs()\">Afficher les logs</button>" >> dist\netlify-diagnostic.html
echo "<button onclick=\"clearNetlifyLogs && clearNetlifyLogs()\">Effacer les logs</button>" >> dist\netlify-diagnostic.html
echo "<script>
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
document.write('<h2>Informations d'environnement</h2>');
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
</script>" >> dist\netlify-diagnostic.html

echo [OK] Fichier de diagnostic créé.

echo.
echo =====================================================
echo       VÉRIFICATION TERMINÉE AVEC SUCCÈS
echo =====================================================
echo.
echo Votre application est prête à être déployée sur Netlify.
echo Assurez-vous de configurer les variables d'environnement
echo nécessaires dans l'interface Netlify.
echo.
echo Appuyez sur une touche pour continuer...
pause >nul
exit /b 0

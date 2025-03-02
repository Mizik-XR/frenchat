
@echo off
chcp 65001 >nul
title Préparation pour Netlify

echo ===================================================
echo     PRÉPARATION DE FILECHAT POUR NETLIFY
echo ===================================================
echo.
echo Cette opération va préparer l'application pour
echo un déploiement sur Netlify.
echo.
echo [1] Construction de l'application optimisée
echo [2] Vérification des configurations Netlify
echo.
echo ===================================================
echo.
echo Appuyez sur une touche pour démarrer...
pause >nul

REM Construction optimisée pour la production
echo [ÉTAPE 1/2] Construction optimisée pour la production...
set "VITE_ENVIRONMENT=production"
set "VITE_DISABLE_DEV_MODE=1"

REM Nettoyage du dossier dist
if exist "dist\" (
    rmdir /s /q dist
)

REM Construction de l'application
call npm run build
if errorlevel 1 (
    echo [ERREUR] Construction échouée
    pause
    exit /b 1
)
echo [OK] Construction réussie.
echo.

REM Vérification netlify.toml
echo [ÉTAPE 2/2] Vérification des configurations Netlify...
if not exist "netlify.toml" (
    echo [INFO] Création du fichier netlify.toml...
    (
        echo # Configuration de build Netlify pour FileChat
        echo [build]
        echo   publish = "dist"
        echo   command = "npm run build"
        echo.
        echo # Configuration des variables d'environnement par défaut
        echo [build.environment]
        echo   NODE_VERSION = "18"
        echo.
        echo # Configuration des redirections pour le routage SPA
        echo [[redirects]]
        echo   from = "/*"
        echo   to = "/index.html"
        echo   status = 200
        echo.
        echo # Redirection API pour les fonctions Edge
        echo [[redirects]]
        echo   from = "/api/oauth/*"
        echo   to = "https://dbdueopvtlanxgumenpu.supabase.co/functions/v1/unified-oauth"
        echo   status = 200
        echo   force = true
        echo.
        echo [[redirects]]
        echo   from = "/api/drive/*"
        echo   to = "https://dbdueopvtlanxgumenpu.supabase.co/functions/v1/index-google-drive"
        echo   status = 200
        echo   force = true
        echo.
        echo # En-têtes pour améliorer la sécurité
        echo [[headers]]
        echo   for = "/*"
        echo   [headers.values]
        echo     X-Frame-Options = "DENY"
        echo     X-XSS-Protection = "1; mode=block"
        echo     Content-Security-Policy = "default-src 'self'; connect-src 'self' https://*.supabase.co http://localhost:* ws://localhost:* https://* wss://*; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.gpteng.co; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*;"
        echo     Referrer-Policy = "strict-origin-when-cross-origin"
        echo     Permissions-Policy = "camera=(), microphone=(), geolocation=()"
    ) > netlify.toml
    echo [OK] Fichier netlify.toml créé.
) else (
    echo [OK] Fichier netlify.toml déjà présent.
)

REM Création d'un _redirects au cas où
if not exist "dist\_redirects" (
    echo [INFO] Création du fichier _redirects...
    (
        echo /* /index.html 200
    ) > dist\_redirects
    echo [OK] Fichier _redirects créé.
)

echo.
echo ===================================================
echo     PRÉPARATION POUR NETLIFY TERMINÉE
echo ===================================================
echo.
echo Votre application est prête à être déployée sur Netlify.
echo.
echo Options de déploiement:
echo 1. Utiliser "deploy-to-netlify.bat" (si présent)
echo 2. Créer un repository GitHub et le connecter à Netlify
echo 3. Déployer manuellement le dossier "dist" sur Netlify
echo.
echo ===================================================
echo.
pause
exit /b 0

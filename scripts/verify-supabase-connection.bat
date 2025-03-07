
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
    echo [INFO] Fichier netlify.toml non trouvé. Vérifiez _redirects.
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
    echo [INFO] Fichier _redirects non trouvé.
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

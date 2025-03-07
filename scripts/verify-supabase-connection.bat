
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
    
    findstr /C:"to = \"/index.html\"" "netlify.toml" >nul
    if !ERRORLEVEL! EQU 0 (
        echo [OK] Règle de redirection SPA trouvée dans netlify.toml
    ) else (
        echo [ATTENTION] Règle de redirection SPA non trouvée dans netlify.toml
    )
) else (
    echo [ATTENTION] Fichier netlify.toml non trouvé. Vérifiez _redirects.
)

REM Vérification de _redirects
if exist "_redirects" (
    echo [INFO] Vérification du fichier _redirects...
    
    findstr /C:"/* /index.html 200" "_redirects" >nul
    if !ERRORLEVEL! EQU 0 (
        echo [OK] Règle de redirection SPA trouvée dans _redirects
    ) else (
        echo [ATTENTION] Règle de redirection SPA non trouvée dans _redirects
    )
) else (
    echo [ATTENTION] Fichier _redirects non trouvé. Créez-le ou utilisez netlify.toml.
)

REM Vérification du client Supabase
echo [INFO] Vérification du code client Supabase...
set "FOUND_CLIENT=0"

REM Recherche dans les fichiers .ts et .tsx
for /r "src" %%f in (*.ts *.tsx) do (
    findstr /C:"createClient" /C:"supabase" "%%f" >nul
    if !ERRORLEVEL! EQU 0 (
        set "FOUND_CLIENT=1"
    )
)

if !FOUND_CLIENT! EQU 1 (
    echo [OK] Client Supabase trouvé dans le code source
) else (
    echo [ATTENTION] Client Supabase non trouvé dans le code. Vérifiez l'intégration.
)

REM Teste la connexion à Supabase en essayant de créer un script temporaire
echo [INFO] Test de connexion à Supabase...
echo const testConn = async () => { > temp_test.js
echo   try { >> temp_test.js
echo     const { createClient } = require('@supabase/supabase-js'); >> temp_test.js
echo     const supabase = createClient( >> temp_test.js
echo       process.env.VITE_SUPABASE_URL || 'https://dbdueopvtlanxgumenpu.supabase.co', >> temp_test.js
echo       process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiZHVlb3B2dGxhbnhndW1lbnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NzQ0NTIsImV4cCI6MjA1NTU1MDQ1Mn0.lPPbNJANU8Zc7i5OB9_atgDZ84Yp5SBjXCiIqjA79Tk' >> temp_test.js
echo     ); >> temp_test.js
echo     const { data, error } = await supabase.from('').select('*').limit(1); >> temp_test.js
echo     if (error) { >> temp_test.js
echo       console.log('[ATTENTION] Erreur lors de la connexion à Supabase:', error.message); >> temp_test.js
echo     } else { >> temp_test.js
echo       console.log('[OK] Connexion à Supabase réussie!'); >> temp_test.js
echo     } >> temp_test.js
echo   } catch (err) { >> temp_test.js
echo     console.log('[ERREUR] Exception:', err.message); >> temp_test.js
echo   } >> temp_test.js
echo }; >> temp_test.js
echo testConn(); >> temp_test.js

echo [INFO] Ce script ne peut pas tester la connexion directement, mais a généré un fichier 'temp_test.js'
echo        que vous pouvez exécuter manuellement avec Node.js pour tester la connexion.

echo.
echo ===================================================
echo     INSTRUCTIONS POUR VÉRIFIER LA CONNEXION
echo ===================================================
echo.
echo 1. Ouvrez votre application déployée sur Netlify
echo 2. Ouvrez la console du navigateur (F12)
echo 3. Exécutez le code suivant pour tester la connexion:
echo.
echo    const checkConnection = async () => {
echo      try {
echo        const { data, error } = await window.supabase.from('profiles').select('*').limit(1);
echo        if (error) console.error('Erreur Supabase:', error);
echo        else console.log('Connexion OK:', data);
echo      } catch (e) {
echo        console.error('Exception:', e);
echo      }
echo    };
echo    checkConnection();
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

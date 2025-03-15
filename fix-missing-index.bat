
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Filechat - Restauration fichier index.html

echo ===================================================
echo     RESTAURATION DU FICHIER INDEX.HTML
echo ===================================================
echo.
echo Ce script va restaurer le fichier index.html manquant.
echo.

if exist "index.html.backup" (
    echo [INFO] Sauvegarde index.html.backup trouvée, restauration...
    copy /y index.html.backup index.html >nul
    echo [OK] Fichier index.html restauré avec succès.
) else (
    echo [ATTENTION] Aucune sauvegarde index.html.backup trouvée.
    echo [INFO] Création d'un fichier index.html à partir du modèle par défaut...
    
    (
        echo ^<!DOCTYPE html^>
        echo ^<html lang="en"^>
        echo   ^<head^>
        echo     ^<script src="https://cdn.gpteng.co/gptengineer.js"^>^</script^>
        echo     ^<meta charset="UTF-8" /^>
        echo     ^<link rel="icon" type="image/svg+xml" href="/favicon.ico" /^>
        echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0" /^>
        echo     ^<meta http-equiv="X-Content-Type-Options" content="nosniff" /^>
        echo     ^<meta http-equiv="Content-Type" content="text/html; charset=utf-8" /^>
        echo     ^<title^>FileChat - Your Document Intelligence Assistant^</title^>
        echo     ^<meta name="description" content="FileChat automatically indexes all your documents from Google Drive and Microsoft Teams, allowing you to interact with your entire document knowledge base." /^>
        echo     ^<!-- Base style for initial loading screen --^>
        echo     ^<style^>
        echo       #loading-screen {
        echo         display: flex;
        echo         flex-direction: column;
        echo         align-items: center;
        echo         justify-content: center;
        echo         height: 100vh;
        echo         background: linear-gradient(to bottom right, #f0f9ff, #e1e7ff^);
        echo         font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        echo       }
        echo       .loading-container {
        echo         background: white;
        echo         padding: 2rem;
        echo         border-radius: 1rem;
        echo         box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1^);
        echo         max-width: 500px;
        echo         width: 100%%;
        echo         text-align: center;
        echo       }
        echo       .loading-title {
        echo         color: #4f46e5;
        echo         font-size: 1.5rem;
        echo         margin-bottom: 1rem;
        echo       }
        echo       .loading-bar {
        echo         width: 100%%;
        echo         height: 6px;
        echo         background-color: #e5e7eb;
        echo         border-radius: 3px;
        echo         overflow: hidden;
        echo         margin: 1.5rem 0;
        echo       }
        echo       .loading-bar-progress {
        echo         width: 30%%;
        echo         height: 100%%;
        echo         background-color: #4f46e5;
        echo         border-radius: 3px;
        echo         animation: progressAnimation 2s infinite ease-in-out;
        echo       }
        echo       @keyframes progressAnimation {
        echo         0%% { width: 10%%; }
        echo         50%% { width: 70%%; }
        echo         100%% { width: 10%%; }
        echo       }
        echo       .retry-btn {
        echo         display: none;
        echo         margin-top: 1rem;
        echo         background-color: #4f46e5;
        echo         color: white;
        echo         border: none;
        echo         padding: 0.5rem 1rem;
        echo         border-radius: 0.25rem;
        echo         cursor: pointer;
        echo         font-weight: 500;
        echo       }
        echo       .error-message {
        echo         display: none;
        echo         color: #dc2626;
        echo         margin-top: 1rem;
        echo       }
        echo     ^</style^>
        echo     ^<!-- Error handling and recovery script --^>
        echo     ^<script^>
        echo       // Function to redirect to homepage with forced cloud mode parameters
        echo       function forceHomepageInCloudMode^(^) {
        echo         window.location.href = '/?forceCloud=true^&mode=cloud^&client=true';
        echo       }
        echo       
        echo       // Error detection and recovery
        echo       window.addEventListener^('error', function^(event^) {
        echo         if ^(event.message ^&^& ^(event.message.includes^('useLayoutEffect'^) ^|^| event.message.includes^('MIME type'^)^)^) {
        echo           console.warn^('Error detected, attempting recovery...'^);
        echo           
        echo           // Show recovery button after 5 seconds if loading fails
        echo           setTimeout^(function^(^) {
        echo             var loadingEl = document.getElementById^('loading-screen'^);
        echo             var retryBtn = document.querySelector^('.retry-btn'^);
        echo             var errorMsg = document.querySelector^('.error-message'^);
        echo             
        echo             if ^(loadingEl ^&^& errorMsg ^&^& retryBtn^) {
        echo               errorMsg.style.display = 'block';
        echo               retryBtn.style.display = 'inline-block';
        echo             }
        echo           }, 5000^);
        echo         }
        echo       }, true^);
        echo     ^</script^>
        echo   ^</head^>
        echo   ^<body^>
        echo     ^<!-- Fallback message if JavaScript is disabled --^>
        echo     ^<noscript^>
        echo       ^<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; text-align: center;"^>
        echo         ^<h1 style="color: #4f46e5; margin-bottom: 20px;"^>JavaScript is required^</h1^>
        echo         ^<p^>This application requires JavaScript to be enabled.^</p^>
        echo         ^<p^>Please enable it in your browser settings.^</p^>
        echo       ^</div^>
        echo     ^</noscript^>
        echo     
        echo     ^<!-- Loading screen visible immediately --^>
        echo     ^<div id="root"^>
        echo       ^<div id="loading-screen"^>
        echo         ^<div class="loading-container"^>
        echo           ^<h1 class="loading-title"^>FileChat^</h1^>
        echo           ^<p^>Loading your document intelligence assistant...^</p^>
        echo           ^<div class="loading-bar"^>^<div class="loading-bar-progress"^>^</div^>^</div^>
        echo           ^<p style="font-size: 0.8rem; color: #6b7280;"^>If loading fails, try refreshing the page.^</p^>
        echo           ^<div class="error-message"^>Loading is taking longer than expected.^</div^>
        echo           ^<button class="retry-btn" onclick="window.location.reload^(^)"^>Refresh page^</button^>
        echo           ^<button class="retry-btn" onclick="forceHomepageInCloudMode^(^)" style="margin-left: 8px; background-color: #6366f1;"^>Cloud mode^</button^>
        echo         ^</div^>
        echo       ^</div^>
        echo     ^</div^>
        echo     ^<script type="module" src="/src/main.tsx"^>^</script^>
        echo   ^</body^>
        echo ^</html^>
    ) > index.html
    
    echo [OK] Fichier index.html créé avec succès.
)
echo.

echo [INFO] Vérification du script gptengineer.js dans index.html...
findstr "gptengineer.js" "index.html" >nul
if errorlevel 1 (
    echo [ATTENTION] Script Lovable manquant dans index.html, ajout...
    
    powershell -Command "(Get-Content index.html) -replace '<head>', '<head>`n    <script src=\"https://cdn.gpteng.co/gptengineer.js\"></script>' | Set-Content index.html"
    
    echo [OK] Script Lovable ajouté dans index.html.
) else (
    echo [OK] Script Lovable présent dans index.html.
)
echo.

echo ===================================================
echo     RESTAURATION TERMINÉE
echo ===================================================
echo.
echo Prochaines étapes:
echo 1. Exécutez maintenant 'fix-lovable.bat' à nouveau
echo 2. Redémarrez l'application
echo 3. Videz le cache de votre navigateur
echo.
echo Appuyez sur une touche pour quitter...
pause >nul
exit /b 0


@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Mode Cloud

echo ===================================================
echo     FILECHAT - MODE CLOUD
echo ===================================================
echo.
echo Cette version démarre FileChat en mode cloud uniquement,
echo sans nécessiter de serveur IA local.
echo.

REM Vérification de http-server
where http-server >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Installation de http-server...
    call npm install -g http-server
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] Échec de l'installation de http-server.
        pause
        exit /b 1
    )
    echo [OK] http-server installé.
) else (
    echo [OK] http-server est déjà installé.
)

REM Démarrage du serveur HTTP
echo [INFO] Démarrage du serveur HTTP...
start "Serveur HTTP FileChat" /min cmd /c "http-server dist -p 8080 --cors -c-1"
echo [OK] Serveur HTTP démarré.
echo.

REM Ouverture du navigateur avec paramètres cloud
timeout /t 1 /nobreak > nul
start "" "http://localhost:8080/?client=true&hideDebug=true&forceCloud=true&mode=cloud"

echo.
echo ===================================================
echo         FILECHAT DÉMARRÉ EN MODE CLOUD
echo ===================================================
echo.
echo Application Web: http://localhost:8080/?client=true^&hideDebug=true^&forceCloud=true^&mode=cloud
echo.
echo Pour arrêter le service, fermez cette fenêtre et la fenêtre du serveur HTTP.
echo.
echo Appuyez sur une touche pour fermer cette fenêtre...
pause >nul

REM Fermeture du processus
taskkill /F /FI "WINDOWTITLE eq Serveur HTTP FileChat" >nul 2>nul

exit /b 0


@echo off
echo ================================
echo     DÉMARRAGE DE FILECHAT
echo     MODE CLOUD UNIQUEMENT
echo ================================
echo.

REM Vérification et nettoyage des processus existants
echo [INFO] Préparation de l'environnement...

REM Configuration en mode cloud uniquement
echo [INFO] Configuration du mode cloud...
set "MODE_CLOUD=1"

REM Vérification des dépendances NPM
echo [INFO] Vérification des dépendances NPM...
if not exist "node_modules\" (
    echo [INFO] Installation des dépendances NPM...
    call scripts\install-npm-deps.bat
    if errorlevel 1 (
        echo [ERREUR] Installation des dépendances NPM échouée
        echo.
        echo Appuyez sur une touche pour quitter...
        pause >nul
        exit /b 1
    )
    echo [OK] Dépendances NPM installées avec succès
    echo.
)

REM Vérifier si http-server est installé
where http-server >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Installation de http-server...
    call npm install -g http-server
    if errorlevel 1 (
        echo [ERREUR] Installation de http-server échouée
        echo.
        echo Appuyez sur une touche pour quitter...
        pause >nul
        exit /b 1
    )
)

REM Démarrage de l'application web
echo [INFO] Démarrage de l'application web...
start "Application Web FileChat" cmd /c "http-server dist -p 8080"
timeout /t 2 /nobreak > nul

REM Ouvrir le navigateur
echo [INFO] Ouverture du navigateur...
start http://localhost:8080

echo.
echo ================================
echo    FILECHAT DÉMARRÉ AVEC SUCCÈS
echo       MODE CLOUD UNIQUEMENT
echo ================================
echo.
echo Services disponibles:
echo [1] Application Web: http://localhost:8080
echo.
echo [INFO] Pour arrêter les services, fermez cette fenêtre et les fenêtres associées
echo.
echo Appuyez sur une touche pour fermer cette fenêtre...
pause >nul
exit /b 0

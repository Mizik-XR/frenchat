
@echo off
echo =====================================================
echo RÉSOLUTION DES PROBLÈMES D'ÉCRAN BLANC DANS FILECHAT
echo =====================================================
echo.

echo Vérification de l'environnement...
if not exist "node_modules" (
    echo [ERREUR] Les dépendances ne sont pas installées.
    echo Exécution du script d'installation des dépendances...
    call scripts\install-npm-deps.bat
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] L'installation des dépendances a échoué.
        echo.
        pause
        exit /b 1
    )
)

echo Nettoyage du cache...
call npm cache clean --force
call npx rimraf dist
call npx rimraf node_modules\.vite
call npx rimraf node_modules\.cache
echo.

echo Vérification des dépendances Babel...
call npm install --legacy-peer-deps @babel/core@latest @babel/preset-env@latest @babel/preset-react@latest @babel/plugin-transform-react-jsx@latest
echo.

echo Vérification du GIF d'animation...
if not exist "public\filechat-animation.gif" (
    echo [ATTENTION] Le fichier public\filechat-animation.gif est manquant.
    echo Création d'un placeholder...
    copy public\favicon.ico public\filechat-animation.gif
    echo Une image de remplacement a été créée.
    echo Veuillez y placer votre animation GIF originale.
)
echo.

echo Reconstruction de l'application...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] La reconstruction de l'application a échoué.
    echo.
    pause
    exit /b 1
)
echo.

echo Démarrage de l'application...
call npx http-server dist -p 8080 -c-1
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Impossible de démarrer le serveur HTTP.
    echo.
    pause
    exit /b 1
)
echo.

echo =====================================================
echo Application démarrée avec succès!
echo Vous pouvez maintenant accéder à: http://localhost:8080
echo =====================================================

exit /b 0

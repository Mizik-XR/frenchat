
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ===================================================
echo     CORRECTION DE LA COMMANDE VITE
echo ===================================================
echo.
echo Ce script va corriger les problèmes de commande Vite non reconnue.
echo.

echo [ÉTAPE 1/3] Vérification des dépendances...
if not exist "node_modules" (
    echo [INFO] Installation des dépendances manquantes...
    call npm install --no-fund
    if !errorlevel! NEQ 0 (
        echo [ERREUR] Échec de l'installation des dépendances.
        pause
        exit /b 1
    )
    echo [OK] Dépendances installées avec succès.
) else (
    echo [OK] Le dossier node_modules existe.
)
echo.

echo [ÉTAPE 2/3] Vérification de l'installation de Vite...
if exist "node_modules\.bin\vite.cmd" (
    echo [OK] Vite est correctement installé localement.
) else (
    echo [INFO] Installation de Vite localement...
    call npm install --save-dev vite
    if !errorlevel! NEQ 0 (
        echo [ERREUR] Échec de l'installation de Vite.
        pause
        exit /b 1
    )
    echo [OK] Vite installé avec succès.
)
echo.

echo [ÉTAPE 3/3] Test de la commande build...
call npm run build
if !errorlevel! NEQ 0 (
    echo [ERREUR] La commande build a échoué.
    echo [INFO] Vérifiez que le script "build" existe dans package.json
    pause
    exit /b 1
) else (
    echo [OK] La commande build fonctionne correctement.
)
echo.

echo ===================================================
echo     CORRECTION TERMINÉE
echo ===================================================
echo.
echo La commande Vite devrait maintenant fonctionner correctement.
echo Pour construire le projet, utilisez : npm run build
echo.
pause
exit /b 0


@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ===================================================
echo    INSTALLATION DES DÉPENDANCES DE DÉVELOPPEMENT
echo ===================================================
echo.
echo Ce script va installer les dépendances nécessaires pour
echo les outils de développement et les scripts de diagnostic.
echo.
echo ===================================================
echo.
pause

REM Vérification de Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas installé. Installation impossible.
    exit /b 1
)

REM Installation d'axios pour les scripts de diagnostic
echo [INFO] Installation d'axios pour les outils de diagnostic...
call npm install axios --save-dev

if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Échec de l'installation d'axios.
    exit /b 1
)
echo [OK] axios installé avec succès.

echo.
echo ===================================================
echo    INSTALLATION TERMINÉE
echo ===================================================
echo.
echo Toutes les dépendances de développement ont été installées.
echo Vous pouvez maintenant utiliser les scripts de diagnostic et de déploiement.
echo.
pause
exit /b 0

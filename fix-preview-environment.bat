
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Correctif pour environnement de prévisualisation

echo ===================================================
echo     CORRECTIF POUR ENVIRONNEMENT DE PRÉVISUALISATION
echo ===================================================
echo.
echo Cet outil va corriger les problèmes de chemin de fichier
echo dans les environnements de prévisualisation comme Lovable
echo.
echo ===================================================
echo.

REM Vérifier et corriger index.html
echo [ÉTAPE 1/2] Vérification du fichier index.html...
if exist "index.html" (
    echo [INFO] Modification des chemins de fichiers pour mode prévisualisation...
    
    REM Sauvegarde du fichier original
    copy index.html index.html.backup >nul
    
    REM Modifier le fichier index.html pour utiliser des chemins relatifs
    powershell -Command "(Get-Content index.html) -replace '/favicon.ico', './favicon.ico' | Set-Content index.html"
    powershell -Command "(Get-Content index.html) -replace '/src/main.tsx', './src/main.tsx' | Set-Content index.html"
    
    echo [OK] Chemins de fichiers corrigés dans index.html.
) else (
    echo [ERREUR] Le fichier index.html est manquant dans le répertoire racine.
    pause
    exit /b 1
)
echo.

REM Vérifier et ajouter _redirects
echo [ÉTAPE 2/2] Création du fichier de redirection pour SPA...
if not exist "public\_redirects" (
    echo [INFO] Création du fichier _redirects...
    
    REM Créer le dossier public s'il n'existe pas
    if not exist "public" mkdir public
    
    REM Créer le fichier _redirects
    echo /* /index.html 200 > "public\_redirects"
    
    echo [OK] Fichier _redirects créé.
) else (
    echo [INFO] Le fichier _redirects existe déjà.
)
echo.

echo ===================================================
echo     CORRECTIF TERMINÉ AVEC SUCCÈS
echo ===================================================
echo.
echo Vous pouvez maintenant déployer votre application dans
echo un environnement de prévisualisation.
echo.
pause
exit /b 0

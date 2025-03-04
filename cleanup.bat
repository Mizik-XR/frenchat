
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Frenchat - Nettoyage Complet

echo ===================================================
echo     NETTOYAGE COMPLET DE L'ENVIRONNEMENT FRENCHAT
echo ===================================================
echo.
echo Ce script va nettoyer votre environnement de développement
echo en supprimant les fichiers temporaires et inutiles.
echo.
echo Actions qui seront effectuées:
echo 1. Suppression des fichiers .exe, .tmp et autres fichiers temporaires
echo 2. Nettoyage des dossiers de cache
echo 3. Optimisation du dossier node_modules (option)
echo 4. Vérification et nettoyage du dossier dist
echo.
echo ===================================================
echo.
echo Appuyez sur une touche pour continuer...
pause >nul

REM Suppression des fichiers temporaires
echo [ÉTAPE 1/4] Suppression des fichiers temporaires...

echo [INFO] Recherche et suppression des fichiers .exe non essentiels...
for /r %%i in (*.exe) do (
    REM Vérifier si ce n'est pas un exe du système Windows ou nécessaire
    echo %%i | findstr /i "\\Windows\\ \\System32\\ rustup-init.exe" >nul
    if !errorlevel! NEQ 0 (
        echo    Suppression: %%i
        del "%%i" 2>nul
    )
)

echo [INFO] Recherche des fichiers .log...
for /r %%i in (*.log) do (
    echo    Suppression: %%i
    del "%%i" 2>nul
)

echo [INFO] Recherche des fichiers temporaires...
for /r %%i in (*.tmp) do (
    echo    Suppression: %%i
    del "%%i" 2>nul
)

echo [INFO] Suppression des caches npm...
if exist ".npm\" (
    echo    Suppression du dossier .npm
    rmdir /s /q .npm 2>nul
)

echo [INFO] Suppression du cache de build...
if exist ".cache\" (
    echo    Suppression du dossier .cache
    rmdir /s /q .cache 2>nul
)

if exist "node_modules\.cache\" (
    echo    Suppression du cache dans node_modules
    rmdir /s /q node_modules\.cache 2>nul
)

REM Nettoyage des anciens fichiers de rustup si présents
if exist "%USERPROFILE%\.rustup\tmp" (
    echo    Suppression du cache rustup
    rmdir /s /q "%USERPROFILE%\.rustup\tmp" 2>nul
)

echo [OK] Fichiers temporaires supprimés.
echo.

REM Nettoyage des backups
echo [ÉTAPE 2/4] Nettoyage des backups...

echo [INFO] Recherche des fichiers .bak...
for /r %%i in (*.bak) do (
    echo    Suppression: %%i
    del "%%i" 2>nul
)

echo [INFO] Vérification des dossiers *_backup...
if exist "dist_backup\" (
    echo    Trouvé dist_backup
    
    choice /c YN /n /m "Souhaitez-vous conserver le backup du dist? (Y=Oui, N=Non) "
    if !errorlevel! EQU 2 (
        echo    Suppression du dossier dist_backup
        rmdir /s /q dist_backup 2>nul
    ) else (
        echo    Conservation du backup dist_backup
    )
)

echo [OK] Backups nettoyés.
echo.

REM Optimisation node_modules
echo [ÉTAPE 3/4] Optimisation de node_modules...

echo [INFO] Vérification de la taille de node_modules...
if exist "node_modules\" (
    echo    Trouvé dossier node_modules
    
    choice /c YN /n /m "Souhaitez-vous nettoyer les dépendances et réinstaller? (Y=Oui, N=Non) "
    if !errorlevel! EQU 1 (
        echo    Nettoyage du dossier node_modules en cours...
        rmdir /s /q node_modules 2>nul
        
        echo    Nettoyage du cache npm...
        call npm cache clean --force
        
        echo    Réinstallation des dépendances...
        call npm ci
        if !errorlevel! NEQ 0 (
            echo    Échec de npm ci, essai avec npm install...
            call npm install
        )
        echo    [OK] Dépendances réinstallées avec succès.
    ) else (
        echo    Conservation du dossier node_modules
    )
) else (
    echo    node_modules non trouvé, aucune action nécessaire.
)

echo [OK] Optimisation node_modules terminée.
echo.

REM Vérification du dossier dist
echo [ÉTAPE 4/4] Vérification du dossier dist...

if exist "dist\" (
    echo    Trouvé dossier dist
    
    echo    Vérification de la structure du dossier dist...
    if not exist "dist\index.html" (
        echo    [ATTENTION] Le fichier dist\index.html est manquant.
        echo    Il semble que le build soit incomplet ou corrompu.
        
        choice /c YN /n /m "Souhaitez-vous supprimer et reconstruire le dossier dist? (Y=Oui, N=Non) "
        if !errorlevel! EQU 1 (
            echo    Suppression du dossier dist...
            rmdir /s /q dist 2>nul
            
            echo    Reconstruction du projet...
            set NODE_OPTIONS=--max-old-space-size=4096
            call npm run build
            
            if exist "dist\index.html" (
                echo    [OK] Dossier dist reconstruit avec succès.
            ) else (
                echo    [ERREUR] Échec de la reconstruction du dist.
                echo    Veuillez exécuter fix-blank-page.bat pour résoudre ce problème.
            )
        )
    ) else (
        echo    Vérification de la présence du script Lovable...
        findstr /c:"gptengineer.js" "dist\index.html" >nul
        if !errorlevel! NEQ 0 (
            echo    [ATTENTION] Le script Lovable manque dans index.html
            echo    Correction en cours...
            call fix-edit-issues.bat >nul 2>nul
            echo    [OK] Correction appliquée.
        ) else (
            echo    [OK] Le script Lovable est correctement intégré.
        )
        
        echo    [OK] Structure du dossier dist correcte.
    )
) else (
    echo    Le dossier dist n'existe pas encore. Aucune action nécessaire.
    echo    Vous pouvez créer le dossier dist en exécutant "npm run build".
)

echo [OK] Vérification du dossier dist terminée.
echo.

echo ===================================================
echo     NETTOYAGE TERMINÉ AVEC SUCCÈS
echo ===================================================
echo.
echo Votre environnement est maintenant propre et optimisé!
echo.
echo Recommandations:
echo 1. Lancez "npm run dev" pour développer localement
echo 2. Utilisez "deploy-to-netlify.bat" pour déployer sur Netlify
echo.
echo Appuyez sur une touche pour quitter...
pause >nul
exit /b 0

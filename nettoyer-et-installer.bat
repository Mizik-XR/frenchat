
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title FileChat - Nettoyage et Installation Cloud

echo ===================================================
echo     NETTOYAGE ET INSTALLATION FILECHAT
echo     (MODE CLOUD UNIQUEMENT)
echo ===================================================
echo.
echo Cette opération va nettoyer l'installation actuelle 
echo et configurer FileChat en mode cloud uniquement.
echo.
echo [1] Suppression des fichiers temporaires et builds
echo [2] Installation des dépendances NPM essentielles
echo [3] Construction de l'application
echo [4] Configuration pour Netlify
echo.
echo ===================================================
echo.
echo Appuyez sur une touche pour démarrer...
pause >nul

echo.
echo [ÉTAPE 1/4] Nettoyage de l'installation actuelle...
echo.

REM Suppression des dossiers générés
if exist "dist\" (
    echo Suppression du dossier dist...
    rmdir /s /q dist
)
if exist "node_modules\" (
    echo Suppression du dossier node_modules...
    rmdir /s /q node_modules
)
if exist "venv\" (
    echo Suppression de l'environnement Python...
    rmdir /s /q venv
)
echo [OK] Nettoyage terminé.
echo.

echo [ÉTAPE 2/4] Installation des dépendances NPM...
echo.

REM Installation des dépendances minimales pour le mode cloud
echo Installation des dépendances React...
call npm install --no-save react@18.2.0 react-dom@18.2.0 --legacy-peer-deps
if errorlevel 1 (
    echo [ERREUR] Installation des dépendances React échouée
    goto :error
)

echo Installation des dépendances principales...
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo [ERREUR] Installation des dépendances principales échouée
    goto :error
)

echo [OK] Installation des dépendances terminée.
echo.

echo [ÉTAPE 3/4] Construction de l'application...
echo.

REM Construction de l'application
call npm run build
if errorlevel 1 (
    echo [ERREUR] Construction de l'application échouée
    echo.
    echo Tentative de correction du fichier index.html...
    if exist "index.html" (
        findstr "gptengineer.js" "index.html" >nul
        if !errorlevel! NEQ 0 (
            echo [ATTENTION] Le script gptengineer.js manque dans index.html.
            
            REM Sauvegarde du fichier original
            copy index.html index.html.backup >nul
            
            REM Modifier le fichier index.html pour ajouter le script manquant
            (for /f "delims=" %%i in (index.html) do (
                echo %%i
                echo %%i | findstr "<script type=\"module\" src=\"/src/main.tsx\"></script>" >nul
                if !errorlevel! EQU 0 (
                    echo     ^<!-- Script requis pour Lovable fonctionnant comme "Pick and Edit" --^>
                    echo     ^<script src="https://cdn.gpteng.co/gptengineer.js" type="module"^>^</script^>
                )
            )) > index.html.temp
            
            move /y index.html.temp index.html >nul
            echo [OK] Script gptengineer.js ajouté dans index.html.
            
            REM Nouvelle tentative de construction
            call npm run build
            if errorlevel 1 goto :error
        )
    )
)

echo [OK] Application construite avec succès.
echo.

echo [ÉTAPE 4/4] Configuration pour Netlify...
echo.

REM Vérification de netlify.toml
if not exist "netlify.toml" (
    echo Création du fichier netlify.toml...
    (
        echo # Configuration de build Netlify pour FileChat
        echo [build]
        echo   publish = "dist"
        echo   command = "npm run build"
        echo.
        echo # Configuration des redirections pour le routage SPA
        echo [[redirects]]
        echo   from = "/*"
        echo   to = "/index.html"
        echo   status = 200
    ) > netlify.toml
)

echo [OK] Configuration pour Netlify terminée.
echo.

echo ===================================================
echo     INSTALLATION TERMINÉE AVEC SUCCÈS
echo ===================================================
echo.
echo FileChat a été installé en mode cloud uniquement.
echo.
echo Pour démarrer l'application:
echo - Double-cliquez sur "demarrer-filechat.bat"
echo.
echo Pour déployer sur Netlify:
echo - Utilisez la commande "deploy-to-netlify.bat"
echo   (ou commitez ce dossier à un repo GitHub et
echo    connectez-le sur Netlify)
echo.
echo ===================================================
echo.
pause
exit /b 0

:error
echo.
echo ===================================================
echo     ERREUR D'INSTALLATION
echo ===================================================
echo.
echo L'installation a échoué. 
echo.
echo Si vous rencontrez toujours des problèmes,
echo essayez de lancer l'application en mode développement:
echo npm run dev
echo.
pause
exit /b 1

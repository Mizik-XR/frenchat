
@echo off
chcp 65001
setlocal enabledelayedexpansion

echo ===================================================
echo      INSTALLATION AUTOMATIQUE DE FRENCHAT
echo ===================================================
echo.
echo Ce script va installer et configurer tous les éléments
echo nécessaires pour exécuter Frenchat sur votre machine.
echo.
echo [1] Installation de Python (si nécessaire)
echo [2] Configuration de l'environnement Python
echo [3] Installation des dépendances
echo [4] Construction de l'application
echo [5] Création des raccourcis
echo.
echo ===================================================
echo.
echo Appuyez sur une touche pour démarrer l'installation...
pause >nul

REM Vérification et installation de Python
echo [ÉTAPE 1/5] Vérification de Python...
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Python n'est pas installé, installation en cours...
    call scripts\install-python-env.bat
    if errorlevel 1 (
        echo [ERREUR] Installation de Python échouée.
        echo Veuillez installer Python manuellement depuis https://www.python.org/downloads/
        echo.
        echo Installation interrompue.
        echo.
        pause
        exit /b 1
    )
)
echo [OK] Python est installé.
echo.

REM Configuration de l'environnement Python
echo [ÉTAPE 2/5] Configuration de l'environnement Python...
call scripts\setup-venv.bat
if errorlevel 1 (
    echo [ERREUR] Configuration de l'environnement Python échouée.
    echo.
    echo Installation interrompue.
    echo.
    pause
    exit /b 1
)
echo [OK] Environnement Python configuré avec succès.
echo.

REM Installation des dépendances
echo [ÉTAPE 3/5] Installation des dépendances NPM...
call scripts\install-npm-deps.bat
if errorlevel 1 (
    echo [ERREUR] Installation des dépendances NPM échouée.
    echo.
    echo Installation interrompue.
    echo.
    pause
    exit /b 1
)
echo [OK] Dépendances installées avec succès.
echo.

REM Construction de l'application
echo [ÉTAPE 4/5] Construction de l'application...
call npm run build
if errorlevel 1 (
    echo [ERREUR] Construction de l'application échouée.
    echo.
    echo Installation interrompue.
    echo.
    pause
    exit /b 1
)
echo [OK] Application construite avec succès.
echo.

REM Création d'un raccourci sur le bureau
echo [ÉTAPE 5/5] Création des raccourcis...
powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut([System.Environment]::GetFolderPath('Desktop') + '\Frenchat.lnk'); $Shortcut.TargetPath = '%~dp0start-app.bat'; $Shortcut.WorkingDirectory = '%~dp0'; $Shortcut.IconLocation = '%~dp0public\favicon.ico,0'; $Shortcut.Save()"
echo [OK] Raccourci créé sur le bureau.
echo.

echo ===================================================
echo         INSTALLATION TERMINÉE AVEC SUCCÈS
echo ===================================================
echo.
echo Frenchat a été installé et configuré avec succès !
echo.
echo Pour démarrer Frenchat :
echo - Double-cliquez sur le raccourci "Frenchat" sur votre bureau
echo - OU exécutez le fichier "start-app.bat" dans ce dossier
echo.
echo Appuyez sur une touche pour lancer Frenchat maintenant...
pause >nul

REM Lancement de Frenchat
start "" "%~dp0start-app.bat"
exit /b 0


@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Installation Universelle Frenchat

echo ===================================================
echo           INSTALLATION UNIVERSELLE DE FRENCHAT
echo ===================================================
echo.

REM Détection du système d'exploitation
echo [INFO] Détection du système d'exploitation...
IF EXIST "%WINDIR%\System32\WindowsPowerShell\v1.0\powershell.exe" (
    echo [OK] Système Windows détecté
    call setup.bat
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] L'installation a échoué avec le code %ERRORLEVEL%.
        echo Veuillez vérifier les messages d'erreur ci-dessus.
        pause
        exit /b %ERRORLEVEL%
    )
) ELSE (
    echo [INFO] Système non-Windows détecté, tentative d'exécution du script shell...
    
    REM Vérifier si bash est disponible
    where bash >nul 2>nul
    if !ERRORLEVEL! NEQ 0 (
        echo [ERREUR] Bash n'est pas disponible sur ce système.
        echo Veuillez utiliser directement le script install.sh sur les systèmes Unix.
        pause
        exit /b 1
    )
    
    REM Rendre le script exécutable et le lancer
    bash -c "chmod +x install.sh && ./install.sh"
    if !ERRORLEVEL! NEQ 0 (
        echo [ERREUR] L'installation a échoué avec le code !ERRORLEVEL!.
        echo Veuillez vérifier les messages d'erreur ci-dessus.
        pause
        exit /b !ERRORLEVEL!
    )
)

echo [INFO] Installation terminée avec succès.
echo [INFO] Vous pouvez maintenant démarrer l'application avec start-universal.bat
pause
exit /b 0

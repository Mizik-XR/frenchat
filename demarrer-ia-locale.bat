
@echo off
chcp 65001 >nul
title Lancement FileChat - Mode IA Locale

echo ===================================================
echo     DÉMARRAGE FILECHAT AVEC IA LOCALE
echo ===================================================
echo.
echo Vérification d'Ollama en cours...
echo.

REM Vérification d'Ollama
netstat -ano | findstr ":11434" >nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Ollama n'est pas démarré.
    echo.
    echo 1. Téléchargez Ollama depuis: https://ollama.ai/download
    echo 2. Installez-le sur votre ordinateur
    echo 3. Relancez ce script
    echo.
    echo Voulez-vous ouvrir la page de téléchargement d'Ollama?
    choice /C ON /M "O=Oui, N=Non"
    if %ERRORLEVEL% EQU 1 (
        start https://ollama.ai/download
    )
    pause
    exit /b 1
)

echo [OK] Ollama est actif et fonctionne sur votre système.
echo.

REM Lancement de FileChat
echo [INFO] Démarrage de FileChat...
call demarrer-filechat.bat

echo.
echo ===================================================
echo    CONFIGURATION DE L'IA LOCALE
echo ===================================================
echo.
echo Pour utiliser l'IA locale:
echo 1. Accédez aux paramètres IA dans FileChat
echo 2. Sélectionnez "IA Locale" comme source
echo 3. Dans l'URL, entrez: http://localhost:11434
echo 4. Sauvegardez les paramètres
echo.
echo L'IA locale est maintenant configurée!
echo.
pause

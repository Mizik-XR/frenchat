
@echo off
echo ================================
echo Installation Python et environnement IA
echo ================================

REM Vérification de Python
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Python n'est pas installé. 
    echo Téléchargement de Python...
    curl -o python-installer.exe https://www.python.org/ftp/python/3.9.7/python-3.9.7-amd64.exe
    echo Installation de Python...
    python-installer.exe /quiet InstallAllUsers=1 PrependPath=1
    del python-installer.exe
)

echo [INFO] Vérification de Python terminée avec succès.
python --version

REM Proposer le mode léger sans Rust
echo.
echo ================================
echo Mode d'installation
echo ================================
echo 1. Mode léger (recommandé) - sans compilation de dépendances
echo 2. Mode complet - avec compilation (nécessite Rust)
echo.
set /p INSTALL_MODE="Choisissez le mode d'installation [1/2] (1 par défaut): "

if "%INSTALL_MODE%"=="2" (
    echo.
    echo [INFO] Mode complet sélectionné, vérification de Rust...
    where rustc >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo Installation de Rust...
        curl -O https://static.rust-lang.org/rustup/dist/x86_64-pc-windows-msvc/rustup-init.exe
        rustup-init.exe -y
        echo Ajout de Rust au PATH...
        set PATH=%PATH%;%USERPROFILE%\.cargo\bin
        echo Rust installé avec succès
        echo Redémarrage du shell pour mettre à jour PATH...
        call refreshenv 2>nul || echo Commande refreshenv non disponible, redémarrez votre terminal après l'installation.
    ) else (
        echo [INFO] Rust est déjà installé: 
        rustc --version
    )
    
    REM Vérifier l'installation de cargo
    where cargo >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo [ATTENTION] Cargo n'est pas disponible malgré l'installation de Rust
        echo              Passage en mode léger...
        set NO_RUST_INSTALL=1
    )
) else (
    echo.
    echo [INFO] Mode léger sélectionné, configuration sans Rust...
    set NO_RUST_INSTALL=1
)

exit /b 0

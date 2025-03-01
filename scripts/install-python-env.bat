
@echo off
echo ================================
echo Installation Python et Rust
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

REM Vérification de Rust
where rustc >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installation de Rust...
    powershell -Command "iwr -useb https://sh.rustup.rs | iex" -ArgumentList "-y"
    echo Ajout de Rust au PATH...
    set PATH=%PATH%;%USERPROFILE%\.cargo\bin
    echo Rust installé avec succès
    echo Redémarrage du shell pour mettre à jour PATH...
    call refreshenv
)

exit /b 0


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
    curl -o rustup-init.exe https://win.rustup.rs/x86_64
    rustup-init.exe -y --default-toolchain stable
    del rustup-init.exe
    set PATH=%PATH%;%USERPROFILE%\.cargo\bin
    echo Rust installé avec succès
)

exit /b 0

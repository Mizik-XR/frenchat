
@echo off
echo ================================
echo Configuration environnement virtuel
echo ================================

REM Création de l'environnement virtuel
if not exist "venv\" (
    echo Création de l'environnement virtuel...
    python -m venv venv
    timeout /t 2 /nobreak >nul
)

REM Activation de l'environnement
call venv\Scripts\activate.bat

REM Mise à jour de pip
python -m pip install --upgrade pip
pip cache purge

REM Installation des dépendances Python - Version améliorée
echo Installation des dépendances de base...
pip install --no-cache-dir setuptools wheel

REM Installation de PyTorch avec l'URL correcte
echo Installation de PyTorch...
pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

REM Déterminer si on installe avec Rust ou mode léger
if "%NO_RUST_INSTALL%"=="1" (
    echo Mode d'installation léger, sans dépendances nécessitant Rust...
    pip install --no-cache-dir fastapi uvicorn pydantic
    
    REM Installation spéciale de tokenizers pré-compilé
    pip install --no-cache-dir --only-binary=:all: tokenizers
    
    REM Installation de transformers sans compilation
    pip install --no-cache-dir transformers
    echo Utilisation de modèles inférences via API - pas besoin de bitsandbytes
) else (
    REM Vérifier si Rust/Cargo est installé
    where rustc >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo Rust n'est pas installé. Tentative d'installation automatique...
        curl -O https://static.rust-lang.org/rustup/dist/x86_64-pc-windows-msvc/rustup-init.exe
        rustup-init.exe -y
        
        REM Ajouter Rust au PATH pour cette session
        set PATH=%PATH%;%USERPROFILE%\.cargo\bin
        
        REM Vérifier si l'installation a réussi
        where rustc >nul 2>nul
        if %ERRORLEVEL% NEQ 0 (
            echo Installation de Rust échouée. Passage en mode léger...
            set NO_RUST_INSTALL=1
            pip install --no-cache-dir fastapi uvicorn pydantic
            pip install --no-cache-dir --only-binary=:all: tokenizers
            pip install --no-cache-dir transformers
            echo Utilisation de modèles inférences via API - pas besoin de bitsandbytes
            goto installcomplete
        )
    )
    
    REM Cargo est maintenant disponible, vérifier
    where cargo >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo Cargo introuvable malgré l'installation de Rust. Passage en mode léger...
        set NO_RUST_INSTALL=1
        pip install --no-cache-dir fastapi uvicorn pydantic
        pip install --no-cache-dir --only-binary=:all: tokenizers
        pip install --no-cache-dir transformers
        echo Utilisation de modèles inférences via API - pas besoin de bitsandbytes
    ) else (
        echo Installation complète des dépendances avec Rust...
        pip install --no-cache-dir -r requirements.txt
    )
)

:installcomplete
echo ================================
echo Installation terminée !
echo ================================
echo Pour démarrer le serveur: python serve_model.py
echo ================================

exit /b 0

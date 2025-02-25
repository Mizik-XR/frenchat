
@echo off
chcp 65001
setlocal enabledelayedexpansion

echo ================================
echo Vérification des mises à jour...
echo ================================

REM Vérification des mises à jour NPM (optionnel)
set /p UPDATE_CHOICE=Voulez-vous vérifier et mettre à jour les dépendances NPM ? (O/N) 
if /i "%UPDATE_CHOICE%"=="O" (
    echo.
    echo Cette opération peut prendre quelques minutes...
    echo.

    REM Nettoyage des dépendances problématiques
    echo Nettoyage des dépendances conflictuelles...
    call npm uninstall date-fns react-day-picker
    call npm cache clean --force

    REM Installation des dépendances dans un ordre spécifique avec --legacy-peer-deps
    echo Installation des utilitaires de date...
    call npm install --legacy-peer-deps date-fns@2.28.0 || (
        echo Erreur lors de l'installation de date-fns
        pause
    )

    echo Installation de react-day-picker...
    call npm install --legacy-peer-deps react-day-picker@8.10.1 || (
        echo Erreur lors de l'installation de react-day-picker
        pause
    )

    echo Installation de @radix-ui/react-tooltip...
    call npm install --legacy-peer-deps @radix-ui/react-tooltip@latest || (
        echo Erreur lors de l'installation de @radix-ui/react-tooltip
        pause
    )

    echo Installation de @supabase/supabase-js...
    call npm install @supabase/supabase-js@latest || (
        echo Erreur lors de l'installation de @supabase/supabase-js
        pause
    )

    echo Installation de @tanstack/react-query...
    call npm install @tanstack/react-query@latest || (
        echo Erreur lors de l'installation de @tanstack/react-query
        pause
    )

    echo Installation des bibliothèques UI...
    call npm install class-variance-authority@latest clsx@latest cmdk@latest || (
        echo Erreur lors de l'installation des bibliothèques UI
        pause
    )

    echo Installation des outils de test...
    call npm install cypress@latest || (
        echo Erreur lors de l'installation de cypress
        pause
    )

    echo Installation des composants UI...
    call npm install embla-carousel-react@latest input-otp@latest lucide-react@latest || (
        echo Erreur lors de l'installation des composants UI
        pause
    )

    echo Installation des thèmes...
    call npm install next-themes@latest || (
        echo Erreur lors de l'installation de next-themes
        pause
    )

    echo Installation des outils de présentation...
    call npm install pptxgenjs@latest || (
        echo Erreur lors de l'installation de pptxgenjs
        pause
    )

    echo Installation de React et ses dépendances principales...
    call npm install react@latest react-dom@latest || (
        echo Erreur lors de l'installation de React
        pause
    )

    echo Installation des dépendances React additionnelles...
    call npm install react-dropzone@latest react-hook-form@latest react-resizable-panels@latest react-router-dom@latest || (
        echo Erreur lors de l'installation des dépendances React additionnelles
        pause
    )

    echo Installation des bibliothèques de graphiques...
    call npm install recharts@latest || (
        echo Erreur lors de l'installation de recharts
        pause
    )

    echo Installation des utilitaires UI...
    call npm install sonner@latest tailwind-merge@latest tailwindcss-animate@latest vaul@latest || (
        echo Erreur lors de l'installation des utilitaires UI
        pause
    )

    echo Installation des outils de test et validation...
    call npm install vitest@latest zod@latest || (
        echo Erreur lors de l'installation des outils de test
        pause
    )

    echo.
    echo Mise à jour des dépendances terminée.
    echo.
    pause

    REM Exécuter l'audit de sécurité et correction forcée
    echo.
    echo Correction des vulnérabilités...
    call npm audit fix --force || (
        echo Des vulnérabilités peuvent subsister. Vérifiez avec 'npm audit' pour plus de détails.
        pause
    )
)

echo ================================
echo Installation de l'environnement IA
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

REM Vérification de Rust avec rustup-init.exe
where rustc >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installation de Rust...
    curl -o rustup-init.exe https://win.rustup.rs/x86_64
    rustup-init.exe -y --default-toolchain stable
    del rustup-init.exe
    set PATH=%PATH%;%USERPROFILE%\.cargo\bin
    echo Rust installé avec succès
)

REM Création d'un environnement virtuel s'il n'existe pas
if not exist "venv\" (
    echo Création de l'environnement virtuel...
    python -m venv venv
    timeout /t 2 /nobreak >nul
)

REM Activation de l'environnement virtuel
call venv\Scripts\activate.bat

REM Mise à jour de pip
python -m pip install --upgrade pip

REM Suppression du cache pip pour éviter les conflits
echo Nettoyage du cache pip...
pip cache purge

REM Installation des dépendances Python dans un ordre spécifique
echo Installation des dépendances Python...
pip install --no-cache-dir setuptools wheel
pip install --no-cache-dir torch==2.0.1+cpu --index-url https://download.pytorch.org/whl/cpu
pip install --no-cache-dir tokenizers --no-build-isolation
pip install --no-cache-dir transformers==4.36.2
pip install --no-cache-dir ^
    accelerate==0.26.1 ^
    datasets==2.16.1 ^
    fastapi==0.109.0 ^
    uvicorn==0.27.0 ^
    pydantic==2.6.1

REM Création du script Python avec un modèle plus léger
echo Création du script du serveur...
(
echo from fastapi import FastAPI, HTTPException
echo from pydantic import BaseModel
echo import uvicorn
echo import torch
echo from transformers import AutoTokenizer, AutoModelForCausalLM
echo import logging
echo from typing import Optional
echo.
echo logging.basicConfig^(level=logging.INFO^)
echo logger = logging.getLogger^("serve_model"^)
echo.
echo app = FastAPI^(^)
echo.
echo try:
echo     logger.info^("Chargement du modèle..."^)
echo     tokenizer = AutoTokenizer.from_pretrained^("distilgpt2"^)
echo     model = AutoModelForCausalLM.from_pretrained^("distilgpt2"^)
echo     logger.info^("Modèle chargé avec succès"^)
echo except Exception as e:
echo     logger.error^(f"Erreur lors du chargement du modèle: {e}"^)
echo     raise
echo.
echo class GenerationInput^(BaseModel^):
echo     prompt: str
echo     max_length: Optional[int] = 100
echo.
echo @app.post^("/generate"^)
echo async def generate_text^(input_data: GenerationInput^):
echo     try:
echo         inputs = tokenizer^(input_data.prompt, return_tensors="pt"^)
echo         outputs = model.generate^(**inputs, max_length=input_data.max_length^)
echo         result = tokenizer.decode^(outputs[0], skip_special_tokens=True^)
echo         return {"generated_text": result}
echo     except Exception as e:
echo         logger.error^(f"Erreur lors de la génération: {e}"^)
echo         raise HTTPException^(status_code=500, detail=str^(e^)^)
echo.
echo if __name__ == "__main__":
echo     uvicorn.run^(app, host="0.0.0.0", port=8000, log_level="info"^)
) > serve_model.py

echo.
echo ================================
echo Démarrage du serveur IA local...
echo ================================

REM Démarrage du serveur dans une nouvelle fenêtre
start "Serveur IA Local" cmd /c "venv\Scripts\python.exe serve_model.py"

echo.
echo Le serveur démarre... 
echo L'API sera disponible sur http://localhost:8000
echo Pour arrêter le serveur, fermez cette fenêtre ou la fenêtre du serveur.
echo.
echo Appuyez sur une touche pour quitter...
pause

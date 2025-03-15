
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ===================================================
echo     RÉPARATION PAGE BLANCHE POUR VERCEL
echo ===================================================
echo.

REM Détection de l'erreur de routeur React
echo [ÉTAPE 1/2] Vérification de la configuration du routeur React...

REM Vérifier main.tsx
if exist "src\main.tsx" (
  findstr "BrowserRouter" "src\main.tsx" >nul
  if !errorlevel! NEQ 0 (
    echo [CORRECTION] Ajout de BrowserRouter dans main.tsx...
    
    echo import React from 'react' > src\main.tsx.new
    echo import ReactDOM from 'react-dom/client' >> src\main.tsx.new
    echo import { BrowserRouter } from 'react-router-dom' >> src\main.tsx.new
    echo import App from './App.tsx' >> src\main.tsx.new
    echo import './index.css' >> src\main.tsx.new
    echo import './styles/message-styles.css' >> src\main.tsx.new
    echo. >> src\main.tsx.new
    echo // Configuration améliorée pour le déploiement >> src\main.tsx.new
    echo const renderApp = ^(^) ^=^> ^{ >> src\main.tsx.new
    echo   const rootElement = document.getElementById^('root'^); >> src\main.tsx.new
    echo   if ^(!rootElement^) ^{ >> src\main.tsx.new
    echo     console.error^('Élément racine introuvable'^); >> src\main.tsx.new
    echo     return; >> src\main.tsx.new
    echo   ^} >> src\main.tsx.new
    echo. >> src\main.tsx.new
    echo   try ^{ >> src\main.tsx.new
    echo     ReactDOM.createRoot^(rootElement^).render^( >> src\main.tsx.new
    echo       ^<React.StrictMode^> >> src\main.tsx.new
    echo         ^<BrowserRouter^> >> src\main.tsx.new
    echo           ^<App /^> >> src\main.tsx.new
    echo         ^</BrowserRouter^> >> src\main.tsx.new
    echo       ^</React.StrictMode^>, >> src\main.tsx.new
    echo     ^); >> src\main.tsx.new
    echo     console.log^('Application rendue avec succès'^); >> src\main.tsx.new
    echo   ^} catch ^(error^) ^{ >> src\main.tsx.new
    echo     console.error^('Erreur lors du rendu de l\\\'application:'^, error^); >> src\main.tsx.new
    echo     // Fallback pour l'affichage d'une erreur à l'utilisateur >> src\main.tsx.new
    echo     rootElement.innerHTML = ` >> src\main.tsx.new
    echo       ^<div style="text-align: center; padding: 2rem;"^> >> src\main.tsx.new
    echo         ^<h1^>Erreur de chargement^</h1^> >> src\main.tsx.new
    echo         ^<p^>L'application n'a pas pu démarrer correctement. Veuillez rafraîchir la page.^</p^> >> src\main.tsx.new
    echo       ^</div^> >> src\main.tsx.new
    echo     `; >> src\main.tsx.new
    echo   ^} >> src\main.tsx.new
    echo ^}; >> src\main.tsx.new
    echo. >> src\main.tsx.new
    echo // Initialisation de l'application >> src\main.tsx.new
    echo renderApp^(^); >> src\main.tsx.new
    
    move /y src\main.tsx.new src\main.tsx >nul
    echo [OK] main.tsx corrigé.
  ) else (
    echo [OK] BrowserRouter déjà configuré dans main.tsx.
  )
) else (
  echo [ERREUR] src\main.tsx introuvable.
)

REM Reconstruction
echo [ÉTAPE 2/2] Reconstruction de l'application...
call npm run build

echo ===================================================
echo           CORRECTION TERMINÉE
echo ===================================================
echo Vous pouvez maintenant déployer sur Vercel avec:
echo vercel --prod
echo ===================================================

pause

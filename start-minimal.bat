
@echo off
echo Démarrage en mode minimal...
echo.
echo Cette configuration utilise:
echo - Une résolution d'alias optimisée
echo - Une instance React unique et sécurisée
echo - Le mode de récupération pour éviter les conflits
echo - Une détection des dépendances circulaires
echo.
echo Pour un diagnostic approfondi, exécutez:
echo   node src/scripts/dependency-analyzer.js
echo.

rem Configurer l'environnement pour le mode minimal
set RECOVERY_MODE=true
set VITE_CLOUD_MODE=true
set VITE_DEBUG_MODE=true
set VITE_DISABLE_ADVANCED_FEATURES=true
set NODE_OPTIONS=--max-old-space-size=4096

npm run dev


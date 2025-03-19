
@echo off
chcp 65001 >nul
setlocal

echo ==============================================
echo   CORRECTION AUTOMATIQUE DES IMPORTS REACT
echo ==============================================
echo.

:: Exécuter le script Node.js
node scripts/fix-react-imports.js

echo.
echo Si le script a réussi, vous pouvez maintenant exécuter:
echo npm run build -- --mode development
echo pour vérifier que les corrections fonctionnent correctement.

pause

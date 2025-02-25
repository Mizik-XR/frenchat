
@echo off
echo ================================
echo Installation des dépendances NPM
echo ================================

REM Nettoyage des dépendances problématiques
echo Nettoyage des dépendances conflictuelles...
call npm uninstall date-fns react-day-picker
call npm cache clean --force

REM Installation des dépendances dans un ordre spécifique
echo Installation des utilitaires de date...
call npm install --legacy-peer-deps date-fns@2.28.0 || exit /b
call npm install --legacy-peer-deps react-day-picker@8.10.1 || exit /b

echo Installation des composants UI...
call npm install --legacy-peer-deps @radix-ui/react-tooltip@latest || exit /b
call npm install @supabase/supabase-js@latest || exit /b
call npm install @tanstack/react-query@latest || exit /b
call npm install class-variance-authority@latest clsx@latest cmdk@latest || exit /b
call npm install cypress@latest || exit /b
call npm install embla-carousel-react@latest input-otp@latest lucide-react@latest || exit /b
call npm install next-themes@latest || exit /b
call npm install pptxgenjs@latest || exit /b
call npm install react@latest react-dom@latest || exit /b
call npm install react-dropzone@latest react-hook-form@latest react-resizable-panels@latest react-router-dom@latest || exit /b
call npm install recharts@latest || exit /b
call npm install sonner@latest tailwind-merge@latest tailwindcss-animate@latest vaul@latest || exit /b
call npm install vitest@latest zod@latest || exit /b

echo.
echo Installation des dépendances NPM terminée.
echo.

REM Audit de sécurité
call npm audit fix --force
exit /b 0

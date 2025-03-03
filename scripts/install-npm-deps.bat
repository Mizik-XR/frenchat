
@echo off
echo ================================
echo Installation des dépendances NPM
echo ================================

REM Nettoyage des dépendances problématiques
echo Nettoyage des dépendances conflictuelles...
call npm uninstall date-fns react-day-picker
call npm cache clean --force

REM Nettoyage du cache npm
echo Nettoyage du cache npm...
call npm cache verify

REM Installation des dépendances React dans un ordre spécifique avec --legacy-peer-deps
echo Installation des composants principaux...
call npm install --legacy-peer-deps react@18.2.0 react-dom@18.2.0 || (
    echo Erreur lors de l'installation de React
    exit /b 1
)

REM Installation des dates et composants avec --legacy-peer-deps
echo Installation des utilitaires de date...
call npm install --legacy-peer-deps date-fns@2.28.0 react-day-picker@8.10.1 || (
    echo Erreur lors de l'installation des utilitaires de date
    exit /b 1
)

REM Installation des React Router explicitement pour éviter les conflits
echo Installation de React Router...
call npm install --legacy-peer-deps react-router-dom@6.26.2 || (
    echo Erreur lors de l'installation de React Router
    exit /b 1
)

REM Installation groupée des composants UI avec --legacy-peer-deps
echo Installation des composants UI...
call npm install --legacy-peer-deps ^
    @radix-ui/react-tooltip@latest ^
    @supabase/supabase-js@latest ^
    @tanstack/react-query@latest ^
    class-variance-authority@latest ^
    clsx@latest ^
    cmdk@latest ^
    cypress@latest ^
    embla-carousel-react@latest ^
    input-otp@latest ^
    lucide-react@latest ^
    next-themes@latest ^
    pptxgenjs@latest ^
    react-dropzone@latest ^
    react-hook-form@latest ^
    react-resizable-panels@latest ^
    recharts@latest ^
    sonner@latest ^
    tailwind-merge@latest ^
    tailwindcss-animate@latest ^
    vaul@latest ^
    vitest@latest ^
    zod@latest || (
    echo Erreur lors de l'installation des composants UI
    exit /b 1
)

echo.
echo Installation des dépendances NPM terminée.
echo.

REM Mettre à jour node_modules pour s'assurer que tout est propre
call npm rebuild

REM Audit de sécurité
call npm audit fix --force
exit /b 0

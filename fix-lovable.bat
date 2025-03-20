
@echo off
echo ===================================================
echo     SCRIPT DE RÉPARATION DE L'INTÉGRATION LOVABLE
echo ===================================================
echo.
echo Ce script va tenter de résoudre les problèmes d'intégration de Lovable.
echo Assurez-vous que l'application est en cours d'exécution.
echo.
echo ===================================================
echo.

REM Vérifier si le fichier index.html existe
if not exist "index.html" (
    echo [ERREUR] Le fichier index.html n'a pas été trouvé dans le répertoire courant.
    echo Veuillez exécuter ce script depuis le répertoire racine du projet.
    goto :end
)

REM Vérifier si le script Lovable est présent dans index.html
echo [ÉTAPE 1/3] Vérification de la présence du script Lovable dans index.html...
findstr /C:"gptengineer.js" index.html >nul
if %errorlevel% == 0 (
    echo ✅ Le script Lovable est bien présent dans index.html.
) else (
    echo ❌ Le script Lovable n'est pas présent dans index.html.
    echo Veuillez ajouter le script suivant dans la section head de index.html:
    echo ^<script src="https://cdn.gpteng.co/gptengineer.js" type="module"^>^</script^>
)

REM Vérifier l'initialisation de Lovable dans main.tsx
echo.
echo [ÉTAPE 2/3] Vérification de l'initialisation de Lovable dans main.tsx...
if exist "src\main.tsx" (
    findstr /C:"initLovableIntegration" src\main.tsx >nul
    if %errorlevel% == 0 (
        echo ✅ L'initialisation de Lovable est bien présente dans main.tsx.
    ) else (
        echo ⚠️ L'initialisation de Lovable n'a pas été trouvée dans main.tsx.
        echo Veuillez vous assurer que 'initLovableIntegration()' est appelé au début de main.tsx.
    )
) else (
    echo ❌ Le fichier src\main.tsx n'a pas été trouvé.
)

REM Vérifier les utilitaires Lovable
echo.
echo [ÉTAPE 3/3] Vérification des utilitaires Lovable...
if exist "src\utils\lovable" (
    echo ✅ Le répertoire des utilitaires Lovable existe.
    
    REM Vérifier la présence des fichiers essentiels
    if exist "src\utils\lovable\lovableIntegration.ts" (
        echo ✅ Le fichier lovableIntegration.ts est présent.
    ) else (
        echo ❌ Le fichier lovableIntegration.ts est manquant.
    )
    
    if exist "src\utils\lovable\editingUtils.ts" (
        echo ✅ Le fichier editingUtils.ts est présent.
    ) else (
        echo ❌ Le fichier editingUtils.ts est manquant.
    )
) else (
    echo ❌ Le répertoire des utilitaires Lovable est manquant.
)

REM Conclusion
echo.
echo ===================================================
echo               VÉRIFICATION TERMINÉE
echo ===================================================
echo.
echo Si des problèmes ont été identifiés, veuillez les corriger.
echo Puis redémarrez l'application avec 'npm run dev' ou 'yarn dev'.
echo.
echo Pour forcer la réinjection du script Lovable dans le navigateur:
echo 1. Ouvrez la console développeur (F12)
echo 2. Exécutez: window.forceLovableReload()
echo 3. Rafraîchissez la page
echo.
echo ===================================================

:end
pause

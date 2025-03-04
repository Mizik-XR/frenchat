
#!/bin/bash

echo "==================================================="
echo "     DIAGNOSTIC D'INTÉGRATION LOVABLE"
echo "==================================================="
echo
echo "Cet outil va analyser l'intégration de Lovable dans"
echo "votre application et proposer des solutions."
echo
echo "==================================================="
echo
read -p "Appuyez sur Entrée pour démarrer l'analyse..." -n1 -s
echo

# Initialiser les variables pour le suivi des problèmes
LOVABLE_SCRIPT_ISSUE=0
LOVABLE_BUILD_ISSUE=0
ENV_ISSUE=0
BUILD_ISSUE=0
BROWSER_ISSUE=0

# Vérification du script Lovable
echo "[TEST 1/5] Vérification du script Lovable dans index.html..."
if [ -f "index.html" ]; then
    if ! grep -q "gptengineer.js" "index.html"; then
        echo "[ÉCHEC] Le script Lovable n'est pas présent dans index.html."
        LOVABLE_SCRIPT_ISSUE=1
    else
        echo "[OK] Le script Lovable est présent dans index.html."
    fi
else
    echo "[ÉCHEC] Le fichier index.html est manquant."
    LOVABLE_SCRIPT_ISSUE=1
fi
echo

# Vérification du script dans le build
echo "[TEST 2/5] Vérification du script Lovable dans le build (dist)..."
if [ -f "dist/index.html" ]; then
    if ! grep -q "gptengineer.js" "dist/index.html"; then
        echo "[ÉCHEC] Le script Lovable n'est pas présent dans le build."
        LOVABLE_BUILD_ISSUE=1
    else
        echo "[OK] Le script Lovable est présent dans le build."
    fi
else
    echo "[INFO] Le dossier dist n'existe pas encore. Un build est nécessaire."
    LOVABLE_BUILD_ISSUE=1
fi
echo

# Vérification des variables d'environnement
echo "[TEST 3/5] Vérification de la configuration du projet..."
if [ -f ".env.local" ]; then
    if ! grep -q "VITE_DISABLE_DEV_MODE=1" ".env.local"; then
        echo "[INFO] Mode développement activé, cela peut interférer avec Lovable."
        ENV_ISSUE=1
    else
        echo "[OK] Configuration correcte."
    fi
else
    echo "[INFO] Fichier .env.local manquant, configuration par défaut utilisée."
fi
echo

# Test de construction
echo "[TEST 4/5] Test de construction rapide..."
npm run build --silent
if [ $? -ne 0 ]; then
    echo "[ÉCHEC] La construction du projet a échoué."
    BUILD_ISSUE=1
else
    echo "[OK] Construction réussie."
fi
echo

# Vérification du navigateur (détection basique sous Linux/Mac)
echo "[TEST 5/5] Vérification du navigateur par défaut..."
if command -v xdg-settings &> /dev/null; then
    # Linux
    DEFAULT_BROWSER=$(xdg-settings get default-web-browser 2>/dev/null)
    if [[ "$DEFAULT_BROWSER" == *"chrome"* ]] || [[ "$DEFAULT_BROWSER" == *"chromium"* ]]; then
        echo "[OK] Chrome/Chromium est votre navigateur par défaut."
    else
        echo "[INFO] Chrome n'est pas votre navigateur par défaut."
        echo "       Chrome ou Edge sont recommandés pour l'édition avec Lovable."
        BROWSER_ISSUE=1
    fi
elif [ -f "/Applications/Google Chrome.app/Contents/Info.plist" ]; then
    # Mac (vérification simple de la présence de Chrome)
    echo "[INFO] Chrome est installé, mais nous ne pouvons pas confirmer s'il est le navigateur par défaut."
else
    echo "[INFO] Impossible de détecter votre navigateur par défaut."
    echo "       Chrome ou Edge sont recommandés pour l'édition avec Lovable."
    BROWSER_ISSUE=1
fi
echo

echo "==================================================="
echo "     RÉSULTATS DU DIAGNOSTIC"
echo "==================================================="
echo

# Afficher le résumé et les recommandations
ISSUES_FOUND=0
if [ $LOVABLE_SCRIPT_ISSUE -eq 1 ]; then
    ISSUES_FOUND=$((ISSUES_FOUND+1))
    echo "[PROBLÈME] Le script Lovable n'est pas correctement intégré."
    echo "           Exécutez scripts/unix/fix-edit-issues.sh pour corriger."
fi
if [ $LOVABLE_BUILD_ISSUE -eq 1 ]; then
    ISSUES_FOUND=$((ISSUES_FOUND+1))
    echo "[PROBLÈME] Le build ne contient pas le script Lovable."
    echo "           Exécutez scripts/unix/fix-edit-issues.sh puis reconstruisez."
fi
if [ $ENV_ISSUE -eq 1 ]; then
    ISSUES_FOUND=$((ISSUES_FOUND+1))
    echo "[PROBLÈME] Configuration environnement non optimale pour Lovable."
    echo "           Ajoutez VITE_DISABLE_DEV_MODE=1 au fichier .env.local."
fi
if [ $BUILD_ISSUE -eq 1 ]; then
    ISSUES_FOUND=$((ISSUES_FOUND+1))
    echo "[PROBLÈME] Échec de la construction."
    echo "           Vérifiez les messages d'erreur et corrigez les problèmes."
fi
if [ $BROWSER_ISSUE -eq 1 ]; then
    ISSUES_FOUND=$((ISSUES_FOUND+1))
    echo "[PROBLÈME] Navigateur non optimal pour l'édition avec Lovable."
    echo "           Utilisez Google Chrome ou Microsoft Edge."
fi

if [ $ISSUES_FOUND -eq 0 ]; then
    echo "[RÉSULTAT] Aucun problème détecté avec l'intégration Lovable."
    echo "           Si les problèmes persistent:"
    echo "           1. Videz le cache de votre navigateur"
    echo "           2. Désactivez les extensions qui pourraient interférer"
    echo "           3. Essayez un autre navigateur (Chrome ou Edge)"
else
    echo "[RÉSULTAT] $ISSUES_FOUND problème(s) détecté(s)."
    echo "           Suivez les recommandations ci-dessus."
fi
echo

echo "==================================================="
echo "Pour corriger automatiquement les problèmes détectés,"
echo "exécutez: scripts/unix/fix-edit-issues.sh"
echo "==================================================="
echo
read -p "Appuyez sur Entrée pour quitter..." -n1 -s
exit 0

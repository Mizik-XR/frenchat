
#!/bin/bash

echo "==================================================="
echo "     DIAGNOSTIC ET RÉPARATION LOVABLE"
echo "==================================================="
echo
echo "Cet outil va diagnostiquer et résoudre automatiquement"
echo "les problèmes d'intégration Lovable dans l'application."
echo

# Créer un fichier de log
LOG_FILE="lovable-fix.log"
echo "$(date): Démarrage diagnostic Lovable" > $LOG_FILE

# Vérification de l'intégration dans index.html
echo "[ÉTAPE 1/5] Vérification de l'intégration Lovable dans index.html..."
if [ -f "index.html" ]; then
    echo "- Fichier index.html trouvé" >> $LOG_FILE
    if grep -q "gptengineer.js" "index.html"; then
        echo "- Script Lovable présent dans index.html" >> $LOG_FILE
        echo "[✓] Le script Lovable est présent dans index.html"
    else
        echo "[!] Script Lovable manquant dans index.html, correction..."
        echo "- Ajout du script Lovable à index.html" >> $LOG_FILE
        
        # Sauvegarde de l'original
        cp index.html index.html.backup
        
        # Modification pour garantir que le script est ajouté AVANT le script main.tsx
        sed -i '/<script type="module" src="\/src\/main.tsx">/i \    <!-- Script requis pour Lovable (Pick and Edit) -->\n    <script src="https://cdn.gpteng.co/gptengineer.js" type="module"></script>' index.html
        
        echo "[✓] Script Lovable ajouté à index.html"
    fi
else
    echo "[✗] ERREUR: index.html introuvable. Avez-vous lancé ce script depuis le répertoire racine?"
    echo "- index.html non trouvé" >> $LOG_FILE
    exit 1
fi
echo

# Vérification du build
echo "[ÉTAPE 2/5] Vérification du build..."
if [ -d "dist" ]; then
    echo "- Dossier dist trouvé" >> $LOG_FILE
    if [ -f "dist/index.html" ]; then
        echo "- dist/index.html trouvé" >> $LOG_FILE
        if grep -q "gptengineer.js" "dist/index.html"; then
            echo "[✓] Le script Lovable est présent dans le build"
        else
            echo "[!] Script manquant dans le build, correction..."
            echo "- Ajout du script Lovable à dist/index.html" >> $LOG_FILE
            cp -f index.html dist/index.html
            echo "[✓] Script Lovable ajouté au build"
        fi
    else
        echo "[!] Le fichier dist/index.html n'existe pas, un nouveau build est nécessaire"
        echo "- dist/index.html non trouvé" >> $LOG_FILE
    fi
else
    echo "[!] Le dossier dist n'existe pas, un build est nécessaire"
    echo "- Dossier dist non trouvé" >> $LOG_FILE
fi
echo

# Configuration pour le build
echo "[ÉTAPE 3/5] Configuration de l'environnement..."
echo "- Configuration des variables d'environnement" >> $LOG_FILE

# Vérifier si .env.local existe
if [ -f ".env.local" ]; then
    # Vérifier si VITE_DISABLE_DEV_MODE est déjà configuré
    if ! grep -q "VITE_DISABLE_DEV_MODE=1" ".env.local"; then
        echo "VITE_DISABLE_DEV_MODE=1" >> .env.local
        echo "[✓] VITE_DISABLE_DEV_MODE=1 ajouté à .env.local"
    else
        echo "[✓] VITE_DISABLE_DEV_MODE est déjà configuré"
    fi
else
    # Créer .env.local avec la configuration minimale requise
    cat > .env.local << EOF
VITE_DISABLE_DEV_MODE=1
VITE_SUPABASE_URL=https://dbdueopvtlanxgumenpu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiZHVlb3B2dGxhbnhndW1lbnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NzQ0NTIsImV4cCI6MjA1NTU1MDQ1Mn0.lPPbNJANU8Zc7i5OB9_atgDZ84Yp5SBjXCiIqjA79Tk
EOF
    echo "[✓] Fichier .env.local créé avec la configuration nécessaire"
    echo "- .env.local créé avec configuration Lovable" >> $LOG_FILE
fi
echo

# Reconstruction de l'application
echo "[ÉTAPE 4/5] Reconstruction de l'application..."
echo "- Démarrage du build" >> $LOG_FILE

# Augmenter la mémoire disponible pour Node
export NODE_OPTIONS="--max-old-space-size=4096"
echo "- NODE_OPTIONS configuré pour 4GB" >> $LOG_FILE

# Exécuter le build
npm run build
if [ $? -eq 0 ]; then
    echo "[✓] Application reconstruite avec succès"
    echo "- Build réussi" >> $LOG_FILE
    
    # Vérifier encore une fois le build pour s'assurer que le script Lovable est présent
    if [ -f "dist/index.html" ]; then
        if ! grep -q "gptengineer.js" "dist/index.html"; then
            echo "[!] Correction finale du build..."
            cp -f index.html dist/index.html
            echo "- Correction manuelle du build final" >> $LOG_FILE
            echo "[✓] Correction appliquée"
        else
            echo "[✓] Vérification finale: script Lovable est présent dans le build"
        fi
    fi
else
    echo "[✗] ERREUR: La reconstruction a échoué"
    echo "- Échec du build" >> $LOG_FILE
fi
echo

# Vérification du navigateur
echo "[ÉTAPE 5/5] Recommandations pour le navigateur..."
if command -v xdg-settings &> /dev/null; then
    DEFAULT_BROWSER=$(xdg-settings get default-web-browser 2>/dev/null)
    if [[ "$DEFAULT_BROWSER" == *"chrome"* ]] || [[ "$DEFAULT_BROWSER" == *"chromium"* ]]; then
        echo "[✓] Vous utilisez Chrome/Chromium qui est recommandé pour Lovable"
    else
        echo "[!] Recommandation: Utilisez Google Chrome ou Microsoft Edge pour Lovable"
    fi
elif [ -f "/Applications/Google Chrome.app/Contents/Info.plist" ]; then
    echo "[i] Chrome est installé sur votre Mac"
else
    echo "[!] Recommandation: Utilisez Google Chrome ou Microsoft Edge pour Lovable"
fi
echo "- Vérification du navigateur terminée" >> $LOG_FILE
echo

echo "==================================================="
echo "     RÉPARATION TERMINÉE"
echo "==================================================="
echo
echo "Si vous étiez en train d'utiliser l'application:"
echo "1. Redémarrez l'application"
echo "2. Videz le cache de votre navigateur ou utilisez le mode incognito"
echo "3. Si le problème persiste, utilisez Chrome ou Edge"
echo
echo "Journal de diagnostic sauvegardé dans: $LOG_FILE"
echo
chmod +x fix-lovable-integration.sh
exit 0

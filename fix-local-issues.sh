
#!/bin/bash

echo "==================================================="
echo "     OUTIL DE RÉPARATION POUR FILECHAT LOCAL"
echo "==================================================="
echo ""
echo "Cet outil va tenter de résoudre les problèmes de fonctionnement en local:"
echo ""
echo "[1] Écran blanc / page qui ne se charge pas"
echo "[2] Problèmes d'édition avec Lovable"
echo "[3] Problèmes de connectivité locale à l'IA"
echo ""
echo "==================================================="
echo ""
echo "Appuyez sur Entrée pour démarrer la réparation..."
read

# Nettoyage du cache de build
echo "[ÉTAPE 1/5] Nettoyage du cache de build..."
if [ -d ".vite" ]; then
    rm -rf .vite
    echo "[OK] Cache Vite supprimé."
else
    echo "[INFO] Pas de cache Vite trouvé."
fi

if [ -d "node_modules/.vite" ]; then
    rm -rf node_modules/.vite
    echo "[OK] Cache Vite dans node_modules supprimé."
fi
echo ""

# Forcer le mode cloud
echo "[ÉTAPE 2/5] Configuration du mode cloud forcé..."
echo "FORCE_CLOUD_MODE=true" > .env.local
echo "VITE_DISABLE_DEV_MODE=true" >> .env.local
echo "[OK] Mode cloud forcé configuré."
echo ""

# Reconstruire l'application
echo "[ÉTAPE 3/5] Reconstruction complète de l'application..."
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
if [ $? -ne 0 ]; then
    echo "[ERREUR] Reconstruction de l'application échouée."
    echo "         Veuillez vérifier les erreurs de compilation."
    read
    exit 1
else
    echo "[OK] Application reconstruite avec succès."
fi
echo ""

# Vérification du script gptengineer.js
echo "[ÉTAPE 4/5] Vérification des dépendances Lovable..."
if ! grep -q "gptengineer.js" "dist/index.html"; then
    echo "[ATTENTION] Le script Lovable manque dans index.html."
    echo "             Correction manuelle..."
    
    # Créer un fichier temporaire
    touch dist/index.html.temp
    
    # Ajouter le script Lovable juste avant le premier script de type module
    cat dist/index.html | sed '/<script type="module" crossorigin/i \    <script src="https://cdn.gpteng.co/gptengineer.js" type="module"></script>' > dist/index.html.temp
    
    # Remplacer l'original
    mv dist/index.html.temp dist/index.html
    echo "[OK] Script Lovable ajouté."
else
    echo "[OK] Script Lovable déjà présent."
fi
echo ""

# Démarrage en mode simplifié
echo "[ÉTAPE 5/5] Démarrage en mode simplifié..."
echo ""
echo "==================================================="
echo "          RÉPARATION TERMINÉE"
echo "==================================================="
echo ""
echo "FileChat va maintenant démarrer en mode cloud simplifié."
echo "Ce mode évite toute dépendance locale à une IA."
echo ""
echo "Options:"
echo "[1] Démarrer en mode cloud simplifié"
echo "[2] Quitter sans démarrer"
echo ""
read -p "Votre choix [1/2]: " CHOICE

if [ "$CHOICE" = "1" ]; then
    bash start-app-simplified.sh
else
    echo ""
    echo "Pour démarrer ultérieurement, utilisez:"
    echo "./start-app-simplified.sh"
    echo ""
    read -p "Appuyez sur Entrée pour quitter..." 
fi
exit 0

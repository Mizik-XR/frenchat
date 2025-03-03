
#!/bin/bash

echo "==================================================="
echo "     NETTOYAGE ET CONFIGURATION DE FILECHAT"
echo "==================================================="
echo ""
echo "Cette procédure va nettoyer l'environnement et"
echo "réinstaller toutes les dépendances. Cela peut"
echo "prendre plusieurs minutes."
echo ""
echo "Actions:"
echo "1. Supprimer node_modules, dist, et venv"
echo "2. Nettoyer le cache npm"
echo "3. Réinstaller les dépendances npm"
echo "4. Recréer l'environnement Python"
echo "5. Préparer l'environnement pour le développement local"
echo ""
echo "==================================================="
echo ""
read -p "Appuyez sur Entrée pour continuer..." -n1 -s
echo ""

# Suppression des dossiers
echo "[ÉTAPE 1/5] Suppression des dossiers..."
if [ -d "node_modules" ]; then
    echo "[INFO] Suppression de node_modules..."
    rm -rf node_modules
fi
if [ -d "dist" ]; then
    echo "[INFO] Suppression de dist..."
    rm -rf dist
fi
if [ -d "venv" ]; then
    echo "[INFO] Suppression de venv..."
    rm -rf venv
fi
if [ -d ".netlify" ]; then
    echo "[INFO] Suppression de .netlify..."
    rm -rf .netlify
fi
echo "[OK] Dossiers supprimés avec succès."
echo ""

# Nettoyage du cache npm
echo "[ÉTAPE 2/5] Nettoyage du cache npm..."
npm cache clean --force
echo "[OK] Cache npm nettoyé."
echo ""

# Réinstallation des dépendances npm
echo "[ÉTAPE 3/5] Réinstallation des dépendances npm..."
npm install
if [ $? -ne 0 ]; then
    echo "[ERREUR] Échec de l'installation des dépendances npm."
    echo ""
    echo "Appuyez sur Entrée pour quitter..."
    read -n1 -s
    exit 1
fi
echo "[OK] Dépendances npm installées avec succès."
echo ""

# Recréation de l'environnement Python
echo "[ÉTAPE 4/5] Recréation de l'environnement Python..."
bash scripts/unix/setup-venv.sh
if [ $? -ne 0 ]; then
    echo "[ERREUR] Échec de la configuration de l'environnement Python."
    echo ""
    echo "Appuyez sur Entrée pour quitter..."
    read -n1 -s
    exit 1
fi
echo "[OK] Environnement Python configuré avec succès."
echo ""

# Préparation de l'environnement pour le développement local
echo "[ÉTAPE 5/5] Préparation de l'environnement de développement..."
npm run build
if [ $? -ne 0 ]; then
    echo "[ERREUR] Échec de la construction du projet."
    echo ""
    echo "Appuyez sur Entrée pour quitter..."
    read -n1 -s
    exit 1
fi
echo "[OK] Projet construit avec succès."
echo ""

echo "==================================================="
echo "     NETTOYAGE ET CONFIGURATION TERMINÉS"
echo "==================================================="
echo ""
echo "Votre environnement est maintenant prêt!"
echo ""
echo "Pour démarrer l'application:"
echo "1. En mode complet (IA locale + web): ./start-app.bat (Windows) ou bash scripts/unix/start-app-simplified.sh (Unix)"
echo "2. En mode cloud uniquement: ./start-cloud-mode.bat (Windows) ou MODE_CLOUD=1 bash scripts/unix/start-app-simplified.sh (Unix)"
echo ""
echo "Pour tester le déploiement Netlify en local:"
echo "- netlify dev"
echo ""
echo "Pour déployer sur Netlify:"
echo "- netlify deploy --prod"
echo ""
echo "Appuyez sur Entrée pour quitter..."
read -n1 -s
exit 0


#!/bin/bash
echo "Démarrage en mode minimal..."
echo
echo "Cette configuration utilise:"
echo "- Une résolution d'alias optimisée"
echo "- Une instance React unique et sécurisée"
echo "- Le mode de récupération pour éviter les conflits"
echo "- Une détection des dépendances circulaires"
echo
echo "Pour un diagnostic approfondi, exécutez:"
echo "  node src/scripts/dependency-analyzer.js"
echo

# Configurer l'environnement pour le mode minimal
export RECOVERY_MODE=true
export VITE_CLOUD_MODE=true
export VITE_DEBUG_MODE=true
export VITE_DISABLE_ADVANCED_FEATURES=true
export NODE_OPTIONS=--max-old-space-size=4096

# Rendre le script exécutable
chmod +x start-minimal.sh

# Démarrer l'application
npm run dev


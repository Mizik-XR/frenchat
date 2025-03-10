
#!/bin/bash
echo "========================================"
echo "Démarrage de la version minimale de Filechat"
echo "Pour diagnostiquer les problèmes d'initialisation"
echo "========================================"

echo "Vérification de l'environnement..."
export VITE_MINIMAL_MODE=true
export VITE_DISABLE_SENTRY=true

echo "Démarrage du serveur de développement..."
npm run dev -- --config vite.minimal.config.ts

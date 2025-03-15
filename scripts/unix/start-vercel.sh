
#!/bin/bash

echo "==================================================="
echo "     DÉMARRAGE FILECHAT (MODE VERCEL)"
echo "==================================================="
echo ""

# Configuration pour Vercel
export VITE_CLOUD_MODE=true
export VITE_ALLOW_LOCAL_AI=false
export VITE_CORS_PROXY=true
export NODE_OPTIONS="--max-old-space-size=4096"

# Construction du projet
echo "[INFO] Construction de l'application en cours..."
npm run build

if [ $? -ne 0 ]; then
    echo "[ERREUR] Construction de l'application échouée"
    exit 1
fi

echo "[OK] Application construite avec succès."
echo ""
echo "Vous pouvez maintenant déployer le dossier 'dist' sur Vercel."
echo "Utilisez la commande : vercel --prod"
echo ""
echo "==================================================="


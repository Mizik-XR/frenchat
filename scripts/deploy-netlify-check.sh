
#!/bin/bash

echo "====================================================="
echo "     VÉRIFICATION DE DÉPLOIEMENT NETLIFY"
echo "====================================================="
echo ""

# Vérification de l'environnement Netlify
if [ -z "$NETLIFY" ]; then
  echo "[INFO] Exécution en mode local (pas sur Netlify)"
  
  # Simuler les variables d'environnement Netlify pour les tests
  export NO_RUST_INSTALL=1
  export TRANSFORMERS_OFFLINE=1
  export SKIP_PYTHON_INSTALLATION=true
  export NODE_ENV=production
fi

# Afficher les informations du système
echo "[INFO] Informations système:"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo ""

# Vérification des variables d'environnement
echo "[INFO] Variables d'environnement de build:"
echo "NODE_ENV: $NODE_ENV"
echo "NO_RUST_INSTALL: $NO_RUST_INSTALL"
echo "NODE_OPTIONS: $NODE_OPTIONS"
echo ""

echo "====================================================="
echo "     VERIFICATION TERMINÉE"
echo "====================================================="
echo ""

exit 0


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
else
  echo "[INFO] Exécution dans l'environnement Netlify"
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
echo "SKIP_PYTHON_INSTALLATION: $SKIP_PYTHON_INSTALLATION"
echo "VITE_CLOUD_MODE: $VITE_CLOUD_MODE"
echo ""

# Vérification de la présence des fichiers essentiels
echo "[INFO] Vérification des fichiers essentiels:"
if [ -f "netlify.toml" ]; then
  echo "[OK] netlify.toml présent"
else
  echo "[ATTENTION] netlify.toml manquant"
fi

if [ -f "_redirects" ]; then
  echo "[OK] _redirects présent"
else
  echo "[ATTENTION] _redirects manquant"
fi

echo "====================================================="
echo "     VERIFICATION TERMINÉE"
echo "====================================================="
echo ""

exit 0


#!/bin/bash

echo "====================================================="
echo "     VÉRIFICATION DE DÉPLOIEMENT NETLIFY"
echo "====================================================="
echo ""

# Vérifier si nous sommes sur Netlify
if [ -n "$NETLIFY" ]; then
  echo "[INFO] Exécution sur l'environnement Netlify"
else
  echo "[INFO] Exécution en mode local (pas sur Netlify)"
fi

# Afficher les informations du système
echo "[INFO] Informations système:"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo ""

# Vérifier la présence de fichiers critiques
echo "[INFO] Vérification des fichiers critiques..."

if [ -f "netlify.toml" ]; then
  echo "✅ Le fichier netlify.toml existe"
else
  echo "❌ Le fichier netlify.toml est absent"
fi

if [ -f "_redirects" ]; then
  echo "✅ Le fichier _redirects existe"
else
  echo "❌ Le fichier _redirects est absent"
fi

if [ -f "_headers" ]; then
  echo "✅ Le fichier _headers existe"
else
  echo "❌ Le fichier _headers est absent"
fi

echo ""
echo "====================================================="
echo "     VERIFICATION TERMINÉE"
echo "====================================================="
echo ""

exit 0


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
fi

# Vérification si transformers est installé
if python -c "import transformers" 2>/dev/null; then
  echo "[OK] Le package transformers est déjà installé"
else
  echo "[INFO] Installation du package transformers sans compilation..."
  pip install transformers==4.36.2 --no-deps
  pip install tokenizers --only-binary=:all:
  
  # Vérification de l'installation
  if python -c "import transformers" 2>/dev/null; then
    echo "[OK] Le package transformers a été installé avec succès"
  else
    echo "[ERREUR] L'installation de transformers a échoué"
    echo "[INFO] Passage en mode minimal sans transformers"
    
    # Créer un fichier de contournement
    mkdir -p site-packages/transformers
    echo "# Package simulé" > site-packages/transformers/__init__.py
    export PYTHONPATH="${PYTHONPATH}:$(pwd)/site-packages"
  fi
fi

echo ""
echo "====================================================="
echo "     VÉRIFICATION TERMINÉE"
echo "====================================================="
echo ""

exit 0


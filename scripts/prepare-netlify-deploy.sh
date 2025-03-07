
#!/bin/bash

echo "==================================================="
echo "    PRÉPARATION DU DÉPLOIEMENT NETLIFY"
echo "==================================================="
echo

# Configuration pour le déploiement sans Rust/Python
export NO_RUST_INSTALL=1
export TRANSFORMERS_OFFLINE=1
export SKIP_PYTHON_INSTALLATION=true
export NODE_ENV=production
export VITE_CLOUD_MODE=true
export VITE_ALLOW_LOCAL_AI=false

# Vérifier si le fichier requirements.txt existe et le modifier
if [ -f "requirements.txt" ]; then
    echo "[INFO] Création d'un requirements.txt minimal pour Netlify..."
    # Créer une version simplifiée du requirements.txt sans les dépendances nécessitant Rust
    cat > requirements.txt.netlify << EOF
# Version simplifiée pour Netlify (sans compilation Rust)
fastapi==0.110.0
uvicorn==0.28.0
pydantic>=2.0.0
aiohttp>=3.8.0
# Les packages qui nécessitent Rust sont commentés
# tokenizers
# transformers
EOF
    mv requirements.txt.netlify requirements.txt
    echo "[OK] Fichier requirements.txt simplifié créé."
fi

echo "[SÉCURITÉ] IMPORTANT: Ne stockez pas les clés API sensibles dans les fichiers source."
echo "[SÉCURITÉ] Utilisez les variables d'environnement dans l'interface Netlify pour:"
echo "          - VITE_SUPABASE_URL"
echo "          - VITE_SUPABASE_ANON_KEY"
echo "          - Autres clés API sensibles"
echo ""
echo "[INFO] Préparation terminée. Variables d'environnement configurées pour Netlify."
echo "==================================================="

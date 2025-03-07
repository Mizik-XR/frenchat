
#!/bin/bash

echo "==================================================="
echo "     VERIFICATION DU BUILD NETLIFY"
echo "==================================================="
echo

if [ ! -d "dist" ]; then
    echo "[ERREUR] Le dossier dist n'existe pas."
    echo "Veuillez executer 'npm run build' avant de verifier."
    exit 1
fi

node scripts/verify-netlify-build.js

echo
read -p "Appuyez sur Entrée pour continuer..." -n1 -s

# Make script executable
chmod +x scripts/verify-netlify-build.sh

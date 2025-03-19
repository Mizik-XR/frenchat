
#!/bin/bash

echo "=============================================="
echo "  CORRECTION AUTOMATIQUE DES IMPORTS REACT"
echo "=============================================="
echo

# Exécuter le script Node.js
node scripts/fix-react-imports.js

# Rendre le script exécutable
chmod +x scripts/fix-react-imports.js

echo
echo "Si le script a réussi, vous pouvez maintenant exécuter:"
echo "npm run build -- --mode development"
echo "pour vérifier que les corrections fonctionnent correctement."

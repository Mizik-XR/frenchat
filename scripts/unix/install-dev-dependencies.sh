
#!/bin/bash

echo "==================================================="
echo "    INSTALLATION DES DÉPENDANCES DE DÉVELOPPEMENT"
echo "==================================================="
echo
echo "Ce script va installer les dépendances nécessaires pour"
echo "les outils de développement et les scripts de diagnostic."
echo
echo "==================================================="
echo
read -p "Appuyez sur Entrée pour continuer..." -n1 -s
echo

# Vérification de Node.js
if ! command -v node &> /dev/null; then
    echo "[ERREUR] Node.js n'est pas installé. Installation impossible."
    exit 1
fi

# Installation d'axios pour les scripts de diagnostic
echo "[INFO] Installation d'axios pour les outils de diagnostic..."
npm install axios --save-dev

if [ $? -ne 0 ]; then
    echo "[ERREUR] Échec de l'installation d'axios."
    exit 1
fi
echo "[OK] axios installé avec succès."

echo
echo "==================================================="
echo "    INSTALLATION TERMINÉE"
echo "==================================================="
echo
echo "Toutes les dépendances de développement ont été installées."
echo "Vous pouvez maintenant utiliser les scripts de diagnostic et de déploiement."
echo
read -p "Appuyez sur Entrée pour continuer..." -n1 -s
exit 0

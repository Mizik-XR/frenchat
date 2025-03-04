
#!/bin/bash

echo "==================================================="
echo "     CORRECTIF POUR ENVIRONNEMENT DE PRÉVISUALISATION"
echo "==================================================="
echo
echo "Cet outil va corriger les problèmes de chemin de fichier"
echo "dans les environnements de prévisualisation comme Lovable"
echo
echo "==================================================="
echo

# Vérifier et corriger index.html
echo "[ÉTAPE 1/2] Vérification du fichier index.html..."
if [ -f "index.html" ]; then
    echo "[INFO] Modification des chemins de fichiers pour mode prévisualisation..."
    
    # Sauvegarde du fichier original
    cp index.html index.html.backup
    
    # Modifier le fichier index.html pour utiliser des chemins relatifs
    sed -i 's|/favicon.ico|./favicon.ico|g' index.html
    sed -i 's|/src/main.tsx|./src/main.tsx|g' index.html
    
    echo "[OK] Chemins de fichiers corrigés dans index.html."
else
    echo "[ERREUR] Le fichier index.html est manquant dans le répertoire racine."
    exit 1
fi
echo

# Vérifier et ajouter _redirects
echo "[ÉTAPE 2/2] Création du fichier de redirection pour SPA..."
if [ ! -f "public/_redirects" ]; then
    echo "[INFO] Création du fichier _redirects..."
    
    # Créer le dossier public s'il n'existe pas
    mkdir -p public
    
    # Créer le fichier _redirects
    echo "/* /index.html 200" > "public/_redirects"
    
    echo "[OK] Fichier _redirects créé."
else
    echo "[INFO] Le fichier _redirects existe déjà."
fi
echo

echo "==================================================="
echo "     CORRECTIF TERMINÉ AVEC SUCCÈS"
echo "==================================================="
echo
echo "Vous pouvez maintenant déployer votre application dans"
echo "un environnement de prévisualisation."
echo

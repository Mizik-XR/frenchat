
#!/bin/bash

echo "==================================================="
echo "     RÉSOLUTION AUTOMATIQUE DES CONFLITS GIT"
echo "==================================================="
echo

# Vérifier si le fichier _redirects existe et s'il contient des marqueurs de conflit
if [ -f "scripts/_redirects" ]; then
    if grep -q "<<<<<<< HEAD" "scripts/_redirects"; then
        echo "[INFO] Conflit détecté dans scripts/_redirects, résolution en cours..."
        
        # Sauvegarder une copie du fichier original en conflit
        cp "scripts/_redirects" "scripts/_redirects.conflict"
        
        # Créer une nouvelle version propre du fichier
        cat > "scripts/_redirects" << EOL
# Redirection SPA - toutes les routes non existantes vers index.html
/*    /index.html   200

# Redirection API vers les fonctions Netlify
/api/*  /.netlify/functions/:splat  200
EOL
        
        echo "[OK] Fichier scripts/_redirects recréé avec le contenu correct."
    else
        echo "[INFO] Aucun marqueur de conflit trouvé dans scripts/_redirects."
    fi
else
    echo "[INFO] Le fichier scripts/_redirects n'existe pas, création..."
    
    # Créer le dossier scripts s'il n'existe pas
    mkdir -p scripts
    
    # Créer le fichier
    cat > "scripts/_redirects" << EOL
# Redirection SPA - toutes les routes non existantes vers index.html
/*    /index.html   200

# Redirection API vers les fonctions Netlify
/api/*  /.netlify/functions/:splat  200
EOL
    
    echo "[OK] Fichier scripts/_redirects créé avec le contenu correct."
fi

# Gestion du conflit dans _redirects à la racine du projet
if [ -f "_redirects" ]; then
    if grep -q "<<<<<<< HEAD" "_redirects"; then
        echo "[INFO] Conflit détecté dans _redirects à la racine, résolution en cours..."
        
        # Sauvegarder une copie du fichier original en conflit
        cp "_redirects" "_redirects.conflict"
        
        # Créer une nouvelle version propre du fichier
        echo "/*  /index.html  200" > "_redirects"
        
        echo "[OK] Fichier _redirects recréé avec le contenu correct."
    else
        echo "[INFO] Aucun marqueur de conflit trouvé dans _redirects."
    fi
else
    echo "[INFO] Le fichier _redirects n'existe pas à la racine, création..."
    
    # Créer le fichier
    echo "/*  /index.html  200" > "_redirects"
    
    echo "[OK] Fichier _redirects créé avec le contenu correct."
fi

echo
echo "[ÉTAPE SUIVANTE] Utilisation de Git pour résoudre le conflit..."

# Vérifier si git est disponible
if command -v git &> /dev/null; then
    # Marquer les fichiers comme résolus
    git add "_redirects" "scripts/_redirects" &> /dev/null
    
    echo "[OK] Fichiers marqués comme résolus dans Git."
    echo "[INFO] Vous pouvez maintenant continuer le merge dans GitHub Desktop."
    echo "       Cliquez sur \"Continue merge\" pour finaliser."
else
    echo "[ATTENTION] Git n'est pas disponible en ligne de commande."
    echo "            Veuillez ouvrir GitHub Desktop et:"
    echo "            1. Sélectionner les fichiers _redirects et scripts/_redirects"
    echo "            2. Choisir \"Discard changes\" puis les re-sélectionner"
    echo "            3. Cliquer sur \"Continue merge\""
fi

echo
echo "==================================================="
echo "     INSTRUCTIONS POUR FINALISER"
echo "==================================================="
echo
echo "1. Retournez à GitHub Desktop"
echo "2. Cliquez sur \"Continue merge\""
echo "3. Puis cliquez sur \"Push origin\""
echo
echo "Si \"Continue merge\" n'est pas disponible, essayez de"
echo "fermer et rouvrir GitHub Desktop."
echo

# Rendre le script exécutable
chmod +x "$0"

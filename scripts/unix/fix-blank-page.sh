
#!/bin/bash

echo "==================================================="
echo "    OUTIL DE RÉPARATION FILECHAT"
echo "==================================================="
echo
echo "Cet outil va tenter de résoudre les problèmes suivants:"
echo
echo "[1] Page blanche après chargement"
echo "[2] Erreur \"AI edits didn't result in any changes\""
echo "[3] Problèmes d'édition avec Lovable"
echo
echo "==================================================="
echo
read -p "Appuyez sur Entrée pour démarrer la réparation..." -n1 -s
echo

# Nettoyer le dossier dist
echo "[ÉTAPE 1/4] Nettoyage du dossier dist..."
if [ -d "dist" ]; then
    rm -rf dist
    echo "[OK] Dossier dist supprimé avec succès."
else
    echo "[INFO] Le dossier dist n'existe pas, étape ignorée."
fi
echo

# Vérifier et corriger index.html
echo "[ÉTAPE 2/4] Vérification du fichier index.html..."
if [ -f "index.html" ]; then
    echo "[INFO] Vérification de la présence du script gptengineer.js..."
    if ! grep -q "gptengineer.js" "index.html"; then
        echo "[ATTENTION] Le script Lovable manque dans index.html, correction..."
        
        # Sauvegarde du fichier original
        cp index.html index.html.backup
        
        # Vérifier l'emplacement du script main.tsx et ajouter gptengineer.js avant
        sed -i '/<script type="module" src="\/src\/main.tsx"><\/script>/i \    <!-- Script requis pour Lovable fonctionnant comme "Pick and Edit" -->\n    <script src="https://cdn.gpteng.co/gptengineer.js" type="module"></script>' index.html
        
        echo "[OK] Script gptengineer.js ajouté dans index.html."
    else
        echo "[INFO] Vérifions l'ordre des scripts..."
        
        # Vérifier si le script gptengineer.js est correctement placé avant main.tsx
        ENGINEER_LINE=$(grep -n "gptengineer.js" index.html | cut -d':' -f1)
        MAIN_LINE=$(grep -n "main.tsx" index.html | cut -d':' -f1)
        
        if [ -n "$ENGINEER_LINE" ] && [ -n "$MAIN_LINE" ]; then
            if [ "$ENGINEER_LINE" -gt "$MAIN_LINE" ]; then
                echo "[ATTENTION] Le script gptengineer.js doit être avant main.tsx, correction..."
                
                # Sauvegarde du fichier original
                cp index.html index.html.backup
                
                # Créer un fichier temporaire corrigé
                awk '
                    {print}
                    /main.tsx/ && !printed {
                        print "    <!-- Script requis pour Lovable fonctionnant comme \"Pick and Edit\" -->";
                        print "    <script src=\"https://cdn.gpteng.co/gptengineer.js\" type=\"module\"></script>";
                        printed=1
                    }
                ' index.html | grep -v "gptengineer.js" > index.html.temp
                
                mv index.html.temp index.html
                echo "[OK] Ordre des scripts corrigé dans index.html."
            else
                echo "[OK] L'ordre des scripts est déjà correct."
            fi
        fi
    fi
else
    echo "[ATTENTION] Le fichier index.html est manquant dans le répertoire racine."
    echo "             Création d'un fichier index.html basique..."
    
    cat > index.html << EOL
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FileChat - Votre assistant d'intelligence documentaire</title>
    <meta name="description" content="FileChat indexe automatiquement tous vos documents depuis Google Drive et Microsoft Teams, vous permettant d'interagir avec l'ensemble de votre base documentaire." />
  </head>
  <body>
    <div id="root"></div>
    <!-- Script requis pour Lovable fonctionnant comme "Pick and Edit" -->
    <script src="https://cdn.gpteng.co/gptengineer.js" type="module"></script>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOL
    
    echo "[OK] Fichier index.html créé avec succès."
fi
echo

# Vérification du node_modules
echo "[ÉTAPE 3/4] Vérification des dépendances..."
if [ ! -d "node_modules" ]; then
    echo "[ATTENTION] Le dossier node_modules est manquant."
    echo "[INFO] Installation des dépendances..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[ERREUR] Installation des dépendances échouée."
        echo "         Essai avec --legacy-peer-deps..."
        npm install --legacy-peer-deps
    fi
else
    echo "[OK] Le dossier node_modules existe."
fi
echo

# Reconstruction de l'application
echo "[ÉTAPE 4/4] Reconstruction complète de l'application..."
npm run build
if [ $? -ne 0 ]; then
    echo "[ERREUR] Reconstruction de l'application échouée."
    echo "         Essai avec NODE_OPTIONS=--max-old-space-size=4096..."
    export NODE_OPTIONS="--max-old-space-size=4096"
    npm run build
    if [ $? -ne 0 ]; then
        echo "[ERREUR] Reconstruction de l'application échouée."
        echo "          Vérifiez les messages d'erreur ci-dessus."
        echo
        echo "Réparation terminée avec erreurs. Veuillez contacter le support technique."
        read -p "Appuyez sur Entrée pour quitter..." -n1 -s
        exit 1
    fi
else
    echo "[OK] Application reconstruite avec succès."
fi

# Vérification finale du fichier dist/index.html
if [ -f "dist/index.html" ]; then
    echo "[INFO] Vérification finale du fichier dist/index.html..."
    if ! grep -q "gptengineer.js" "dist/index.html"; then
        echo "[ATTENTION] Le script gptengineer.js est absent du fichier dist/index.html."
        echo "             Cela est probablement dû à une configuration de build incorrecte."
        echo "             Copie manuelle du fichier index.html vers dist..."
        
        cp index.html dist/index.html
        echo "[OK] Fichier index.html copié manuellement vers dist."
    else
        echo "[OK] Le fichier dist/index.html contient le script gptengineer.js."
    fi
fi
echo

echo "==================================================="
echo "    RÉPARATION TERMINÉE AVEC SUCCÈS"
echo "==================================================="
echo
echo "Veuillez maintenant lancer l'application avec:"
echo "- Sur Windows: ./start-app.bat"
echo "- Sur Mac/Linux: ./scripts/unix/start-app-simplified.sh"
echo
echo "Si le problème persiste:"
echo "1. Vérifiez avec ./scripts/unix/diagnostic.sh ou ./scripts/diagnostic.bat"
echo "2. Essayez le mode compatible: ./start-cloud-mode.bat"
echo
read -p "Appuyez sur Entrée pour quitter..." -n1 -s
exit 0

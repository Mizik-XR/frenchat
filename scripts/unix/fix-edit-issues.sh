
#!/bin/bash

echo "==================================================="
echo "   RÉPARATION DES PROBLÈMES D'ÉDITION LOVABLE"
echo "==================================================="
echo ""

# Vérification et correction du fichier index.html
echo "[ÉTAPE 1/3] Vérification de l'intégration du script Lovable dans index.html..."

if [ -f "index.html" ]; then
  # Vérifier si le script est présent
  if grep -q "gptengineer.js" "index.html"; then
    echo "[OK] Script Lovable trouvé dans index.html."
    
    # Vérifier si le script est placé avant le script principal
    if grep -A5 "gptengineer.js" "index.html" | grep -q "src=\"/src/main.tsx\""; then
      echo "[OK] Script Lovable correctement placé avant le script principal."
    else
      echo "[ATTENTION] Script Lovable potentiellement mal positionné. Correction..."
      # Sauvegarde du fichier
      cp index.html index.html.bak
      
      # Tentative de correction en déplaçant le script
      sed -i 's|<script src="https://cdn.gpteng.co/gptengineer.js" type="module"></script>|<!-- -->|g' index.html
      sed -i 's|<head>|<head>\n    <script src="https://cdn.gpteng.co/gptengineer.js" type="module"></script>|g' index.html
      
      echo "[OK] Script Lovable repositionné dans index.html."
    fi
  else
    echo "[ERREUR] Script Lovable non trouvé dans index.html. Ajout..."
    
    # Sauvegarde du fichier
    cp index.html index.html.bak
    
    # Ajout du script au début du head
    sed -i 's|<head>|<head>\n    <script src="https://cdn.gpteng.co/gptengineer.js" type="module"></script>|g' index.html
    
    echo "[OK] Script Lovable ajouté à index.html."
  fi
else
  echo "[ERREUR] Fichier index.html non trouvé à la racine du projet."
fi

# Vérification et mise à jour des dépendances
echo ""
echo "[ÉTAPE 2/3] Vérification et mise à jour des dépendances..."

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
  echo "[ERREUR] npm n'est pas installé."
  exit 1
fi

# Installation des dépendances nécessaires
npm install --no-save --silent

echo "[OK] Dépendances mises à jour."

# Nettoyage du cache
echo ""
echo "[ÉTAPE 3/3] Nettoyage du cache et reconstruction..."

# Supprimer le dossier dist
if [ -d "dist" ]; then
  rm -rf dist
  echo "[OK] Dossier dist supprimé."
fi

# Supprimer le cache de npm
npm cache clean --force
echo "[OK] Cache npm nettoyé."

# Reconstruire l'application
npm run build
if [ $? -eq 0 ]; then
  echo "[OK] Application reconstruite avec succès."
else
  echo "[ERREUR] Échec de la reconstruction de l'application."
  exit 1
fi

echo ""
echo "==================================================="
echo "   PROBLÈMES D'ÉDITION LOVABLE CORRIGÉS"
echo "==================================================="
echo ""
echo "Les problèmes d'édition Lovable ont été corrigés."
echo "Veuillez rafraîchir votre navigateur ou redémarrer votre serveur de développement."
echo ""

exit 0

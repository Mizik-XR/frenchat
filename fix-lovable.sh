
#!/bin/bash

echo "==================================================="
echo "    SCRIPT DE RÉPARATION DE L'INTÉGRATION LOVABLE"
echo "==================================================="
echo
echo "Ce script va tenter de résoudre les problèmes d'intégration de Lovable."
echo "Assurez-vous que l'application est en cours d'exécution."
echo
echo "==================================================="
echo

# Vérifier si le fichier index.html existe
if [ ! -f "index.html" ]; then
    echo "[ERREUR] Le fichier index.html n'a pas été trouvé dans le répertoire courant."
    echo "Veuillez exécuter ce script depuis le répertoire racine du projet."
    exit 1
fi

# Vérifier si le script Lovable est présent dans index.html
echo "[ÉTAPE 1/3] Vérification de la présence du script Lovable dans index.html..."
if grep -q "gptengineer.js" index.html; then
    echo "✅ Le script Lovable est bien présent dans index.html."
else
    echo "❌ Le script Lovable n'est pas présent dans index.html. Ajout en cours..."
    
    # Ajouter le script dans l'en-tête
    sed -i 's|<head>|<head>\n    <!-- Script requis pour Lovable - NE PAS SUPPRIMER OU MODIFIER -->\n    <script src="https://cdn.gpteng.co/gptengineer.js" type="module"></script>|' index.html
    
    if grep -q "gptengineer.js" index.html; then
        echo "✅ Script Lovable ajouté avec succès dans index.html."
    else
        echo "❌ Échec de l'ajout du script Lovable. Veuillez l'ajouter manuellement."
    fi
fi

# Vérifier l'initialisation de Lovable dans main.tsx
echo
echo "[ÉTAPE 2/3] Vérification de l'initialisation de Lovable dans main.tsx..."
if [ -f "src/main.tsx" ]; then
    if grep -q "initLovableIntegration" src/main.tsx; then
        echo "✅ L'initialisation de Lovable est bien présente dans main.tsx."
    else
        echo "⚠️ L'initialisation de Lovable n'a pas été trouvée dans main.tsx."
        echo "Veuillez vous assurer que 'initLovableIntegration()' est appelé au début de main.tsx."
    fi
else
    echo "❌ Le fichier src/main.tsx n'a pas été trouvé."
fi

# Vérifier les utilitaires Lovable
echo
echo "[ÉTAPE 3/3] Vérification des utilitaires Lovable..."
if [ -d "src/utils/lovable" ]; then
    echo "✅ Le répertoire des utilitaires Lovable existe."
    
    # Vérifier la présence des fichiers essentiels
    if [ -f "src/utils/lovable/lovableIntegration.ts" ]; then
        echo "✅ Le fichier lovableIntegration.ts est présent."
    else
        echo "❌ Le fichier lovableIntegration.ts est manquant."
    fi
    
    if [ -f "src/utils/lovable/editingUtils.ts" ]; then
        echo "✅ Le fichier editingUtils.ts est présent."
    else
        echo "❌ Le fichier editingUtils.ts est manquant."
    fi
else
    echo "❌ Le répertoire des utilitaires Lovable est manquant."
fi

# Conclusion
echo
echo "==================================================="
echo "              VÉRIFICATION TERMINÉE"
echo "==================================================="
echo
echo "Si des problèmes ont été identifiés, veuillez les corriger."
echo "Puis redémarrez l'application avec 'npm run dev' ou 'yarn dev'."
echo
echo "Pour forcer la réinjection du script Lovable dans le navigateur:"
echo "1. Ouvrez la console développeur (F12)"
echo "2. Exécutez: window.forceLovableReload()"
echo "3. Rafraîchissez la page"
echo
echo "==================================================="

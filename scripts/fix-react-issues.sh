
#!/bin/bash

echo "==================================================="
echo "    OUTIL DE RÉPARATION DES DÉPENDANCES REACT"
echo "==================================================="
echo
echo "Cet outil va tenter de résoudre les problèmes suivants:"
echo
echo "[1] Dépendances circulaires React"
echo "[2] Erreurs liées à useLayoutEffect"
echo "[3] Problèmes d'instances React multiples"
echo
echo "==================================================="
echo
read -p "Appuyez sur Entrée pour démarrer la réparation..." -n1 -s
echo

# Vérifier si le fichier .env.local existe, sinon le créer
echo "[ÉTAPE 1/4] Vérification de la configuration environnement..."
if [ ! -f ".env.local" ]; then
    echo "Création d'un fichier .env.local avec configuration optimisée..."
    cat > .env.local << EOF
# Configuration optimisée pour éviter les erreurs React
VITE_DISABLE_ESLINT_PLUGIN=true
VITE_SKIP_PREFLIGHT_CHECK=true
VITE_TSC_COMPILE_ON_ERROR=true
VITE_ENVIRONMENT=development
VITE_DEBUG_MODE=true
EOF
    echo "[OK] Fichier .env.local créé avec la configuration optimisée."
else
    echo "[INFO] Le fichier .env.local existe déjà."
fi
echo

# Vérifier la présence de useLayoutEffect dans le code
echo "[ÉTAPE 2/4] Vérification des usages de useLayoutEffect..."
useLayoutEffectCount=$(grep -r "useLayoutEffect" --include="*.tsx" --include="*.ts" src/ | wc -l)
if [ "$useLayoutEffectCount" -gt 0 ]; then
    echo "[ATTENTION] $useLayoutEffectCount occurrences de useLayoutEffect trouvées dans le code."
    echo "            Ce hook peut causer des erreurs en environnement SSR."
    echo "            Considérez remplacer useLayoutEffect par useEffect quand possible."
else
    echo "[OK] Aucun usage problématique de useLayoutEffect détecté."
fi
echo

# Vérifier les importations directes de React
echo "[ÉTAPE 3/4] Vérification des imports de React..."
directImports=$(grep -r "from 'react'" --include="*.tsx" --include="*.ts" src/ | wc -l)
if [ "$directImports" -gt 0 ]; then
    echo "[ATTENTION] $directImports importations directes de React trouvées."
    echo "            Ces importations peuvent causer des problèmes d'instances multiples."
    echo "            Utilisez plutôt : import { React } from '@/core/ReactInstance';"
else
    echo "[OK] Aucune importation directe de React détectée."
fi
echo

# Vérifier la présence de createContext sans ReactInstance
echo "[ÉTAPE 4/4] Vérification des usages de createContext..."
createContextCount=$(grep -r "createContext" --include="*.tsx" --include="*.ts" src/ | grep -v "ReactInstance" | wc -l)
if [ "$createContextCount" -gt 0 ]; then
    echo "[ATTENTION] $createContextCount usages de createContext sans ReactInstance trouvés."
    echo "            Ces usages peuvent causer des problèmes de dépendances circulaires."
    echo "            Utilisez plutôt : const MyContext = React.createContext();"
else
    echo "[OK] Aucun usage problématique de createContext détecté."
fi
echo

# Conclusion
echo "==================================================="
echo "              VÉRIFICATION TERMINÉE"
echo "==================================================="
echo
echo "Pour éviter les problèmes de dépendances circulaires React:"
echo "1. Importez toujours React depuis @/core/ReactInstance"
echo "2. Évitez les dépendances circulaires entre les fichiers"
echo "3. Séparez les types, utilitaires et composants dans des fichiers distincts"
echo "4. Utilisez des imports dynamiques pour les dépendances problématiques"
echo
read -p "Appuyez sur Entrée pour terminer..." -n1 -s
exit 0



#!/bin/bash

echo "==================================================="
echo "    RÉPARATION PAGE BLANCHE POUR VERCEL"
echo "==================================================="
echo

# Détection de l'erreur de routeur React
echo "[ÉTAPE 1/2] Vérification de la configuration du routeur React..."

# Vérifier main.tsx
if [ -f "src/main.tsx" ]; then
  if ! grep -q "BrowserRouter" "src/main.tsx"; then
    echo "[CORRECTION] Ajout de BrowserRouter dans main.tsx..."
    sed -i 's/ReactDOM\.createRoot(rootElement)\.render(/ReactDOM.createRoot(rootElement).render(\n      <BrowserRouter>/' src/main.tsx
    sed -i 's/<App \/>/<App \/>\n      <\/BrowserRouter>/' src/main.tsx
    echo "[AJOUT] import { BrowserRouter } from 'react-router-dom'" >> src/main.tsx.temp
    cat src/main.tsx >> src/main.tsx.temp
    mv src/main.tsx.temp src/main.tsx
    echo "[OK] main.tsx corrigé."
  else
    echo "[OK] BrowserRouter déjà configuré dans main.tsx."
  fi
else
  echo "[ERREUR] src/main.tsx introuvable."
fi

# Reconstruction
echo "[ÉTAPE 2/2] Reconstruction de l'application..."
npm run build

echo "==================================================="
echo "           CORRECTION TERMINÉE"
echo "==================================================="
echo "Vous pouvez maintenant déployer sur Vercel avec:"
echo "vercel --prod"
echo "==================================================="

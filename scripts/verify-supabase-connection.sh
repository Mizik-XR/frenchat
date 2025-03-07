
#!/bin/bash

echo "==================================================="
echo "     VÉRIFICATION DE LA CONNEXION SUPABASE"
echo "==================================================="
echo

# Vérification des variables d'environnement
if [ -f ".env.production" ]; then
    echo "[INFO] Vérification des variables d'environnement dans .env.production..."
    if grep -q "VITE_SUPABASE_URL" ".env.production"; then
        echo "[OK] Variable VITE_SUPABASE_URL trouvée dans .env.production"
    else
        echo "[ATTENTION] Variable VITE_SUPABASE_URL non trouvée dans .env.production"
    fi

    if grep -q "VITE_SUPABASE_ANON_KEY" ".env.production"; then
        echo "[OK] Variable VITE_SUPABASE_ANON_KEY trouvée dans .env.production"
    else
        echo "[ATTENTION] Variable VITE_SUPABASE_ANON_KEY non trouvée dans .env.production"
    fi
else
    echo "[INFO] Fichier .env.production non trouvé."
    echo "       Les variables doivent être configurées dans l'interface Netlify."
fi

# Vérification de netlify.toml
if [ -f "netlify.toml" ]; then
    echo "[INFO] Vérification de la configuration netlify.toml..."
    if grep -q "to = \"/index.html\"" "netlify.toml"; then
        echo "[OK] Règle de redirection SPA trouvée dans netlify.toml"
    else
        echo "[ATTENTION] Règle de redirection SPA non trouvée dans netlify.toml"
    fi
else
    echo "[INFO] Fichier netlify.toml non trouvé. Vérifiez _redirects."
fi

# Vérification de _redirects
if [ -f "_redirects" ]; then
    echo "[INFO] Vérification du fichier _redirects..."
    if grep -q "/\* /index.html 200" "_redirects"; then
        echo "[OK] Règle de redirection SPA trouvée dans _redirects"
    else
        echo "[ATTENTION] Règle de redirection SPA non trouvée dans _redirects"
    fi
else
    echo "[INFO] Fichier _redirects non trouvé."
fi

# Vérification du client Supabase
echo "[INFO] Vérification du code client Supabase..."
if grep -r "createClient.*supabase" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" .; then
    echo "[OK] Client Supabase trouvé dans le code source"
else
    echo "[ATTENTION] Client Supabase non trouvé dans le code. Vérifiez l'intégration."
fi

echo
echo "==================================================="
echo "     INSTRUCTIONS POUR VÉRIFIER LA CONNEXION"
echo "==================================================="
echo
echo "1. Ouvrez votre application déployée sur Netlify"
echo "2. Ouvrez la console du navigateur (F12)"
echo "3. Vérifiez qu'il n'y a pas d'erreurs liées à Supabase"
echo "4. Essayez de vous connecter si votre application a une authentification"
echo
echo "Dans l'interface Netlify, vérifiez que les variables d'environnement"
echo "sont correctement configurées sous Site Settings > Environment variables:"
echo "- VITE_SUPABASE_URL"
echo "- VITE_SUPABASE_ANON_KEY"
echo
echo "Si vous utilisez des fonctions Netlify pour communiquer avec Supabase,"
echo "vérifiez qu'elles sont correctement déployées et fonctionnelles."
echo

# Rendre le script exécutable
chmod +x "$0"

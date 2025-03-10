
// Script pour ajouter des headers corrects au déploiement Vercel
const fs = require('fs');
const path = require('path');

console.log('📋 Configuration des headers Vercel pour corriger les types MIME...');

// Vérifier si la configuration vercel.json existe
if (!fs.existsSync('vercel.json')) {
  console.error('❌ Fichier vercel.json non trouvé. Le script ne peut pas continuer.');
  process.exit(1);
}

// Lire le fichier de configuration actuel
let vercelConfig;
try {
  vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
} catch (error) {
  console.error('❌ Erreur lors de la lecture du fichier vercel.json:', error);
  process.exit(1);
}

// S'assurer que la section headers existe
if (!vercelConfig.headers) {
  vercelConfig.headers = [];
}

// Définir les types MIME pour différentes extensions de fichiers
const mimeTypeMappings = [
  {
    source: "/(.*)\\.js$",
    headers: [{ key: "Content-Type", value: "application/javascript; charset=utf-8" }]
  },
  {
    source: "/(.*)\\.mjs$",
    headers: [{ key: "Content-Type", value: "application/javascript; charset=utf-8" }]
  },
  {
    source: "/(.*)\\.css$",
    headers: [{ key: "Content-Type", value: "text/css; charset=utf-8" }]
  },
  {
    source: "/(.*)\\.svg$",
    headers: [{ key: "Content-Type", value: "image/svg+xml; charset=utf-8" }]
  }
];

// Ajouter ou mettre à jour les configurations de headers
let headersUpdated = false;
mimeTypeMappings.forEach(mapping => {
  const existingHeaderIndex = vercelConfig.headers.findIndex(
    header => header.source === mapping.source
  );
  
  if (existingHeaderIndex >= 0) {
    vercelConfig.headers[existingHeaderIndex] = mapping;
  } else {
    vercelConfig.headers.push(mapping);
  }
  headersUpdated = true;
});

// Mettre à jour les routes pour s'assurer que les fichiers statiques sont correctement servis
if (!vercelConfig.routes) {
  vercelConfig.routes = [];
}

// Ajouter une route pour les assets avec des headers spécifiques
const assetsRoute = { 
  src: "/assets/.*\\.(js|css|svg|png|jpg|jpeg|gif|ico)$", 
  headers: { 
    "cache-control": "public, max-age=31536000, immutable" 
  }, 
  continue: true 
};

const existingAssetsRouteIndex = vercelConfig.routes.findIndex(
  route => route.src === assetsRoute.src
);

if (existingAssetsRouteIndex >= 0) {
  vercelConfig.routes[existingAssetsRouteIndex] = assetsRoute;
} else {
  // Insérer la route d'assets au début
  vercelConfig.routes.unshift(assetsRoute);
}

// S'assurer que la route pour le SPA est à la fin
const spaRoute = { src: "/(.*)", dest: "/index.html" };
const existingSpaRouteIndex = vercelConfig.routes.findIndex(
  route => route.src === spaRoute.src
);

if (existingSpaRouteIndex >= 0) {
  // Supprimer la route existante
  vercelConfig.routes.splice(existingSpaRouteIndex, 1);
}
// Ajouter la route SPA à la fin
vercelConfig.routes.push(spaRoute);

// Sauvegarder les modifications
if (headersUpdated) {
  try {
    fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2), 'utf8');
    console.log('✅ Headers MIME configurés avec succès dans vercel.json');
  } catch (error) {
    console.error('❌ Erreur lors de l\'écriture du fichier vercel.json:', error);
    process.exit(1);
  }
} else {
  console.log('ℹ️ Aucune modification nécessaire aux headers MIME.');
}

console.log('📦 Configuration des headers terminée.');

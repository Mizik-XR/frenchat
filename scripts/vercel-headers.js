
/**
 * Ce script génère et vérifie la configuration correcte des types MIME
 * dans le fichier vercel.json pour éviter les erreurs de Content-Type
 * lors du déploiement sur Vercel.
 */

const fs = require('fs');
const path = require('path');

// Chemin vers le fichier vercel.json
const vercelConfigPath = path.join(process.cwd(), 'vercel.json');

console.log('Vérification de la configuration MIME dans vercel.json...');

try {
  // Vérifier si le fichier existe
  if (!fs.existsSync(vercelConfigPath)) {
    console.log('Le fichier vercel.json n\'existe pas. Création d\'un fichier de configuration de base...');
    
    // Créer un fichier de configuration de base
    const baseConfig = {
      "version": 2,
      "buildCommand": "npm run build",
      "outputDirectory": "dist",
      "routes": [
        { "src": "/assets/.*\\.(js|css|svg|png|jpg|jpeg|gif|ico)$", "headers": { "content-type": "application/javascript", "cache-control": "public, max-age=31536000, immutable" }, "continue": true },
        { "src": "/(.*\\.(js|css|svg|png|jpg|jpeg|gif|ico))$", "headers": { "cache-control": "public, max-age=31536000, immutable" }, "dest": "/$1" },
        { "src": "/api/(.*)", "dest": "/api/$1" },
        { "src": "/(.*)", "dest": "/index.html" }
      ],
      "headers": [
        {
          "source": "/(.*)\\.js$",
          "headers": [
            {
              "key": "Content-Type",
              "value": "application/javascript; charset=utf-8"
            }
          ]
        },
        {
          "source": "/(.*)\\.css$",
          "headers": [
            {
              "key": "Content-Type",
              "value": "text/css; charset=utf-8"
            }
          ]
        }
      ]
    };
    
    fs.writeFileSync(vercelConfigPath, JSON.stringify(baseConfig, null, 2));
    console.log('Fichier vercel.json créé avec succès.');
    process.exit(0);
  }

  // Lire le fichier existant
  const configContent = fs.readFileSync(vercelConfigPath, 'utf8');
  let config;

  try {
    config = JSON.parse(configContent);
  } catch (parseError) {
    console.error('Erreur lors de l\'analyse du fichier vercel.json:', parseError);
    process.exit(1);
  }

  let modified = false;

  // Vérifier et ajouter la section headers si elle n'existe pas
  if (!config.headers) {
    config.headers = [];
    modified = true;
  }

  // Vérifier les entrées pour JavaScript
  const jsHeaderEntry = config.headers.find(h => h.source === "/(.*)\\.js$");
  if (!jsHeaderEntry) {
    config.headers.push({
      "source": "/(.*)\\.js$",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/javascript; charset=utf-8"
        }
      ]
    });
    modified = true;
  }

  // Vérifier les entrées pour CSS
  const cssHeaderEntry = config.headers.find(h => h.source === "/(.*)\\.css$");
  if (!cssHeaderEntry) {
    config.headers.push({
      "source": "/(.*)\\.css$",
      "headers": [
        {
          "key": "Content-Type",
          "value": "text/css; charset=utf-8"
        }
      ]
    });
    modified = true;
  }

  // Vérifier les routes pour les assets
  if (!config.routes) {
    config.routes = [];
    modified = true;
  }

  const assetsRouteEntry = config.routes.find(r => r.src === "/assets/.*\\.(js|css|svg|png|jpg|jpeg|gif|ico)$");
  if (!assetsRouteEntry) {
    config.routes.unshift({ 
      "src": "/assets/.*\\.(js|css|svg|png|jpg|jpeg|gif|ico)$", 
      "headers": { 
        "content-type": "application/javascript", 
        "cache-control": "public, max-age=31536000, immutable" 
      }, 
      "continue": true 
    });
    modified = true;
  }

  // Enregistrer les modifications si nécessaire
  if (modified) {
    fs.writeFileSync(vercelConfigPath, JSON.stringify(config, null, 2));
    console.log('Configuration MIME mise à jour dans vercel.json.');
  } else {
    console.log('La configuration MIME est déjà correctement configurée.');
  }

  console.log('Vérification terminée avec succès.');
  process.exit(0);
} catch (error) {
  console.error('Erreur lors de la vérification/mise à jour de la configuration MIME:', error);
  process.exit(1);
}

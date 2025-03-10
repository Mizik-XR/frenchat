
/**
 * Script de correction des MIME types pour Vercel
 * Ce script vérifie et corrige les problèmes courants de MIME types
 * qui peuvent causer des erreurs de chargement JavaScript sur Vercel.
 */

const fs = require('fs');
const path = require('path');

// Couleurs pour les messages console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

console.log(`${colors.blue}=== Correction des MIME types pour Vercel ===${colors.reset}`);

// Vérifier si le dossier dist existe
const distPath = path.join(process.cwd(), 'dist');
if (!fs.existsSync(distPath)) {
  console.error(`${colors.red}[ERREUR] Le dossier dist n'existe pas. Exécutez d'abord 'npm run build'.${colors.reset}`);
  process.exit(1);
}

// Vérifier et corriger index.html
const indexPath = path.join(distPath, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error(`${colors.red}[ERREUR] Le fichier index.html n'existe pas dans le dossier dist.${colors.reset}`);
  process.exit(1);
}

// Lire index.html
let indexContent = fs.readFileSync(indexPath, 'utf8');
let modified = false;

// Vérifier si les scripts ont l'attribut type="module"
const scriptMatches = indexContent.match(/<script[^>]*src="[^"]*"[^>]*>/g) || [];
const scriptsWithoutType = scriptMatches.filter(script => !script.includes('type="module"') && !script.includes("type='module'"));

if (scriptsWithoutType.length > 0) {
  console.log(`${colors.yellow}[ATTENTION] ${scriptsWithoutType.length} balises script sans attribut type="module" détectées.${colors.reset}`);
  
  // Corriger les scripts
  scriptsWithoutType.forEach(scriptTag => {
    const fixed = scriptTag.replace(/<script/, '<script type="module"');
    indexContent = indexContent.replace(scriptTag, fixed);
  });
  
  modified = true;
  console.log(`${colors.green}[OK] Attribut type="module" ajouté aux balises script.${colors.reset}`);
}

// Vérifier les chemins absolus
if (indexContent.includes('src="/assets') || indexContent.includes('href="/assets')) {
  console.log(`${colors.yellow}[ATTENTION] Chemins absolus détectés dans index.html.${colors.reset}`);
  
  // Corriger les chemins
  indexContent = indexContent.replace(/src="\/assets/g, 'src="./assets');
  indexContent = indexContent.replace(/href="\/assets/g, 'href="./assets');
  
  modified = true;
  console.log(`${colors.green}[OK] Chemins absolus convertis en chemins relatifs.${colors.reset}`);
}

// Sauvegarder les modifications si nécessaire
if (modified) {
  fs.writeFileSync(indexPath, indexContent);
  console.log(`${colors.green}[OK] Les modifications ont été sauvegardées dans index.html.${colors.reset}`);
} else {
  console.log(`${colors.green}[OK] Aucun problème MIME détecté dans index.html.${colors.reset}`);
}

// Vérifier si vercel.json existe
const vercelJsonPath = path.join(process.cwd(), 'vercel.json');
if (!fs.existsSync(vercelJsonPath)) {
  console.log(`${colors.yellow}[ATTENTION] Le fichier vercel.json n'existe pas.${colors.reset}`);
  console.log(`${colors.yellow}[INFO] Création d'un fichier vercel.json avec les configurations MIME appropriées...${colors.reset}`);
  
  // Créer un vercel.json basique
  const vercelJson = {
    "version": 2,
    "routes": [
      { 
        "src": "/assets/(.*)\\.js", 
        "headers": { "Content-Type": "application/javascript; charset=utf-8" }, 
        "continue": true 
      },
      { 
        "src": "/(.*)\\.js", 
        "headers": { "Content-Type": "application/javascript; charset=utf-8" },
        "dest": "/$1.js" 
      }
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
      }
    ]
  };
  
  fs.writeFileSync(vercelJsonPath, JSON.stringify(vercelJson, null, 2));
  console.log(`${colors.green}[OK] Fichier vercel.json créé avec succès.${colors.reset}`);
} else {
  // Vérifier le contenu de vercel.json
  let vercelContent;
  try {
    vercelContent = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
  } catch (e) {
    console.error(`${colors.red}[ERREUR] Le fichier vercel.json n'est pas un JSON valide.${colors.reset}`);
    process.exit(1);
  }
  
  let vercelModified = false;
  
  // Vérifier si les headers pour JavaScript sont définis
  if (!vercelContent.headers) {
    vercelContent.headers = [];
    vercelModified = true;
  }
  
  const hasJsContentType = vercelContent.headers.some(header => 
    header.source && header.source.includes('.js') && 
    header.headers && header.headers.some(h => h.key === 'Content-Type' && h.value.includes('application/javascript'))
  );
  
  if (!hasJsContentType) {
    console.log(`${colors.yellow}[ATTENTION] Configuration MIME pour JavaScript manquante dans vercel.json.${colors.reset}`);
    
    vercelContent.headers.push({
      "source": "/(.*)\\.js$",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/javascript; charset=utf-8"
        }
      ]
    });
    
    vercelModified = true;
  }
  
  // Sauvegarder les modifications si nécessaire
  if (vercelModified) {
    fs.writeFileSync(vercelJsonPath, JSON.stringify(vercelContent, null, 2));
    console.log(`${colors.green}[OK] Le fichier vercel.json a été mis à jour avec les configurations MIME.${colors.reset}`);
  } else {
    console.log(`${colors.green}[OK] Le fichier vercel.json contient déjà les configurations MIME nécessaires.${colors.reset}`);
  }
}

console.log(`${colors.blue}=== Correction des MIME types terminée ===${colors.reset}`);
console.log(`${colors.green}[INFO] Votre projet est maintenant prêt pour le déploiement sur Vercel!${colors.reset}`);

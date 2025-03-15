
// Script de vérification pour les déploiements Vercel
console.log("===================================================");
console.log("     VÉRIFICATION DE DÉPLOIEMENT VERCEL");
console.log("===================================================");
console.log("");

// Vérification des variables d'environnement
console.log("[INFO] Variables d'environnement de build:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("VITE_ENVIRONMENT:", process.env.VITE_ENVIRONMENT);
console.log("VITE_CLOUD_MODE:", process.env.VITE_CLOUD_MODE);
console.log("VITE_ALLOW_LOCAL_AI:", process.env.VITE_ALLOW_LOCAL_AI);
console.log("");

// Vérification de la présence des fichiers essentiels
console.log("[INFO] Vérification des fichiers essentiels:");
const fs = require('fs');

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`[OK] ${description} présent`);
  } else {
    console.log(`[ATTENTION] ${description} manquant`);
  }
}

checkFile("vercel.json", "Fichier de configuration Vercel");
checkFile("dist/index.html", "Build généré");
checkFile("api/health.js", "API de vérification d'état");

console.log("===================================================");
console.log("     VERIFICATION TERMINÉE");
console.log("===================================================");
console.log("");

process.exit(0);

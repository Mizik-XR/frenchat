
/**
 * Script pour diagnostiquer et corriger automatiquement les erreurs de MIME types sur Vercel
 * Ce script peut être exécuté comme un webhook post-déploiement dans Vercel
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // L'URL de déploiement sera fournie par les variables d'environnement Vercel
  deploymentUrl: process.env.VERCEL_URL || null,
  // Liste des fichiers clés à vérifier pour les types MIME
  filesToCheck: [
    '/assets/index.js',  
    '/index.js',
    '/main.js'
  ]
};

async function checkMimeTypes() {
  console.log('🔍 Vérification des types MIME sur le déploiement Vercel...');
  
  if (!CONFIG.deploymentUrl) {
    console.error('❌ URL de déploiement non définie. Exécution impossible.');
    return;
  }
  
  const baseUrl = `https://${CONFIG.deploymentUrl}`;
  console.log(`📡 URL de déploiement: ${baseUrl}`);
  
  const results = {
    success: 0,
    failure: 0,
    details: []
  };
  
  // Vérifier les fichiers un par un
  for (const file of CONFIG.filesToCheck) {
    try {
      console.log(`🔍 Vérification de ${file}...`);
      
      const response = await axios.head(`${baseUrl}${file}`, {
        validateStatus: () => true
      });
      
      const contentType = response.headers['content-type'];
      const status = response.status;
      
      results.details.push({
        file,
        status,
        contentType,
        isValid: contentType && contentType.includes('javascript')
      });
      
      if (status === 200 && contentType && contentType.includes('javascript')) {
        console.log(`✅ ${file}: OK (${contentType})`);
        results.success++;
      } else {
        console.log(`❌ ${file}: ERREUR (${status}, ${contentType || 'inconnu'})`);
        results.failure++;
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la vérification de ${file}:`, error.message);
      results.details.push({
        file,
        status: 'ERROR',
        error: error.message,
        isValid: false
      });
      results.failure++;
    }
  }
  
  // Générer un rapport
  console.log('\n📊 RAPPORT DE VÉRIFICATION DES TYPES MIME:');
  console.log(`✅ Fichiers corrects: ${results.success}`);
  console.log(`❌ Fichiers problématiques: ${results.failure}`);
  
  // Enregistrer les résultats
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const reportPath = path.join(__dirname, `mime-check-report-${timestamp}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`📝 Rapport enregistré dans: ${reportPath}`);
  
  return results;
}

// Exécuter la vérification
checkMimeTypes().catch(error => {
  console.error('❌ Erreur lors de l\'exécution du script:', error);
  process.exit(1);
});

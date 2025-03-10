
// Verification script for Vercel deployments
const https = require('https');
const axios = require('axios');

console.log('===================================================');
console.log('     VÉRIFICATION DU DÉPLOIEMENT VERCEL');
console.log('===================================================');
console.log('');

// Get site URL from env variables or command line
const siteUrl = process.env.VITE_SITE_URL || process.argv[2] || 'https://filechat-app.vercel.app';

console.log(`Vérification du site : ${siteUrl}`);
console.log('');

// Create agent to avoid SSL issues
const agent = new https.Agent({
  rejectUnauthorized: false
});

/**
 * Check MIME types of JavaScript files
 */
async function checkMimeTypes() {
  console.log('[TEST 1/4] Vérification des types MIME...');
  
  try {
    // Check a JavaScript file
    const response = await axios.head(`${siteUrl}/assets/index.js`, {
      httpsAgent: agent,
      validateStatus: () => true,
    });
    
    const contentType = response.headers['content-type'];
    console.log(`Type de contenu détecté : ${contentType}`);
    
    if (contentType && contentType.includes('application/javascript')) {
      console.log('[OK] Les fichiers JavaScript ont le bon type MIME.');
      return true;
    } else {
      console.log('[AVERTISSEMENT] Type MIME incorrect pour JavaScript.');
      console.log('Le serveur a retourné : ' + contentType);
      return false;
    }
  } catch (error) {
    console.log('[ERREUR] Impossible de vérifier les types MIME :');
    console.log(error.message);
    return false;
  }
}

/**
 * Check if main page loads correctly
 */
async function checkMainPage() {
  console.log('[TEST 2/4] Vérification de la page principale...');
  
  try {
    const response = await axios.get(siteUrl, {
      httpsAgent: agent,
      validateStatus: () => true,
    });
    
    if (response.status === 200) {
      console.log(`[OK] Page principale chargée avec succès (${response.status}).`);
      return true;
    } else {
      console.log(`[ERREUR] Page principale non disponible (${response.status}).`);
      return false;
    }
  } catch (error) {
    console.log('[ERREUR] Impossible de charger la page principale :');
    console.log(error.message);
    return false;
  }
}

/**
 * Check API endpoints
 */
async function checkApi() {
  console.log('[TEST 3/4] Vérification des points de terminaison API...');
  
  try {
    const response = await axios.get(`${siteUrl}/api/health`, {
      httpsAgent: agent,
      validateStatus: () => true,
      timeout: 5000
    });
    
    if (response.status === 200) {
      console.log(`[OK] API health endpoint fonctionne (${response.status}).`);
      return true;
    } else {
      console.log(`[AVERTISSEMENT] API health endpoint non disponible (${response.status}).`);
      return false;
    }
  } catch (error) {
    console.log('[AVERTISSEMENT] API health endpoint non disponible :');
    console.log(error.message);
    return false;
  }
}

/**
 * Check for SPA routing
 */
async function checkSpaRouting() {
  console.log('[TEST 4/4] Vérification du routage SPA...');
  
  try {
    const response = await axios.get(`${siteUrl}/nonexistent-page-that-should-load-index`, {
      httpsAgent: agent,
      validateStatus: () => true,
    });
    
    if (response.status === 200) {
      console.log(`[OK] Routage SPA fonctionne correctement (${response.status}).`);
      return true;
    } else {
      console.log(`[ERREUR] Routage SPA défaillant (${response.status}).`);
      return false;
    }
  } catch (error) {
    console.log('[ERREUR] Vérification du routage SPA impossible :');
    console.log(error.message);
    return false;
  }
}

/**
 * Run all tests and provide summary
 */
async function runAllTests() {
  console.log('Exécution des tests de vérification...\n');
  
  const mimeResult = await checkMimeTypes();
  console.log('');
  
  const pageResult = await checkMainPage();
  console.log('');
  
  const apiResult = await checkApi();
  console.log('');
  
  const spaResult = await checkSpaRouting();
  console.log('');
  
  // Display summary
  console.log('===================================================');
  console.log('     RÉSULTATS DE LA VÉRIFICATION');
  console.log('===================================================');
  console.log('');
  
  console.log(`Types MIME : ${mimeResult ? '✅ OK' : '❌ Problème détecté'}`);
  console.log(`Page principale : ${pageResult ? '✅ OK' : '❌ Problème détecté'}`);
  console.log(`API Endpoints : ${apiResult ? '✅ OK' : '⚠️ Avertissement'}`);
  console.log(`Routage SPA : ${spaResult ? '✅ OK' : '❌ Problème détecté'}`);
  console.log('');
  
  const overallResult = (mimeResult && pageResult && spaResult);
  
  console.log(`Résultat global : ${overallResult ? '✅ DÉPLOIEMENT VALIDE' : '❌ PROBLÈMES DÉTECTÉS'}`);
  console.log('');
  
  if (!overallResult) {
    console.log('Recommandations :');
    if (!mimeResult) {
      console.log('- Exécutez scripts\\prepare-deployment.bat avant de déployer');
      console.log('- Vérifiez que vercel.json contient les configurations MIME correctes');
    }
    if (!pageResult) {
      console.log('- Vérifiez les logs de build dans l\'interface Vercel');
    }
    if (!spaResult) {
      console.log('- Vérifiez les routes dans vercel.json');
    }
  }
  
  console.log('');
  console.log('Pour déployer à nouveau, exécutez : scripts\\deploy-vercel.bat');
  console.log('');
}

// Run all tests
runAllTests();


import { supabase, APP_STATE } from "@/integrations/supabase/client";

/**
 * Fonction pour vérifier la connexion à Supabase
 * Utilisez cette fonction pour tester si votre application
 * est correctement connectée à Supabase
 */
export async function verifySupabaseConnection() {
  console.log("🔍 Vérification de la connexion Supabase...");
  
  const connectionDetails = {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || "(non définie)",
    isUrlDefined: !!import.meta.env.VITE_SUPABASE_URL,
    isAnonymousKeyDefined: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    isOfflineMode: APP_STATE.isOfflineMode,
    hasSupabaseError: APP_STATE.hasSupabaseError,
    environment: import.meta.env.VITE_ENVIRONMENT || "non défini",
    cloudMode: import.meta.env.VITE_CLOUD_MODE || "non défini"
  };
  
  console.log("📊 Détails de configuration:", connectionDetails);
  
  // Test de connexion à Supabase
  try {
    // Vérifier si le service est disponible
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error("❌ Erreur de connexion à Supabase:", error.message);
      return {
        connected: false,
        error: error.message,
        details: connectionDetails
      };
    }
    
    console.log("✅ Connexion à Supabase réussie!");
    
    // Vérifier la session de l'utilisateur actuel
    const { data: sessionData } = await supabase.auth.getSession();
    console.log("👤 Statut d'authentification:", sessionData.session ? "Connecté" : "Non connecté");
    
    return {
      connected: true,
      authenticated: !!sessionData.session,
      details: connectionDetails
    };
  } catch (err) {
    console.error("❌ Erreur lors de la vérification de connexion:", err);
    return {
      connected: false,
      error: err instanceof Error ? err.message : "Erreur inconnue",
      details: connectionDetails
    };
  }
}

/**
 * Fonction pour test complet de l'intégration Supabase-Netlify
 * Exécutez cette fonction dans la console du navigateur
 * pour obtenir un diagnostic détaillé
 */
export async function runNetlifySupabaseDiagnostic() {
  console.group("🔍 DIAGNOSTIC NETLIFY-SUPABASE");
  console.log("Démarrage du diagnostic...");
  
  // 1. Vérification des variables d'environnement
  console.group("1. Variables d'environnement");
  const envVars = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? "✅ Définie" : "❌ Non définie",
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? "✅ Définie" : "❌ Non définie",
    VITE_ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || "Non définie",
    VITE_CLOUD_MODE: import.meta.env.VITE_CLOUD_MODE || "Non définie",
    VITE_API_URL: import.meta.env.VITE_API_URL || "Non définie"
  };
  console.table(envVars);
  console.groupEnd();
  
  // 2. Test de connexion Supabase
  console.group("2. Test de connexion Supabase");
  const connectionResult = await verifySupabaseConnection();
  console.log("Résultat:", connectionResult.connected ? "✅ Connecté" : "❌ Non connecté");
  if (!connectionResult.connected && connectionResult.error) {
    console.error("Erreur:", connectionResult.error);
  }
  console.groupEnd();
  
  // 3. Vérification des fonctionnalités Supabase
  console.group("3. Vérification des fonctionnalités");
  
  try {
    // Test 1: Authentification
    console.log("Test d'authentification:");
    const { data: sessionData } = await supabase.auth.getSession();
    console.log(sessionData.session ? "✅ Session active" : "ℹ️ Aucune session (normal si non connecté)");
    
    // Test 2: Accès à une table
    console.log("Test d'accès à une table:");
    const { error: tableError } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    console.log(tableError ? `❌ Erreur: ${tableError.message}` : "✅ Accès aux tables OK");
    
    // Test 3: Fonctions Edge
    console.log("Test des fonctions Edge (si configurées):");
    try {
      const { data: funcData, error: funcError } = await supabase.functions.invoke('check-model-availability');
      console.log(funcError ? `❌ Erreur: ${funcError.message}` : "✅ Fonctions Edge accessibles");
    } catch (e) {
      console.log("ℹ️ Fonctions Edge non testées ou non configurées");
    }
  } catch (err) {
    console.error("Erreur lors des tests:", err);
  }
  
  console.groupEnd();
  
  // 4. Recommandations
  console.group("4. Recommandations");
  
  const recommendations = [];
  
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    recommendations.push("⚠️ Configurez les variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans l'interface Netlify (Site Settings > Environment variables)");
  }
  
  if (!connectionResult.connected) {
    recommendations.push("⚠️ Vérifiez que votre projet Supabase est actif et accessible");
    recommendations.push("⚠️ Vérifiez que les clés API sont correctes");
  }
  
  if (recommendations.length > 0) {
    console.log("Recommandations:");
    recommendations.forEach(rec => console.log(rec));
  } else {
    console.log("✅ Tout semble correctement configuré!");
  }
  
  console.groupEnd();
  
  console.log("Diagnostic terminé!");
  console.groupEnd();
  
  return {
    envVars,
    connectionResult,
    recommendations
  };
}

// Instructions pour exécuter dans la console
console.log(`
✨ Pour vérifier la connexion Supabase sur ce site Netlify, exécutez:
   runNetlifySupabaseDiagnostic()
dans la console du navigateur (F12 > Console)
`);

// Ajouter la fonction au scope global pour faciliter l'exécution depuis la console
if (typeof window !== 'undefined') {
  (window as any).runNetlifySupabaseDiagnostic = runNetlifySupabaseDiagnostic;
  (window as any).verifySupabaseConnection = verifySupabaseConnection;
}

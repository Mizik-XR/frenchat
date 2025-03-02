
/**
 * Utilitaires de diagnostic pour résoudre les problèmes courants
 */

/**
 * Vérifie la configuration Supabase et tente de diagnostiquer les problèmes
 * @returns Résultat du diagnostic
 */
export const diagnoseSupabaseConfig = async () => {
  try {
    console.log("Démarrage du diagnostic Supabase...");
    
    // Vérifier les variables d'environnement
    const supabaseUrl = "https://dbdueopvtlanxgumenpu.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiZHVlb3B2dGxhbnhndW1lbnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NzQ0NTIsImV4cCI6MjA1NTU1MDQ1Mn0.lPPbNJANU8Zc7i5OB9_atgDZ84Yp5SBjXCiIqjA79Tk";
    
    const configStatus = {
      supabaseUrl: supabaseUrl ? "OK" : "Manquant",
      supabaseKey: supabaseKey ? "OK" : "Manquant",
      envFilesFound: [] as string[]
    };
    
    // Vérifier si la clé est vide ou incorrecte
    if (supabaseKey && supabaseKey.length < 10) {
      configStatus.supabaseKey = "Invalide (trop court)";
    }
    
    // Tester l'objet window
    const windowAvailable = typeof window !== 'undefined';
    
    // Tester l'initialisation du client Supabase
    let clientTest = { success: false, error: null as string | null };
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      clientTest.success = !!supabase;
      if (!supabase) {
        clientTest.error = "Client Supabase non initialisé";
      }
    } catch (error: any) {
      clientTest.error = error?.message || "Erreur inconnue";
    }
    
    // Tester une requête simple
    let requestTest = { success: false, error: null as string | null };
    if (clientTest.success) {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase.from('service_configurations').select('count').limit(1);
        requestTest.success = !error;
        if (error) {
          requestTest.error = error.message;
        }
      } catch (error: any) {
        requestTest.error = error?.message || "Erreur inconnue";
      }
    }
    
    return {
      timestamp: new Date().toISOString(),
      configStatus,
      windowAvailable,
      clientTest,
      requestTest,
      browserInfo: windowAvailable ? {
        userAgent: window.navigator.userAgent,
        platform: window.navigator.platform,
        language: window.navigator.language,
        cookiesEnabled: window.navigator.cookieEnabled,
        localStorage: !!window.localStorage
      } : null
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Erreur inconnue lors du diagnostic"
    };
  }
};

/**
 * Exécute un diagnostic complet de l'environnement
 */
export const runFullDiagnostic = async () => {
  console.log("Exécution du diagnostic complet...");
  
  try {
    // Récupérer diverses informations de diagnostic
    const diagnostics = {
      timestamp: new Date().toISOString(),
      runtimeEnvironment: {
        frontend: typeof window !== 'undefined' ? "Browser" : "Node.js",
        isDevelopment: import.meta.env.DEV,
        isProduction: import.meta.env.PROD,
        mode: import.meta.env.MODE,
        baseUrl: import.meta.env.BASE_URL,
      },
      supabaseCheck: await diagnoseSupabaseConfig(),
      networkTest: { success: false, error: null as string | null },
      components: {
        rootElement: typeof document !== 'undefined' ? !!document.getElementById('root') : false,
      }
    };
    
    // Tester la connectivité réseau
    if (typeof window !== 'undefined') {
      try {
        const response = await fetch('https://dbdueopvtlanxgumenpu.supabase.co');
        diagnostics.networkTest.success = response.ok;
      } catch (error: any) {
        diagnostics.networkTest.success = false;
        diagnostics.networkTest.error = error?.message || "Erreur de connexion réseau";
      }
    }
    
    console.log("Résultat du diagnostic complet:", diagnostics);
    return diagnostics;
  } catch (error: any) {
    console.error("Erreur lors du diagnostic complet:", error);
    return {
      success: false,
      error: error?.message || "Erreur inconnue lors du diagnostic"
    };
  }
};

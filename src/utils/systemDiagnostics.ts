
/**
 * Utilitaires pour les diagnostics système et vérifications de connexion
 */
import { diagnoseSupabaseConfig, runFullDiagnostic } from './diagnosticUtil';
import { isLocalDevelopment } from '@/services/apiConfig';
import { supabase, APP_STATE } from '@/integrations/supabase/client';
import { detectLocalAIService } from '@/integrations/supabase/aiServiceDetector';
import { toast } from '@/hooks/use-toast';

export interface SystemTestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
  timestamp: string;
}

/**
 * Vérifie le système complet et génère un rapport
 */
export const runSystemCheck = async (): Promise<SystemTestResult[]> => {
  const results: SystemTestResult[] = [];
  const timestamp = new Date().toISOString();
  
  try {
    // 1. Vérification de la connexion internet
    let isOnline = navigator.onLine;
    results.push({
      name: 'Connexion Internet',
      status: isOnline ? 'success' : 'error',
      message: isOnline ? 'Connecté à Internet' : 'Pas de connexion Internet',
      timestamp
    });
    
    // 2. Vérification de la connexion Supabase
    try {
      if (!APP_STATE.isOfflineMode) {
        const { data, error } = await supabase.from('service_configurations').select('count').limit(1);
        results.push({
          name: 'Connexion Supabase',
          status: error ? 'error' : 'success',
          message: error ? `Erreur de connexion: ${error.message}` : 'Connecté à Supabase',
          details: error,
          timestamp
        });
      } else {
        results.push({
          name: 'Connexion Supabase',
          status: 'warning',
          message: 'Mode hors ligne activé, connexion Supabase non testée',
          timestamp
        });
      }
    } catch (e) {
      results.push({
        name: 'Connexion Supabase',
        status: 'error', 
        message: `Erreur inattendue: ${e instanceof Error ? e.message : String(e)}`,
        details: e,
        timestamp
      });
    }
    
    // 3. Détection du service IA local
    try {
      const aiService = await detectLocalAIService();
      results.push({
        name: 'Service IA Local',
        status: aiService.available ? 'success' : 'warning',
        message: aiService.available 
          ? `Service IA local détecté: ${aiService.url || 'URL non spécifiée'}`
          : 'Service IA local non détecté, mode cloud sera utilisé',
        details: aiService,
        timestamp
      });
    } catch (e) {
      results.push({
        name: 'Service IA Local',
        status: 'error',
        message: `Erreur lors de la détection: ${e instanceof Error ? e.message : String(e)}`,
        details: e,
        timestamp
      });
    }
    
    // 4. Vérification de l'authentification
    try {
      const { data: session } = await supabase.auth.getSession();
      const isAuthenticated = !!session.session;
      results.push({
        name: 'Authentification',
        status: isAuthenticated ? 'success' : 'warning',
        message: isAuthenticated ? 'Utilisateur authentifié' : 'Aucun utilisateur authentifié',
        details: {
          userId: session.session?.user.id,
          expiresAt: session.session?.expires_at
        },
        timestamp
      });
    } catch (e) {
      results.push({
        name: 'Authentification',
        status: 'error',
        message: `Erreur d'authentification: ${e instanceof Error ? e.message : String(e)}`,
        details: e,
        timestamp
      });
    }
    
    // 5. Vérification de l'intégration Google Drive (si l'utilisateur est authentifié)
    try {
      const { data: session } = await supabase.auth.getSession();
      if (session.session) {
        const { data: googleTokens, error } = await supabase
          .from('oauth_tokens')
          .select('*')
          .eq('user_id', session.session.user.id)
          .eq('provider', 'google')
          .maybeSingle();
        
        results.push({
          name: 'Intégration Google Drive',
          status: googleTokens ? 'success' : 'warning',
          message: googleTokens 
            ? 'Connecté à Google Drive' 
            : 'Google Drive non configuré',
          details: error ? { error: error.message } : { tokenExists: !!googleTokens },
          timestamp
        });
      } else {
        results.push({
          name: 'Intégration Google Drive',
          status: 'warning',
          message: 'Non vérifié (utilisateur non authentifié)',
          timestamp
        });
      }
    } catch (e) {
      results.push({
        name: 'Intégration Google Drive',
        status: 'error',
        message: `Erreur lors de la vérification Google Drive: ${e instanceof Error ? e.message : String(e)}`,
        details: e,
        timestamp
      });
    }
    
    // 6. Test d'indexation des documents (limité à la vérification des tables)
    try {
      const { data: indexingConfig, error } = await supabase
        .from('indexing_progress')
        .select('count')
        .limit(1);
      
      results.push({
        name: 'Système d\'indexation',
        status: error ? 'error' : 'success',
        message: error 
          ? `Erreur de connexion au système d'indexation: ${error.message}` 
          : 'Système d\'indexation accessible',
        details: { error },
        timestamp
      });
    } catch (e) {
      results.push({
        name: 'Système d\'indexation',
        status: 'error',
        message: `Erreur lors de la vérification du système d'indexation: ${e instanceof Error ? e.message : String(e)}`,
        details: e,
        timestamp
      });
    }
    
    // 7. Vérification du système de cache
    try {
      // Vérifier si la table de cache est accessible
      const { data: cache, error } = await supabase
        .from('response_cache')
        .select('count')
        .limit(1);
      
      results.push({
        name: 'Système de cache',
        status: error ? 'error' : 'success',
        message: error 
          ? `Erreur d'accès au cache: ${error.message}` 
          : 'Système de cache accessible',
        details: { error },
        timestamp
      });
    } catch (e) {
      results.push({
        name: 'Système de cache',
        status: 'error',
        message: `Erreur lors de la vérification du cache: ${e instanceof Error ? e.message : String(e)}`,
        details: e,
        timestamp
      });
    }
    
    // 8. Vérification des configurations RLS
    try {
      // Pour l'utilisateur actuel, essayer d'accéder à des données qui devraient être restreintes
      const { data: session } = await supabase.auth.getSession();
      if (session.session) {
        // Test RLS - Essayer d'accéder à une entrée de cache d'un autre utilisateur
        // Une erreur ici est attendue si RLS fonctionne correctement
        const { data: rlsTest, error } = await supabase
          .from('response_cache')
          .select('*')
          .neq('user_id', session.session.user.id)
          .not('user_id', 'is', null)
          .limit(1);
        
        // Si nous n'avons pas d'erreur mais des données d'autres utilisateurs, RLS ne fonctionne pas
        const rlsStatus = rlsTest && rlsTest.length > 0 ? 'error' : 'success';
        
        results.push({
          name: 'Politiques RLS',
          status: rlsStatus,
          message: rlsStatus === 'success' 
            ? 'Les politiques RLS sont efficaces' 
            : 'ALERTE: Les politiques RLS ne semblent pas fonctionner correctement',
          details: { 
            leakedRecords: rlsTest ? rlsTest.length : 0,
            expectedBehavior: 'Aucune donnée d\'autres utilisateurs ne devrait être accessible'
          },
          timestamp
        });
      } else {
        results.push({
          name: 'Politiques RLS',
          status: 'warning',
          message: 'Non vérifié (utilisateur non authentifié)',
          timestamp
        });
      }
    } catch (e) {
      // Si nous avons une erreur d'autorisation ici, c'est bon signe pour RLS
      const isAuthError = e instanceof Error && 
        (e.message.includes('permission denied') || e.message.includes('not authorized'));
      
      results.push({
        name: 'Politiques RLS',
        status: isAuthError ? 'success' : 'error',
        message: isAuthError 
          ? 'Les politiques RLS sont efficaces (erreur d\'autorisation attendue)' 
          : `Erreur inattendue lors de la vérification RLS: ${e instanceof Error ? e.message : String(e)}`,
        details: e,
        timestamp
      });
    }
  } catch (e) {
    // Erreur générale - ajouter au rapport
    results.push({
      name: 'Diagnostic général',
      status: 'error',
      message: `Erreur lors de l'exécution des diagnostics: ${e instanceof Error ? e.message : String(e)}`,
      details: e,
      timestamp
    });
  }
  
  return results;
};

/**
 * Vérifie les URLs et redirections importantes de l'application
 */
export const checkCriticalUrls = async (): Promise<Record<string, boolean>> => {
  const criticalUrls = [
    '/auth',
    '/chat',
    '/config',
    '/documents'
  ];
  
  const results: Record<string, boolean> = {};
  
  for (const url of criticalUrls) {
    try {
      // Vérifier si l'URL est accessible
      const fullUrl = window.location.origin + url;
      const response = await fetch(fullUrl, { 
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store'
      });
      results[url] = true;
    } catch (e) {
      console.error(`Erreur lors de la vérification de l'URL ${url}:`, e);
      results[url] = false;
    }
  }
  
  // Vérifier l'URL Supabase
  try {
    const supabaseUrl = "https://dbdueopvtlanxgumenpu.supabase.co/dashboard/project/dbdueopvtlanxgumenpu";
    const response = await fetch(supabaseUrl, { 
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store'
    });
    results['supabase_console'] = true;
  } catch (e) {
    console.error("Erreur lors de la vérification de l'URL Supabase:", e);
    results['supabase_console'] = false;
  }
  
  return results;
};

/**
 * Vérifie le service d'IA local
 */
export const testLocalAIService = async (): Promise<SystemTestResult> => {
  const timestamp = new Date().toISOString();
  
  try {
    const service = await detectLocalAIService();
    if (!service.available || !service.url) {
      return {
        name: 'Service IA Local',
        status: 'warning',
        message: 'Service IA local non disponible',
        details: service,
        timestamp
      };
    }
    
    // Tester la connexion au service local
    const endpoint = `${service.url}/health`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      return {
        name: 'Service IA Local',
        status: 'success',
        message: `Service IA local fonctionnel: ${service.url}`,
        details: { 
          provider: service.provider,
          responseStatus: response.status,
          endpoint
        },
        timestamp
      };
    } else {
      return {
        name: 'Service IA Local',
        status: 'error',
        message: `Le service répond avec une erreur: ${response.status}`,
        details: { 
          status: response.status,
          statusText: response.statusText,
          endpoint
        },
        timestamp
      };
    }
  } catch (e) {
    return {
      name: 'Service IA Local',
      status: 'error',
      message: `Erreur lors du test du service IA local: ${e instanceof Error ? e.message : String(e)}`,
      details: e,
      timestamp
    };
  }
};

/**
 * Vérifie l'état de Supabase et les connexions de base de données
 */
export const testSupabaseConnections = async (): Promise<SystemTestResult[]> => {
  const results: SystemTestResult[] = [];
  const timestamp = new Date().toISOString();
  
  try {
    // Test de base: vérifier l'état global de supabase
    let isSupabaseConnected = false;
    
    try {
      const { data } = await supabase.from('profiles').select('count').limit(1);
      isSupabaseConnected = true;
      
      results.push({
        name: 'Connexion Supabase principale',
        status: 'success',
        message: 'Connexion à Supabase établie',
        timestamp
      });
    } catch (e) {
      results.push({
        name: 'Connexion Supabase principale',
        status: 'error',
        message: `Erreur de connexion à Supabase: ${e instanceof Error ? e.message : String(e)}`,
        details: e,
        timestamp
      });
    }
    
    // Test RLS et politiques
    if (isSupabaseConnected) {
      try {
        const { data: session } = await supabase.auth.getSession();
        
        if (session.session) {
          // Test d'accès à profil personnel (devrait réussir)
          const { data: myProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.session.user.id)
            .single();
          
          results.push({
            name: 'RLS - Accès au profil personnel',
            status: profileError ? 'error' : 'success',
            message: profileError 
              ? `Erreur d'accès: ${profileError.message}` 
              : 'Accès au profil personnel réussi',
            details: profileError,
            timestamp
          });
          
          // Test d'accès aux entrées de cache personnelles (devrait réussir)
          const { data: myCacheEntries, error: cacheError } = await supabase
            .from('response_cache')
            .select('count')
            .eq('user_id', session.session.user.id)
            .limit(1);
          
          results.push({
            name: 'RLS - Accès aux entrées de cache personnelles',
            status: cacheError ? 'error' : 'success',
            message: cacheError 
              ? `Erreur d'accès: ${cacheError.message}` 
              : 'Accès aux entrées de cache personnelles réussi',
            details: cacheError,
            timestamp
          });
        } else {
          results.push({
            name: 'Tests RLS',
            status: 'warning',
            message: 'Impossible de tester RLS: aucun utilisateur authentifié',
            timestamp
          });
        }
      } catch (e) {
        results.push({
          name: 'Tests RLS',
          status: 'error',
          message: `Erreur lors des tests RLS: ${e instanceof Error ? e.message : String(e)}`,
          details: e,
          timestamp
        });
      }
    }
    
    // Test de diagnostic complet Supabase
    try {
      const supabaseDiag = await diagnoseSupabaseConfig();
      
      results.push({
        name: 'Diagnostic Supabase approfondi',
        status: supabaseDiag.clientTest?.success ? 'success' : 'error',
        message: supabaseDiag.clientTest?.success 
          ? 'Client Supabase correctement initialisé' 
          : `Erreur d'initialisation: ${supabaseDiag.clientTest?.error}`,
        details: supabaseDiag,
        timestamp
      });
    } catch (e) {
      results.push({
        name: 'Diagnostic Supabase approfondi',
        status: 'error',
        message: `Erreur de diagnostic: ${e instanceof Error ? e.message : String(e)}`,
        details: e,
        timestamp
      });
    }
  } catch (e) {
    results.push({
      name: 'Test Supabase',
      status: 'error',
      message: `Erreur globale: ${e instanceof Error ? e.message : String(e)}`,
      details: e,
      timestamp
    });
  }
  
  return results;
};

/**
 * Exécute un diagnostic complet avec retour d'informations à l'utilisateur
 */
export const runUserFriendlyDiagnostic = async () => {
  toast({
    title: "Diagnostic en cours...",
    description: "Vérification des connexions système et des services"
  });
  
  try {
    const results = await runSystemCheck();
    
    // Compter les erreurs et avertissements
    const errors = results.filter(r => r.status === 'error').length;
    const warnings = results.filter(r => r.status === 'warning').length;
    const successes = results.filter(r => r.status === 'success').length;
    
    if (errors > 0) {
      toast({
        title: `Diagnostic terminé - ${errors} problème(s) détecté(s)`,
        description: `${successes} tests réussis, ${warnings} avertissements, ${errors} erreurs. Consultez la console pour plus de détails.`,
        variant: "destructive"
      });
    } else if (warnings > 0) {
      toast({
        title: "Diagnostic terminé - Avertissements",
        description: `${successes} tests réussis, ${warnings} avertissements. Consultez la console pour plus de détails.`,
        variant: "warning"
      });
    } else {
      toast({
        title: "Diagnostic terminé - Tout est OK",
        description: `${successes} tests réussis. Tous les systèmes fonctionnent correctement.`,
        variant: "default"
      });
    }
    
    // Afficher les résultats détaillés dans la console
    console.group("Résultats du diagnostic système");
    results.forEach(result => {
      const logMethod = result.status === 'error' 
        ? console.error 
        : (result.status === 'warning' ? console.warn : console.log);
      
      logMethod(`[${result.status.toUpperCase()}] ${result.name}: ${result.message}`, 
        result.details ? result.details : '');
    });
    console.groupEnd();
    
    return results;
  } catch (e) {
    toast({
      title: "Erreur lors du diagnostic",
      description: `Une erreur est survenue: ${e instanceof Error ? e.message : String(e)}`,
      variant: "destructive"
    });
    console.error("Erreur lors du diagnostic système:", e);
    return [];
  }
};

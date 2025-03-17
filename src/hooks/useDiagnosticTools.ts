
import { useEffect, useState } from 'react';
import { supabase, APP_STATE } from '@/integrations/supabase/client';

export interface DiagnosticResults {
  supabaseConnected: boolean;
  localServerConnected: boolean;
  networkConnected: boolean;
  errors: string[];
  details: Record<string, any>;
}

export function useDiagnosticTools() {
  const [results, setResults] = useState<DiagnosticResults>({
    supabaseConnected: false,
    localServerConnected: false,
    networkConnected: navigator.onLine,
    errors: [],
    details: {}
  });
  
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const errors: string[] = [];
    const details: Record<string, any> = {};
    
    // Vérifier la connexion réseau
    const isNetworkConnected = navigator.onLine;
    if (!isNetworkConnected) {
      errors.push("Aucune connexion réseau détectée");
    }
    details.network = { connected: isNetworkConnected };
    
    // Vérifier la connexion Supabase
    let isSupabaseConnected = false;
    try {
      if (!supabase) {
        throw new Error("Client Supabase non initialisé");
      }
      
      const { error } = await supabase.from('profiles').select('count').limit(1).maybeSingle();
      isSupabaseConnected = !error;
      
      if (error) {
        errors.push(`Erreur de connexion Supabase: ${error.message}`);
        details.supabase = { error: error.message };
      } else {
        details.supabase = { connected: true };
      }
    } catch (error) {
      isSupabaseConnected = false;
      errors.push(`Erreur de connexion Supabase: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      details.supabase = { error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
    
    // Vérifier la connexion au serveur local
    let isLocalServerConnected = false;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      try {
        const response = await fetch('http://localhost:8000/health', {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        isLocalServerConnected = response.ok;
        
        if (!response.ok) {
          errors.push(`Serveur local non disponible: ${response.status} ${response.statusText}`);
          details.localServer = { status: response.status, statusText: response.statusText };
        } else {
          details.localServer = { connected: true };
        }
      } catch (error) {
        clearTimeout(timeoutId);
        isLocalServerConnected = false;
        errors.push(`Erreur de connexion au serveur local: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        details.localServer = { error: error instanceof Error ? error.message : 'Erreur inconnue' };
      }
    } catch (error) {
      isLocalServerConnected = false;
      errors.push(`Erreur lors du test du serveur local: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      details.localServer = { error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
    
    // Récupérer les informations sur l'application
    details.appState = {
      isOfflineMode: APP_STATE.isOfflineMode,
      hasErrors: APP_STATE.supbaseErrors.length > 0,
      lastError: APP_STATE.lastError ? APP_STATE.lastError.message : null
    };
    
    // Mettre à jour les résultats
    setResults({
      supabaseConnected: isSupabaseConnected,
      localServerConnected: isLocalServerConnected,
      networkConnected: isNetworkConnected,
      errors,
      details
    });
    
    setIsRunning(false);
    
    return {
      supabaseConnected: isSupabaseConnected,
      localServerConnected: isLocalServerConnected,
      networkConnected: isNetworkConnected,
      errors,
      details
    };
  };

  // Exécuter un diagnostic initial au chargement
  useEffect(() => {
    runDiagnostics();
  }, []);

  return {
    results,
    runDiagnostics,
    isRunning
  };
}

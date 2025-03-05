
import React from 'react';
import { toast } from '@/hooks/use-toast';
import { preloadSession } from '@/integrations/supabase/client';

/**
 * Vérification des dépendances React
 */
export const checkReactDependencies = (): boolean => {
  if (typeof React === 'undefined') {
    console.warn("React n'est pas défini globalement - c'est normal avec les imports ES modules");
    return false;
  }
  return true;
};

/**
 * Configuration explicite du DOM React
 */
export const setupReactDOM = (): void => {
  try {
    // Cette technique n'est pas idéale mais peut aider dans certains cas
    if (window.React === undefined) {
      console.log("React n'est pas disponible globalement, cela peut causer des problèmes dans certains environnements");
    }
  } catch (e) {
    console.warn("Erreur lors de la vérification de React:", e);
  }
};

/**
 * Préchargement de la session Supabase
 */
export const preloadSupabaseSession = async (fallbackMode: boolean): Promise<boolean> => {
  if (fallbackMode) {
    console.log("Mode de secours activé - certaines vérifications sont ignorées");
    return true;
  }
  
  const supabaseUrl = "https://dbdueopvtlanxgumenpu.supabase.co";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiZHVlb3B2dGxhbnhndW1lbnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NzQ0NTIsImV4cCI6MjA1NTU1MDQ1Mn0.lPPbNJANU8Zc7i5OB9_atgDZ84Yp5SBjXCiIqjA79Tk";
  
  console.log("Vérification des paramètres Supabase:", {
    url: supabaseUrl ? "Définie" : "Non définie",
    key: supabaseKey ? "Définie" : "Non définie"
  });
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Les paramètres Supabase sont manquants");
  }
  
  try {
    await preloadSession();
    console.log("Session Supabase préchargée avec succès");
    return true;
  } catch (err: any) {
    console.warn("Erreur non bloquante lors du préchargement de la session:", err);
    // Notifier l'utilisateur uniquement si l'erreur est critique
    if (err?.message?.includes('network') || err?.message?.includes('fetch')) {
      toast({
        title: "Problème de connexion",
        description: "Vérifiez votre connexion Internet ou réessayez plus tard.",
        variant: "destructive"
      });
    }
    return false;
  }
};

/**
 * Configuration des écouteurs d'événements réseau
 */
export const setupNetworkListeners = (): void => {
  window.addEventListener('online', () => {
    toast({
      title: "Connexion rétablie",
      description: "Votre connexion Internet a été rétablie."
    });
  });
  
  window.addEventListener('offline', () => {
    toast({
      title: "Connexion perdue",
      description: "Votre connexion Internet semble interrompue.",
      variant: "destructive"
    });
  });
};

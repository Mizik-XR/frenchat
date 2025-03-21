
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { preloadSession } from '@/hooks/auth/sessionUtils';
import { initLocalAIClient } from '@/hooks/ai/environment/apiClients';
import { checkLLMAvailability } from '@/hooks/ai/environment/availabilityChecker';
import { toast } from '@/hooks/use-toast';
import initLovableIntegration from '@/utils/lovable/lovableIntegration';

export const setupAppEnvironment = async () => {
  console.log('Starting application setup...');
  
  // 1. Vérifier la connexion à Supabase
  await checkSupabaseConnection();
  
  // 2. Précharger la session utilisateur si disponible
  await preloadSession();
  
  // 3. Initialiser le client d'IA locale
  initLocalAIClient();
  
  // 4. Vérifier la disponibilité de l'IA locale
  await checkLocalLLM();
  
  // 5. Initialiser l'intégration Lovable si nécessaire
  setupLovableIntegration();
  
  console.log('Application setup complete');
  
  return true;
};

async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('settings').select('key').limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      toast({
        title: "Problème de connexion au serveur",
        description: "Certaines fonctionnalités peuvent être limitées en mode hors-ligne.",
        variant: "destructive",
      });
      return false;
    }
    
    console.log('Supabase connection: OK');
    return true;
  } catch (err) {
    console.error('Unable to check Supabase connection:', err);
    toast({
      title: "Problème de connexion au serveur",
      description: "Mode hors-ligne activé.",
      variant: "destructive",
    });
    return false;
  }
}

async function checkLocalLLM() {
  try {
    const isAvailable = await checkLLMAvailability();
    
    if (isAvailable) {
      console.log('Local LLM: Available');
      toast({
        title: "IA locale détectée",
        description: "Le mode local est disponible pour plus de confidentialité.",
      });
    } else {
      console.log('Local LLM: Not available');
    }
    
    return isAvailable;
  } catch (err) {
    console.error('Error checking local LLM:', err);
    toast({
      title: "IA locale non disponible",
      description: "Basculement vers le mode cloud activé automatiquement.",
      variant: "default",
    });
    return false;
  }
}

export const setupLovableIntegration = () => {
  if (process.env.NODE_ENV === 'development' || window.location.hostname.includes('lovable.app')) {
    try {
      const isLovableEnvironment = initLovableIntegration();
      if (isLovableEnvironment) {
        console.log('Lovable integration initialized successfully');
      }
    } catch (error) {
      console.error('Error initializing Lovable integration:', error);
      toast({
        title: "Problème d'initialisation Lovable",
        description: "Certaines fonctionnalités d'édition peuvent être limitées.",
        variant: "default",
      });
    }
  }
};

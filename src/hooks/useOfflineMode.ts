
/**
 * Hook personnalisé pour gérer le mode hors ligne de l'application
 * 
 * Ce hook fournit une interface pour lire et modifier l'état du mode hors ligne
 * ainsi que pour réagir aux changements de cet état.
 */

import { useState, useEffect, useCallback } from 'react';
import { APP_STATE } from '@/compatibility/supabaseCompat';
import { toast } from '@/hooks/use-toast';
import { isLovableEnvironment } from '@/utils/environment';
import { getLovableEnvironmentPreferences, setLovableEnvironmentPreferences } from '@/utils/environment/cloudModeUtils';

export function useOfflineMode() {
  // État local du mode hors ligne, initialisé avec la valeur actuelle
  const [isOffline, setIsOffline] = useState(APP_STATE.isOfflineMode);
  
  // État local des préférences Lovable
  const [lovablePreferences, setLovablePreferencesState] = useState(() => 
    getLovableEnvironmentPreferences()
  );
  
  // Synchroniser l'état local avec APP_STATE lors du montage du composant
  useEffect(() => {
    setIsOffline(APP_STATE.isOfflineMode);
    
    // Écouter les changements de mode hors ligne dans localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'OFFLINE_MODE') {
        setIsOffline(e.newValue === 'true');
      } else if (e.key === 'ENABLE_SUPABASE_IN_LOVABLE' || e.key === 'ENABLE_LOCAL_AI_IN_LOVABLE') {
        setLovablePreferencesState(getLovableEnvironmentPreferences());
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Méthode pour activer ou désactiver le mode hors ligne
  const setOfflineMode = useCallback((enable: boolean) => {
    APP_STATE.setOfflineMode(enable);
    setIsOffline(enable);
    
    // Notification à l'utilisateur
    toast({
      title: enable ? 'Mode hors ligne activé' : 'Mode hors ligne désactivé',
      description: enable 
        ? 'L\'application fonctionnera sans connexion à Supabase.' 
        : 'L\'application tentera de se connecter à Supabase.',
      variant: enable ? 'destructive' : 'default'
    });
  }, []);
  
  // Méthode pour basculer entre les modes
  const toggleOfflineMode = useCallback(() => {
    const newState = !isOffline;
    setOfflineMode(newState);
    return newState;
  }, [isOffline, setOfflineMode]);
  
  // Méthode pour mettre à jour les préférences d'environnement Lovable
  const setLovablePreferences = useCallback((enableSupabase: boolean, enableLocalAI: boolean) => {
    setLovableEnvironmentPreferences(enableSupabase, enableLocalAI);
    setLovablePreferencesState({ enableSupabase, enableLocalAI });
    
    // Si nous activons Supabase, désactiver le mode hors ligne
    if (enableSupabase) {
      setOfflineMode(false);
    }
  }, [setOfflineMode]);
  
  // Déterminer si l'environnement actuel est Lovable
  const isLovable = isLovableEnvironment();
  
  return {
    isOffline,
    setOfflineMode,
    toggleOfflineMode,
    isLovableEnvironment: isLovable,
    lovablePreferences,
    setLovablePreferences
  };
}

export default useOfflineMode;

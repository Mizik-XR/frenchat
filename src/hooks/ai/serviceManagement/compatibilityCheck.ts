
import { toast } from '@/hooks/use-toast';
import { checkBrowserCompatibility } from '../analyzers/browserCompatibility';

/**
 * Vérifie la compatibilité du navigateur et configure le mode approprié
 * @param isCloudModeForced Indique si le mode cloud est forcé
 * @param setServiceType Fonction pour mettre à jour le type de service
 */
export function checkBrowserCompatibilityAndSetMode(
  isCloudModeForced: boolean,
  setServiceType: (type: 'local' | 'cloud' | 'hybrid') => void
): void {
  if (isCloudModeForced) return;
  
  try {
    const browserCompatibility = checkBrowserCompatibility();
    
    if (browserCompatibility.shouldFallbackToCloud) {
      setServiceType('cloud');
      localStorage.setItem('aiServiceType', 'cloud');
      
      // Notification uniquement en mode développement ou debug
      if (import.meta.env.DEV || window.location.search.includes('debug=true')) {
        toast({
          title: "Compatibilité navigateur",
          description: `Mode cloud automatiquement activé - votre navigateur ne supporte pas l'IA locale`,
          variant: "default"
        });
      }
    }
  } catch (error) {
    console.warn("Erreur lors de la vérification de compatibilité:", error);
    setServiceType('cloud');
    localStorage.setItem('aiServiceType', 'cloud');
  }
}

/**
 * Vérifie que le mode par défaut est configuré
 * @param setServiceType Fonction pour mettre à jour le type de service
 */
export function ensureDefaultServiceModeSet(
  setServiceType: (type: 'local' | 'cloud' | 'hybrid') => void
): void {
  if (!localStorage.getItem('aiServiceType')) {
    console.log("Définition du mode cloud par défaut (première utilisation)");
    localStorage.setItem('aiServiceType', 'cloud');
    setServiceType('cloud');
  }
}

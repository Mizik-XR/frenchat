
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
    
    // Si navigateur moderne détecté par l'analyseur, ne pas basculer vers le cloud
    const isModernBrowser = 
      navigator.userAgent.includes('Chrome') || 
      navigator.userAgent.includes('Firefox') || 
      navigator.userAgent.includes('Safari') || 
      navigator.userAgent.includes('Edge');
    
    if (browserCompatibility.shouldFallbackToCloud && !isModernBrowser) {
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
    // Ne pas basculer automatiquement vers le cloud en cas d'erreur
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
    // Détecter le navigateur moderne
    const isModernBrowser = 
      navigator.userAgent.includes('Chrome') || 
      navigator.userAgent.includes('Firefox') || 
      navigator.userAgent.includes('Safari') || 
      navigator.userAgent.includes('Edge');
    
    // Si navigateur moderne, définir 'local' par défaut
    const defaultMode = isModernBrowser ? 'local' : 'cloud';
    console.log(`Définition du mode ${defaultMode} par défaut (première utilisation)`);
    localStorage.setItem('aiServiceType', defaultMode);
    setServiceType(defaultMode);
  }
}

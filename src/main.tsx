
/**
 * Point d'entrée principal de l'application
 * 
 * IMPORTANT : Ce fichier contient l'initialisation de l'application.
 * Des modifications ici peuvent affecter le comportement global.
 */

// React est importé depuis l'instance centrale pour garantir la cohérence
import { React } from '@/core/ReactInstance';

// Importation des styles globaux
import './index.css';

// Initialisation des diagnostics (en développement uniquement)
import './utils/diagnostics/reactInstanceCheck';

// Protection contre les erreurs React
import './utils/startup/reactErrorProtection';

// Configuration du processus de rendu
import { startRendering, createQueryClient } from './utils/startup/appRenderer';

// Créer le client de requête
const queryClient = createQueryClient();

// Démarrer le rendu de l'application
startRendering(queryClient);

// Message de démarrage en développement
if (import.meta.env.DEV) {
  console.log('%c🚀 Application démarrée en mode développement', 'color: green; font-size: 14px; font-weight: bold;');
  console.log('%c📝 N\'oubliez pas de vérifier les instances React avec reactInstanceCheck', 'color: blue; font-size: 12px;');
}

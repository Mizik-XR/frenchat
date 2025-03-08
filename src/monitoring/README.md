
# Système de Monitoring FileChat

Ce module fournit une architecture complète pour la gestion des erreurs, la journalisation et les notifications dans l'application FileChat.

## Architecture

Le système est divisé en plusieurs composants modulaires :

- **ErrorLogger** : Service central de journalisation qui enregistre les erreurs et les informations de débogage
- **ErrorDetector** : Détecte et catégorise les différents types d'erreurs
- **NotificationManager** : Gère les notifications utilisateur pour les erreurs et avertissements
- **ReactErrorMonitor** : Composant React qui surveille les erreurs non capturées

## Utilisation

### Journalisation simple

```typescript
import { Monitoring } from '@/monitoring';

// Différents niveaux de journalisation
Monitoring.info('Opération réussie', { userId: 123 });
Monitoring.warn('Action potentiellement problématique');
Monitoring.error('Échec de l'opération', { error: err });
Monitoring.critical('Erreur bloquante', { stack: err.stack });
```

### Notifications utilisateur

```typescript
import { Monitoring } from '@/monitoring';

// Afficher des notifications
Monitoring.showSuccess('Document enregistré avec succès');
Monitoring.showWarning('Le fichier est très volumineux, l'indexation peut prendre du temps');
Monitoring.showError('Impossible de se connecter au serveur');
```

### Récupération et affichage des journaux

```typescript
import { Monitoring } from '@/monitoring';

// Récupérer tous les logs
const logs = Monitoring.getLogs();

// Afficher les logs dans la console
Monitoring.printLogs();

// Effacer les logs
Monitoring.clearLogs();
```

## Configuration

Les variables d'environnement suivantes permettent de configurer le comportement du système :

- `VITE_ENABLE_ERROR_FILTERING` : Active le filtrage intelligent des erreurs (défaut: true)
- `VITE_MAX_ERROR_LOG_SIZE` : Nombre maximum d'entrées de journal à conserver (défaut: 100)
- `VITE_DEPLOYMENT_ENV` : Environnement de déploiement (production, development, netlify, etc.)

## Intégration de services externes

Pour intégrer Sentry ou un autre service de monitoring externe, modifiez le fichier `logger.ts` et implémentez la méthode `sendToExternalMonitor` :

```typescript
// Exemple d'intégration Sentry
private static sendToExternalMonitor(entry: any) {
  if (!Sentry || !import.meta.env.VITE_SENTRY_DSN) return;
  
  if (entry.level === LogLevel.ERROR || entry.level === LogLevel.CRITICAL) {
    Sentry.captureMessage(entry.message, {
      level: entry.level.toLowerCase(),
      extra: entry.context
    });
  }
}
```

## Bonnes pratiques

1. Utilisez le niveau de log approprié pour chaque situation
2. Évitez de stocker des informations sensibles dans les logs
3. Ajoutez du contexte pertinent à chaque entrée de journal
4. N'abusez pas des notifications utilisateur pour éviter de les submerger

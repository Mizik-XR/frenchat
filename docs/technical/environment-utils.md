
# Utilitaires d'Environnement

## Vue d'ensemble

Le module d'utilitaires d'environnement (`utils/environment`) fournit des fonctions pour détecter l'environnement d'exécution, gérer les URLs, et contrôler le mode de service (local/cloud).

## Structure des modules

```
src/utils/environment/
├── index.ts                # Point d'entrée - exporte toutes les fonctions
├── environmentDetection.ts # Fonctions de détection d'environnement
├── urlUtils.ts             # Fonctions de gestion d'URL
└── cloudModeUtils.ts       # Fonctions liées au mode cloud
```

## Détection d'environnement

Les fonctions de détection d'environnement (`environmentDetection.ts`) permettent de déterminer dans quel contexte l'application est exécutée.

```typescript
isProduction()       // Vérifie si l'app est en production
isDevelopment()      // Vérifie si l'app est en développement local
isLovableEnvironment() // Vérifie si l'app est hébergée sur Lovable
isNetlifyEnvironment() // Vérifie si l'app est hébergée sur Netlify
```

## Gestion d'URL

Les fonctions de gestion d'URL (`urlUtils.ts`) facilitent la manipulation des URLs et des paramètres.

```typescript
getBaseUrl()            // Obtient l'URL de base de l'application
getRedirectUrl(path)    // Construit une URL de redirection complète
getFormattedUrlParams() // Formate les paramètres d'URL
getAllUrlParams()       // Récupère tous les paramètres d'URL
```

### Exemple d'utilisation pour OAuth

```typescript
// Dans GoogleDriveUtils.ts
import { getRedirectUrl } from '@/utils/environment';

export const getGoogleRedirectUrl = (): string => {
  // Construit l'URL de redirection pour Google OAuth
  return getRedirectUrl('auth/google/callback');
};
```

## Mode Cloud

Les fonctions de gestion du mode cloud (`cloudModeUtils.ts`) contrôlent si l'application utilise des services locaux ou distants pour l'IA.

```typescript
isCloudModeForced()  // Vérifie si le mode cloud est forcé
isClientMode()       // Vérifie si l'app est en mode client
isDebugMode()        // Vérifie si le mode débogage est activé
```

## Compatibilité

Le module maintient la rétrocompatibilité avec l'ancien système (`environmentUtils.ts`) en réexportant les fonctions depuis le nouveau module structuré.

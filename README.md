# FileChat

Application de chat avec gestion de fichiers et intégration de Supabase. Cette application permet aux utilisateurs de discuter en temps réel et de partager des fichiers.

## Architecture

L'application est structurée avec une architecture robuste assurant une séparation claire des préoccupations et une maintenance facilitée :

- **Frontend** : React avec TypeScript
- **Backend** : Supabase pour l'authentification, le stockage de données et les fonctions serverless
- **État global** : React Context API avec hooks personnalisés
- **Synchronisation** : API Supabase Realtime pour les mises à jour en temps réel

## Instance React unique

Pour éviter les problèmes liés à plusieurs instances de React, nous utilisons un module central `ReactInstance` :

```typescript
// Correct usage
import { React, useState, useEffect } from '@/core/ReactInstance';
```

## Installation

```bash
# Installation des dépendances
npm install

# Démarrage en mode développement
npm run dev

# Construction pour production
npm run build
```

## Commandes disponibles

### Développement

- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Construit l'application pour la production
- `npm run preview` - Prévisualise la version de production localement

### Tests

- `npm run test` - Exécute tous les tests (unitaires, intégration, performance)
- `npm run test:unit` - Exécute uniquement les tests unitaires
- `npm run test:integration` - Exécute uniquement les tests d'intégration
- `npm run test:perf` - Exécute uniquement les tests de performance
- `npm run setup:tests` - Configure l'environnement pour les tests

### Qualité du code

- `npm run lint` - Vérifie le code avec ESLint
- `npm run lint:fix` - Corrige automatiquement les problèmes de linting
- `npm run quality:check` - Vérifie les dépendances circulaires et les imports React
- `npm run quality:fix-imports` - Corrige automatiquement les imports directs de React

### Intégration Supabase

- `npm run supabase:types` - Génère les types TypeScript à partir du schéma Supabase
- `npm run supabase:validate` - Valide le schéma Supabase contre les types locaux
- `npm run supabase:migrations` - Exécute les migrations Supabase et met à jour les types

### CI/CD

- `npm run ci` - Exécute l'intégralité de la pipeline CI localement

## Mode hors ligne

L'application prend en charge un mode hors ligne, permettant aux utilisateurs de continuer à utiliser l'application même sans connexion Internet. La synchronisation se fait automatiquement lorsque la connexion est rétablie.

## Compatibilité

Le module `supabaseCompat.ts` assure la compatibilité entre différentes versions de l'API Supabase, facilitant les migrations et garantissant la stabilité du code existant.

## Tests

Voir le fichier [TESTING.md](./TESTING.md) pour plus d'informations sur notre stratégie de tests.

## Licence

MIT

# Module de Compatibilité Supabase

Ce module fournit une couche de compatibilité pour Supabase, facilitant la migration entre différentes versions de l'API et supportant des modes de fonctionnement spécifiques comme le mode hors ligne et les tests.

## Fonctionnalités

- 🔄 Compatibilité avec les anciennes versions de l'API Supabase
- 📱 Support du mode hors ligne
- 🧪 Facilitation des tests
- 🔒 Gestion sécurisée de l'authentification
- 📦 Gestion d'état globale
- 🎣 Hooks React personnalisés
- 🔌 Support des événements temps réel

## Installation

```bash
npm install supabase-compat
# ou
yarn add supabase-compat
# ou
pnpm add supabase-compat
```

## Configuration

1. Créez un fichier `.env` à la racine de votre projet :

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anonyme_supabase
```

2. Importez et initialisez le provider dans votre application :

```tsx
import { SupabaseProvider } from 'supabase-compat';

function App() {
  return (
    <SupabaseProvider>
      <YourApp />
    </SupabaseProvider>
  );
}
```

## Utilisation

### Hooks React

```tsx
import { useSupabase, useQuery, useSubscription, useStorage } from 'supabase-compat';

function YourComponent() {
  // Authentification
  const { user, signIn, signOut } = useSupabase();

  // Requêtes
  const { data, loading, error } = useQuery('conversations', {
    eq: { user_id: user?.id }
  });

  // Temps réel
  useSubscription('messages', (payload) => {
    console.log('Nouveau message:', payload);
  });

  // Stockage
  const { uploadFile } = useStorage('documents');

  return (
    // Votre composant
  );
}
```

### Service Supabase

```ts
import { supabaseService } from 'supabase-compat';

// Authentification
await supabaseService.auth.signIn(email, password);

// Base de données
const conversations = await supabaseService.database.query('conversations', {
  eq: { user_id: userId }
});

// Stockage
await supabaseService.storage.uploadFile('documents', 'path/to/file.pdf', file);

// Temps réel
const subscription = supabaseService.realtime.subscribe('messages', (payload) => {
  console.log('Nouveau message:', payload);
});
```

### État Global

```ts
import { appState } from 'supabase-compat';

// Accès à l'état
const state = appState.getState();

// Modification de l'état
appState.setCurrentConversation(conversation);
```

## Mode Hors Ligne

Le module supporte automatiquement le mode hors ligne :

- Mise en cache des données
- File d'attente des opérations
- Synchronisation automatique
- Gestion des conflits

## Tests

Le module inclut des utilitaires pour faciliter les tests :

```ts
import { setupTestEnvironment, mockSupabaseClient } from 'supabase-compat/testing';

describe('Vos tests', () => {
  beforeEach(() => {
    setupTestEnvironment();
  });

  it('devrait gérer l\'authentification', async () => {
    mockSupabaseClient.auth.signIn.mockResolvedValue({
      user: { id: '123', email: 'test@example.com' }
    });

    // Vos tests
  });
});
```

## Contribution

Les contributions sont les bienvenues ! Consultez notre guide de contribution pour plus de détails.

## Licence

MIT

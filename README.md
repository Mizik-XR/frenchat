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

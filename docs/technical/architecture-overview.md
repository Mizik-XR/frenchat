
# Architecture Technique

## Vue d'ensemble

FileChat est une application web permettant aux utilisateurs d'interagir avec leurs documents via une interface de chat intelligente. L'architecture est composée de plusieurs couches :

1. **Interface utilisateur (React/TypeScript)** - Gère l'expérience utilisateur
2. **Couche de service IA** - Fournit les capacités d'intelligence artificielle
3. **Couche d'indexation et RAG** - Gère l'indexation des documents et la génération de réponses
4. **Intégrations externes** - Connexion avec Google Drive, Microsoft Teams, etc.

## Modes de fonctionnement

L'application peut fonctionner dans trois modes distincts :

1. **Mode local** - Exécute le modèle d'IA localement sur l'ordinateur de l'utilisateur
2. **Mode cloud** - Utilise des services d'IA hébergés (Hugging Face, OpenAI, etc.)
3. **Mode hybride** - Combine les approches locales et cloud selon les besoins

## Détection d'environnement

Le système utilise plusieurs mécanismes pour détecter l'environnement d'exécution :

```typescript
// Détecte si l'application est en production
export function isProduction(): boolean {
  return import.meta.env.PROD || window.location.hostname !== 'localhost';
}

// Détecte si l'application est en développement
export function isDevelopment(): boolean {
  return import.meta.env.DEV && window.location.hostname === 'localhost';
}

// Détecte si l'application est dans l'environnement Lovable
export function isLovableEnvironment(): boolean {
  return window.location.hostname.includes('lovable.ai');
}

// Détecte si l'application est dans l'environnement Netlify
export function isNetlifyEnvironment(): boolean {
  return window.location.hostname.includes('netlify.app');
}
```

## Flux de données

1. L'utilisateur soumet une question via l'interface de chat
2. Le système recherche les documents pertinents (RAG)
3. L'IA génère une réponse basée sur les documents et la question
4. La réponse est présentée à l'utilisateur

## Intégrations principales

- **Google Drive** - Pour indexer les documents stockés dans Google Drive
- **Microsoft Teams** - Pour accéder aux fichiers et conversations Teams
- **Supabase** - Pour la base de données, l'authentification et les fonctions Edge

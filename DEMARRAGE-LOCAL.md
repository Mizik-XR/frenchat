
# Guide de démarrage local pour FileChat

Ce guide fournit des instructions détaillées pour démarrer FileChat en mode local, diagnostiquer et résoudre les problèmes courants.

## Prérequis

- Node.js 16+ installé
- npm 7+ installé
- Navigateur moderne (Chrome, Firefox, Edge)
- 4 Go de RAM minimum

## Modes de démarrage disponibles

FileChat propose plusieurs modes de démarrage adaptés à différentes situations:

### 1. Mode standard

```bash
# Windows
npm run dev

# Linux/Mac
npm run dev
```

Ce mode démarre l'application avec toutes les fonctionnalités. Utilisez-le lorsque tout fonctionne correctement.

### 2. Mode minimal (recommandé en cas de problèmes)

```bash
# Windows
.\start-minimal.bat

# Linux/Mac
./start-minimal.sh
```

Ce mode démarre l'application avec:
- Une configuration Vite optimisée
- Une instance React unique et sécurisée
- Le mode cloud forcé (pas de dépendance à l'IA locale)
- Une détection des dépendances circulaires

### 3. Mode récupération (pour les problèmes graves)

```bash
# Tous les systèmes
node start-recovery.js
```

Ce mode est le plus restrictif et convient aux situations où l'application ne démarre pas du tout.

## Diagnostic des problèmes

### 1. Analyse des dépendances

Pour détecter les dépendances circulaires et autres problèmes:

```bash
node src/scripts/dependency-analyzer.js
```

Ce script produira un rapport détaillé avec:
- Les dépendances circulaires détectées
- Les composants problématiques
- Les fichiers ayant trop de dépendances
- Des suggestions d'amélioration

### 2. Activation du mode debug

Vous pouvez activer le mode debug en:
- Ajoutant `?debug=true` à l'URL (ex: `http://localhost:8080/?debug=true`)
- Créant/modifiant un fichier `.env.development.local` avec:
  ```
  VITE_DEBUG_MODE=true
  ```

En mode debug, la console du navigateur affichera des informations détaillées.

### 3. Accès à l'objet de débogage

En mode debug, un objet global `__FILECHAT_DEBUG__` est disponible dans la console du navigateur:

```javascript
// Dans la console du navigateur
console.log(window.__FILECHAT_DEBUG__);
```

Cet objet fournit des méthodes de diagnostic et des informations sur l'état de l'application.

## Résolution des problèmes courants

### Page blanche / Erreur de rendu

1. Essayez le mode récupération: `node start-recovery.js`
2. Videz le cache du navigateur et les cookies
3. Vérifiez la console pour les erreurs spécifiques

### Erreurs d'importation React

Si vous voyez des erreurs liées à React (ex: "Invalid hook call"):

1. Utilisez l'instance React centralisée dans vos composants:
   ```typescript
   // Au lieu de
   import React from 'react';
   
   // Utilisez
   import { React } from '@/core/ReactInstance';
   ```

2. Pour les hooks, importez-les également depuis l'instance unique:
   ```typescript
   // Au lieu de
   import { useState, useEffect } from 'react';
   
   // Utilisez
   import { useState, useEffect } from '@/core/ReactInstance';
   ```

### Dépendances circulaires

Si l'analyseur de dépendances détecte des circularités:

1. Déplacez les types partagés dans des fichiers séparés
2. Utilisez l'importation dynamique (lazy loading) pour briser les cycles
3. Créez des fichiers d'index pour centraliser les exports
4. Réorganisez la structure des fichiers selon les suggestions du rapport

### Problèmes de CSS

Si les styles ne s'appliquent pas correctement:

1. Assurez-vous d'importer les fichiers CSS dans le bon ordre
2. Vérifiez la console pour les erreurs liées à Tailwind
3. Essayez de redémarrer l'application en mode minimal

## Vérification du succès

Votre application démarre correctement si:

1. Aucune erreur n'apparaît dans la console
2. L'interface utilisateur s'affiche correctement
3. Les fonctionnalités de base fonctionnent
4. La navigation entre les pages est fluide

## Support

Si les problèmes persistent après avoir essayé tous les modes de démarrage et les étapes de dépannage, contactez l'équipe de développement.

---

Documentation créée par l'équipe FileChat.

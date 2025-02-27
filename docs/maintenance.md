
# Mises à jour, maintenance et tests

## Stratégie de mise à jour

### Principe des mini-tâches

FileChat adopte une approche incrémentale pour ses mises à jour, basée sur des mini-tâches:

1. **Définition**: Une mini-tâche est une modification ciblée et limitée qui:
   - Ne concerne qu'une fonctionnalité ou composant spécifique
   - Peut être testée de manière isolée
   - Présente un risque minimal de régression

2. **Structure d'une mini-tâche**:
   ```
   Mini-tâche: [Titre court et descriptif]
   
   Objectif: [Description de ce que la tâche doit accomplir]
   
   Fichiers à modifier:
   - [Chemin/vers/fichier1.ts]
   - [Chemin/vers/fichier2.tsx]
   
   Tests à effectuer:
   - [Test fonctionnel 1]
   - [Test fonctionnel 2]
   
   Critères de validation:
   - [Critère 1]
   - [Critère 2]
   ```

3. **Workflow de mise à jour**:
   - Proposer une mini-tâche
   - Obtenir validation du propriétaire du code
   - Implémenter la modification
   - Tester selon les critères définis
   - Documenter les changements
   - Déployer

### Gestion des versions

FileChat suit le versionnement sémantique (SemVer):

| Type de mise à jour | Incrémentation | Description                        |
|---------------------|----------------|------------------------------------|
| Patch               | x.x.1 → x.x.2  | Corrections de bugs, pas de rupture|
| Mineur              | x.1.0 → x.2.0  | Nouvelles fonctionnalités compatibles |
| Majeur              | 1.0.0 → 2.0.0  | Changements non rétrocompatibles   |

## Procédures de test

### Tests locaux

1. **Démarrage de l'environnement de test**:
   ```bash
   # Exécuter start-app.bat ou:
   npm run dev            # Lance le frontend sur le port 5173
   python serve_model.py  # Lance le serveur IA sur le port 8000
   ```

2. **Parcours de test complet**:
   - Connexion/création de compte
   - Configuration des sources (Google Drive, Teams)
   - Indexation de documents
   - Conversation avec l'IA
   - Génération de documents

3. **Vérification des logs**:
   - Console du navigateur pour les erreurs frontend
   - Terminal du serveur IA pour les erreurs de modèle
   - Logs Supabase pour les erreurs d'Edge Functions

### Tests automatisés

FileChat utilise plusieurs niveaux de tests automatisés:

1. **Tests unitaires** (Vitest):
   ```bash
   npm run test:unit
   ```
   Testent des fonctions et composants isolés (hooks, utilitaires).

2. **Tests d'intégration** (Cypress):
   ```bash
   npm run test:integration
   ```
   Testent l'interaction entre les composants.

3. **Tests end-to-end** (Cypress):
   ```bash
   npm run test:e2e
   ```
   Testent les parcours utilisateur complets.

### Monitoring et diagnostics

- **Surveillance des performances**:
  - Temps de réponse des Edge Functions
  - Latence du modèle d'IA
  - Taux d'erreur par fonctionnalité

- **Tableaux de bord**:
  - Vue d'ensemble du système (route `/monitoring`)
  - Statistiques d'indexation et d'utilisation
  - Détection des anomalies

## Procédures de rollback

En cas de problème majeur suite à une mise à jour:

1. **Rollback de code**:
   ```bash
   git revert [commit-id]   # Annule les changements du commit
   # ou
   git reset --hard [version-tag]   # Revient à une version stable
   ```

2. **Restauration de la base de données**:
   - Utiliser les backups Supabase
   - Exécuter les migrations de rollback

3. **Notification des utilisateurs**:
   - Message dans l'interface
   - Email pour les incidents majeurs

## Bonnes pratiques pour le code

### Style et conventions

- **Linting et formatage**:
  ```bash
  npm run lint   # Vérifie le code avec ESLint
  npm run format # Formate le code avec Prettier
  ```

- **Convention de nommage**:
  - PascalCase pour les composants React
  - camelCase pour les variables et fonctions
  - snake_case pour les tables et colonnes Supabase

### Règles de contribution

1. **Ne pas modifier sans validation**:
   - Les composants d'authentification
   - Les configurations OAuth
   - Les schémas de base de données

2. **Toujours documenter**:
   - Les nouveaux composants (JSDoc)
   - Les modifications des API
   - Les changements de schéma

3. **Tests obligatoires pour**:
   - Modifications des Edge Functions
   - Nouvelles fonctionnalités
   - Corrections de bugs critiques

## Rapports de modification

Après chaque modification, un rapport détaillé doit être fourni:

```
Rapport de modification

Date: [YYYY-MM-DD]
Ticket/Issue: [Référence]
Auteur: [Nom]

Modifications effectuées:
- [Description détaillée]

Fichiers modifiés:
- [Chemin/vers/fichier1.ts] - [Résumé des changements]
- [Chemin/vers/fichier2.tsx] - [Résumé des changements]

Tests effectués:
- [Description du test 1] - [Résultat]
- [Description du test 2] - [Résultat]

Captures d'écran:
[Liens ou images insérées]

Logs pertinents:
```console
[Extraits de logs pertinents]
```

Impact potentiel:
- [Risques identifiés]
- [Fonctionnalités affectées]

Plan de rollback:
- [Étapes pour annuler cette modification si nécessaire]
```

Ce format standardisé garantit que toutes les modifications sont tracées et peuvent être examinées ou annulées si nécessaire.

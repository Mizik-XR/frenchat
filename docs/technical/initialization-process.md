
# Processus d'initialisation de FileChat

Ce document explique en détail le processus d'initialisation de FileChat, la gestion des erreurs et le chargement des composants.

## Vue d'ensemble de l'initialisation

L'application FileChat utilise une stratégie d'initialisation progressive conçue pour:
- Minimiser le temps d'affichage initial
- Éviter les erreurs d'importation circulaire
- Fournir une expérience de secours en cas d'erreur

## Séquence d'initialisation

1. **Pré-chargement (index.html)**
   - Affichage d'un écran de chargement minimal
   - Configuration des gestionnaires d'erreurs précoces
   - Détection des erreurs de chargement JavaScript
   
2. **Initialisation du point d'entrée (main.tsx)**
   - Détection de l'environnement d'exécution
   - Journalisation des informations du système
   - Chargement asynchrone des modules principaux
   
3. **Bootstrap de l'application (App.tsx)**
   - Configuration des providers (ThemeProvider, QueryClient, etc.)
   - Initialisation du routeur
   - Configuration des providers d'authentification et d'état
   
4. **Chargement de la page initiale (Index.tsx)**
   - Vérification de l'état d'authentification
   - Redirection vers la page appropriée (Landing ou Chat)
   - Gestion des erreurs d'initialisation

## Guide de débogage des problèmes d'initialisation

### 1. Version simplifiée pour le débogage

Pour isoler les problèmes d'initialisation, nous avons créé une version simplifiée qui:
- Désactive temporairement Sentry
- Remplace les appels Sentry par des console.log
- Réduit le nombre de providers React
- Inclut un composant de diagnostic visible en bas à droite de l'écran

Pour activer cette version simplifiée, utilisez:
```
npm run dev
```

### 2. Problèmes d'initialisation courants

#### Erreur: Importations circulaires
Les erreurs "Cannot access X before initialization" indiquent généralement des importations circulaires.

**Solution**: Utiliser des importations dynamiques et restructurer l'architecture de modules.

#### Erreur: Échec de rendu initial
Si l'application ne parvient pas à se rendre, vérifier:
1. La présence des éléments DOM nécessaires
2. Les erreurs de console
3. Les problèmes de dépendances

#### Erreur: Incompatibilité de versions Sentry
Si vous voyez des erreurs liées à `unstable_scheduleCallback` ou similaires:
1. Vérifiez que vous n'utilisez qu'une seule version de Sentry
2. Assurez-vous que le script CDN est commenté dans index.html
3. Laissez Sentry désactivé jusqu'à ce que l'application se charge correctement

## Réactivation progressive des fonctionnalités

Après avoir confirmé que l'application se charge correctement avec la version simplifiée, vous pouvez réactiver progressivement les fonctionnalités dans cet ordre:

1. Réactiver les providers React un par un (QueryClient, SettingsProvider, etc.)
2. Réactiver les imports de composants lazy
3. Réactiver Sentry en dernier, en vérifiant qu'une seule méthode d'initialisation est utilisée

## Méthodologie de test

Pour confirmer que chaque étape fonctionne:
1. Vérifiez les logs de console pour les erreurs
2. Utilisez le composant de diagnostic en bas à droite pour confirmer que React fonctionne
3. Testez les fonctionnalités de base (navigation, authentification) avant de passer à la suivante

## Remarque sur Sentry

L'intégration Sentry présente des défis particuliers:
- Évitez d'avoir plusieurs versions de Sentry (@sentry/react 9.x et @sentry/react 7.x)
- N'initialisez Sentry qu'à un seul endroit
- Assurez-vous que l'initialisation se produit avant que React n'effectue des rendus

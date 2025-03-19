
# Mode Hors Ligne et Compatibilité Supabase

Ce document décrit le fonctionnement du mode hors ligne dans Frenchat et la gestion de l'intégration Supabase.

## Architecture du Mode Hors Ligne

### Principes de conception

Le système de mode hors ligne a été conçu pour:

1. Permettre à l'application de fonctionner en l'absence de connexion Supabase
2. Basculer automatiquement ou manuellement entre les modes en ligne et hors ligne
3. Fonctionner dans différents environnements, y compris l'environnement Lovable

### Composants clés

- **APP_STATE**: Objet singleton dans `supabaseCompat.ts` qui centralise l'état du mode hors ligne
- **Détection automatique**: Mécanismes pour détecter les problèmes de connexion
- **Interface utilisateur**: Composants pour contrôler manuellement le mode

## Fonctionnalités du Mode Hors Ligne

### Basculement Manuel

L'utilisateur peut basculer entre les modes via:

- Le badge de statut de connexion dans la barre de navigation
- Les paramètres d'URL `?forceOnline=true` ou `?forceOffline=true`
- Le localStorage avec la clé `OFFLINE_MODE`

### Détection Automatique

Le mode hors ligne est activé automatiquement dans les cas suivants:

- Erreur d'initialisation du client Supabase
- Navigateur signalant `navigator.onLine = false`
- Erreurs réseau lors des appels à Supabase

### Configuration pour l'Environnement Lovable

Dans l'environnement Lovable:

- Par défaut, le mode hors ligne est activé pour éviter les problèmes d'intégration
- L'utilisateur peut activer Supabase avec le paramètre `ENABLE_SUPABASE_IN_LOVABLE`
- L'IA locale peut être activée avec `ENABLE_LOCAL_AI_IN_LOVABLE`

## Guide de Dépannage

### Problèmes Courants

#### Application en Mode Hors Ligne Persistant

**Symptômes**: L'application reste en mode hors ligne même avec une connexion Internet.

**Solutions**:
1. Vérifiez le localStorage pour `OFFLINE_MODE` et définissez-le sur `false`
2. Utilisez l'URL avec le paramètre `?forceOnline=true`
3. Vérifiez la console pour les erreurs Supabase

#### Erreurs Supabase dans l'Environnement Lovable

**Symptômes**: Erreurs de console liées à Supabase dans Lovable.

**Solutions**:
1. Assurez-vous que `ENABLE_SUPABASE_IN_LOVABLE` est défini sur `true`
2. Vérifiez que les clés Supabase sont correctement configurées
3. Utilisez les outils de développement pour examiner les requêtes réseau

## Feuille de Route pour l'Amélioration

1. Refactoriser les dépendances circulaires liées à l'authentification
2. Implémenter un système de mise en cache pour le mode hors ligne
3. Améliorer la synchronisation des données lors du retour en ligne
4. Créer une architecture plus propre pour la gestion des états en ligne/hors ligne

## Guide d'Utilisation pour les Développeurs

### Activer le Mode en Ligne dans Lovable

Pour développer et tester avec Supabase activé dans l'environnement Lovable:

1. Ouvrez la console du navigateur et exécutez:
   ```javascript
   localStorage.setItem('ENABLE_SUPABASE_IN_LOVABLE', 'true');
   ```

2. Rechargez la page

3. Ou utilisez le badge de statut de connexion dans l'interface utilisateur

### Déboguer les Problèmes de Connexion

Pour diagnostiquer les problèmes liés au mode hors ligne:

1. Vérifiez l'état actuel en console:
   ```javascript
   console.log(window.APP_STATE ? window.APP_STATE.isOfflineMode : 'APP_STATE not available');
   ```

2. Examinez les erreurs Supabase stockées:
   ```javascript
   console.log(window.APP_STATE ? window.APP_STATE.supabaseErrors : 'APP_STATE not available');
   ```

3. Forcez le mode en ligne pour le débogage:
   ```javascript
   if (window.APP_STATE) window.APP_STATE.setOfflineMode(false);
   localStorage.setItem('OFFLINE_MODE', 'false');
   ```

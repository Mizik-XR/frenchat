
# Configuration OAuth et Indexation

## Configuration de Google Drive

### Prérequis
- Un projet Google Cloud Platform
- Des identifiants OAuth 2.0 configurés

### Étapes de configuration

1. **Création du projet Google Cloud**
   - Accédez à la [Google Cloud Console](https://console.cloud.google.com/)
   - Créez un nouveau projet ou sélectionnez un projet existant
   - Notez l'ID du projet pour référence future

2. **Activation des API nécessaires**
   - Dans "Bibliothèque d'API", recherchez et activez:
     - Google Drive API
     - Google Sheets API (si nécessaire)

3. **Configuration de l'écran de consentement OAuth**
   - Allez dans "API et services" > "Écran de consentement OAuth"
   - Choisissez le type "Externe" ou "Interne" selon vos besoins
   - Remplissez les informations requises (nom de l'application, contacts, etc.)
   - Ajoutez les scopes nécessaires:
     - `https://www.googleapis.com/auth/drive.readonly`
     - `https://www.googleapis.com/auth/drive.metadata.readonly`

4. **Création des identifiants OAuth**
   - Allez dans "API et services" > "Identifiants"
   - Cliquez sur "Créer des identifiants" > "ID client OAuth"
   - Sélectionnez "Application Web"
   - Ajoutez les **Origines JavaScript autorisées**:
   
     **Pour le développement local:**
     - `http://localhost:8080`
     - `http://localhost:5173` (si vous utilisez Vite en mode dev)
     - `http://127.0.0.1:8080`
     
     **Pour le développement avec Lovable:**
     - `https://votre-projet.gptengineer.app`
     
     **Pour la production:**
     - `https://votre-domaine.com`

   - Ajoutez les **URI de redirection autorisés** selon votre environnement:
   
     **Pour le développement local:**
     - `http://localhost:8080/auth/google/callback`
     - `http://localhost:5173/auth/google/callback` (si vous utilisez Vite en mode dev)
     - `http://127.0.0.1:8080/auth/google/callback`
     
     **Pour le développement avec Lovable:**
     - `https://votre-projet.gptengineer.app/auth/google/callback`
     
     **Pour la production:**
     - `https://votre-domaine.com/auth/google/callback`
   
   - Notez le Client ID et le Client Secret générés

5. **Configuration dans FileChat**
   - Dans l'application FileChat, accédez aux paramètres
   - Entrez le Client ID et le Client Secret dans la section "Configuration Google Drive"
   - Sauvegardez les modifications

## URLs importantes pour les redirections OAuth

| Environnement | Origines JavaScript autorisées | URI de redirection |
|---------------|--------------------------------|-------------------|
| Local (http-server) | `http://localhost:8080` | `http://localhost:8080/auth/google/callback` |
| Local (Vite dev) | `http://localhost:5173` | `http://localhost:5173/auth/google/callback` |
| Local (alternative) | `http://127.0.0.1:8080` | `http://127.0.0.1:8080/auth/google/callback` |
| Lovable | `https://votre-projet.gptengineer.app` | `https://votre-projet.gptengineer.app/auth/google/callback` |
| Production | `https://votre-domaine.com` | `https://votre-domaine.com/auth/google/callback` |

> **Important**: Pour le développement local avec les paramètres spécifiques au mode cloud, utilisez également:
> `http://localhost:8080/auth/google/callback?client=true&hideDebug=true&forceCloud=true&mode=cloud`

## Configuration de Microsoft Teams

### Prérequis
- Un compte Microsoft Azure
- Accès à Azure Active Directory

### Étapes de configuration

1. **Enregistrement de l'application**
   - Accédez au [Portail Azure](https://portal.azure.com/)
   - Naviguez vers "Azure Active Directory" > "Enregistrements d'applications"
   - Cliquez sur "Nouvel enregistrement"
   - Donnez un nom à votre application
   - Définissez les URI de redirection:
     - `http://localhost:5173/auth/teams/callback` (développement)
     - `https://votre-domaine.com/auth/teams/callback` (production)

2. **Configuration des autorisations API**
   - Dans votre application enregistrée, allez dans "Autorisations API"
   - Ajoutez les permissions Microsoft Graph:
     - `ChannelMessage.Read.All`
     - `Files.Read.All`
     - `User.Read`
   - Demandez le consentement administrateur pour ces permissions

3. **Création d'un secret client**
   - Allez dans "Certificats et secrets"
   - Créez un nouveau secret client
   - Notez la valeur du secret immédiatement (elle ne sera plus visible après)

4. **Configuration dans FileChat**
   - Dans l'application FileChat, accédez aux paramètres
   - Entrez l'ID d'application et le secret dans la section "Configuration Microsoft Teams"
   - Sauvegardez les modifications

## Processus d'indexation des documents

### Workflow d'indexation Google Drive

1. **Autorisation utilisateur**
   - L'utilisateur se connecte à son compte Google
   - Consent à l'accès à ses fichiers Google Drive
   - FileChat stocke le token d'accès et de rafraîchissement dans la table `oauth_tokens`

2. **Sélection des dossiers**
   - L'utilisateur sélectionne les dossiers à indexer
   - Les informations sur les dossiers sont stockées dans la table `google_drive_folders`

3. **Processus d'indexation**
   - L'Edge Function `index-google-drive` est déclenchée
   - Elle crée une entrée dans la table `indexing_progress` pour suivre la progression
   - L'indexation est effectuée par lots via `batch-index-google-drive`
   - Les fichiers sont traités selon leur type (PDF, DOCX, TXT, etc.)
   - Le contenu est extrait et découpé en chunks

4. **Génération d'embeddings**
   - Chaque chunk est converti en embedding vectoriel
   - Les embeddings sont stockés dans la table `document_embeddings`
   - Un cache d'embeddings est maintenu pour éviter le retraitement des fichiers inchangés

5. **Mise à jour du statut**
   - La progression est mise à jour dans la table `indexing_progress`
   - L'interface utilisateur affiche la progression en temps réel

### Gestion du consentement utilisateur

FileChat implémente une approche transparente du consentement utilisateur:

1. **Consentement explicite**
   - Avant toute indexation, un écran de consentement est présenté
   - Il détaille les fichiers qui seront accessibles et indexés
   - L'utilisateur doit explicitement consentir pour continuer

2. **Granularité du consentement**
   - L'utilisateur peut choisir des dossiers spécifiques plutôt que tout son Drive
   - Il peut exclure certains types de fichiers de l'indexation

3. **Transparence du processus**
   - La barre de progression montre l'état d'avancement
   - Les fichiers traités sont listés en temps réel
   - L'utilisateur peut annuler l'indexation à tout moment

4. **Révocation d'accès**
   - Une option pour révoquer l'accès est disponible dans les paramètres
   - L'utilisateur peut également révoquer l'accès via son compte Google

## Suivi et dépannage de l'indexation

### Monitoring du processus

La table `indexing_progress` contient les informations sur l'état d'avancement:

| Colonne           | Description                                    |
|-------------------|------------------------------------------------|
| `id`              | Identifiant unique du processus d'indexation   |
| `user_id`         | ID de l'utilisateur                            |
| `status`          | État actuel (running, completed, error)        |
| `total_files`     | Nombre total de fichiers à traiter             |
| `processed_files` | Nombre de fichiers déjà traités                |
| `current_folder`  | Dossier en cours de traitement                 |
| `error`           | Message d'erreur éventuel                      |
| `created_at`      | Date de début de l'indexation                  |
| `updated_at`      | Dernière mise à jour du statut                 |

### Résolution des problèmes courants

1. **Indexation bloquée**
   - Vérifiez les logs des Edge Functions
   - Redémarrez l'indexation via l'interface d'administration
   - Vérifiez que les tokens OAuth sont toujours valides

2. **Erreurs d'accès**
   - Vérifiez que les permissions Google Drive sont correctement configurées
   - Assurez-vous que l'utilisateur a consenti aux scopes appropriés
   - Vérifiez si le token d'accès a expiré et doit être rafraîchi

3. **Fichiers manquants**
   - Vérifiez les types de fichiers supportés
   - Assurez-vous que la taille du fichier est inférieure à la limite
   - Vérifiez les logs pour les erreurs spécifiques à certains fichiers

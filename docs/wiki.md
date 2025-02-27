
# Documentation filechat

## Installation locale

### Prérequis
- Node.js 18+ installé
- Python 3.9+ installé
- Git installé
- Compte Supabase (pour l'environnement de développement)
- Projet Google Cloud Platform (pour l'API Google Drive)

### Installation

1. Clonez le dépôt :
```bash
git clone <votre-repo>
cd filechat
```

2. Configuration de l'environnement :
   - Créez un fichier `.env` à la racine du projet avec :
   ```
   VITE_SUPABASE_URL=votre_url_supabase
   VITE_SUPABASE_ANON_KEY=votre_clé_anonyme
   ```

3. Lancement de l'application :
   - Sur Windows : exécutez `start-app.bat`
   - Sur macOS/Linux : 
     ```bash
     # Terminal 1 - Serveur IA
     python -m venv venv
     source venv/bin/activate
     pip install -r requirements.txt
     python serve_model.py
     
     # Terminal 2 - Application React
     npm install
     npm run dev
     ```

## Configuration

### Ports utilisés
- **Application React** : http://localhost:5173
- **Serveur IA local** : http://localhost:8000 
- **Supabase local** (si utilisé) : http://localhost:54321

### Configuration OAuth

#### Google Drive
1. Créez un projet dans la [Console Google Cloud](https://console.cloud.google.com)
2. Activez l'API Google Drive
3. Configurez l'écran de consentement OAuth
4. Créez des identifiants OAuth 2.0
5. Configurez les URI de redirection autorisés :
   - `http://localhost:5173/auth/google/callback`
   - `https://votre-domaine.com/auth/google/callback` (production)
6. Ajoutez les identifiants dans Supabase > Storage > Buckets > Configuration

#### Microsoft Teams (si applicable)
1. Inscrivez une application dans le [portail Azure](https://portal.azure.com)
2. Ajoutez les API Microsoft Graph requises
3. Configurez l'authentification et les redirections
4. Stockez les identifiants dans Supabase

## Architecture RAG

### Indexation
1. L'utilisateur autorise l'accès à Google Drive
2. Le système récupère les fichiers/dossiers via l'API
3. Le processus d'indexation analyse les fichiers et crée des embeddings
4. Les métadonnées et embeddings sont stockés dans Supabase

### Embeddings
- Utilisation de transformers.js pour générer des embeddings localement
- Stockage optimisé avec chunking intelligent
- Cache pour éviter la régénération d'embeddings pour fichiers inchangés

### Chat
1. L'utilisateur pose une question
2. Le système recherche les chunks pertinents via les embeddings
3. Le contexte récupéré est envoyé au LLM pour générer une réponse
4. Le suivi de conversation permet de garder le contexte

## Modules critiques

### Authentification
- `AuthProvider.tsx` : Gère l'état d'authentification et les redirections
- `useAuth.tsx` : Hook pour accéder au contexte d'authentification

### Configuration
- `GoogleDriveConfig.tsx` : Interface de connexion à Google Drive
- `MicrosoftTeamsConfig.tsx` : Interface de connexion à Microsoft Teams
- `useGoogleDriveStatus.ts` : Gestion de l'état de connexion Google Drive

### Indexation
- `useGoogleDriveFolders.ts` : Récupération des dossiers Drive
- `useIndexingProgress.ts` : Suivi de la progression d'indexation
- `IndexingProgressBar.tsx` : Affichage visuel de la progression

### Chat
- `Chat.tsx` : Composant principal de l'interface de chat
- `useChatMessages.ts` : Gestion des messages
- `useChatLogic.ts` : Logique du dialogue avec l'IA

## Bonnes pratiques

### Éviter les régressions
- Ne pas supprimer de composants existants
- Ne pas modifier la logique d'authentification sans tests approfondis
- Préserver les routes et tables Supabase existantes

### Mini-tâches
- Diviser les changements en petites tâches isolées
- Tester chaque modification avant de passer à la suivante
- Documenter les changements effectués

### Tests
- Vérifier l'authentification complète
- Tester l'indexation et le suivi de progression
- Vérifier le chat et la génération de réponses
- Tester l'export de documents (si implémenté)

## Edge Functions Supabase

### google-oauth
- Gère l'authentification OAuth avec Google
- Récupère et rafraîchit les tokens d'accès

### batch-index-google-drive
- Indexe récursivement les dossiers Google Drive
- Traite les fichiers par lots pour éviter les limitations d'API

### rag-generation
- Génère des réponses basées sur le contexte récupéré
- Utilise les embeddings pour trouver les informations pertinentes

### upload-chat-file
- Traite les fichiers uploadés directement dans le chat
- Génère des embeddings et les stocke dans la base de données

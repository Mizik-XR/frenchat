
# Architecture et Composants

## Schéma d'architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌───────────────────┐
│                 │     │                  │     │                   │
│  Interface      │◄────┤  Serveur IA      │◄────┤  Base de données  │
│  Utilisateur    │     │  Local (8000)    │     │  Supabase         │
│  (React - 5173) │     │                  │     │                   │
│                 │     │                  │     │                   │
└────────┬────────┘     └──────────────────┘     └─────────┬─────────┘
         │                                                 │
         │                                                 │
         │          ┌────────────────────────┐            │
         └─────────►│                        │◄───────────┘
                    │   Edge Functions       │
                    │   (Supabase)           │
                    │                        │
                    └───────────┬────────────┘
                                │
                                ▼
                     ┌─────────────────────┐
                     │                     │
                     │  Services externes  │
                     │  (Google Drive,     │
                     │   Microsoft Teams)  │
                     │                     │
                     └─────────────────────┘
```

## Composants principaux

### 1. Frontend (React)

Le frontend est construit avec React et TypeScript, utilisant Tailwind CSS et shadcn/ui pour l'interface utilisateur.

**Structure des dossiers:**
```
src/
├── components/        # Composants React
│   ├── auth/          # Authentification
│   ├── chat/          # Interface de chat
│   ├── config/        # Configuration
│   └── ui/            # Composants UI réutilisables
├── hooks/             # Hooks React personnalisés
├── integrations/      # Intégrations externes
├── pages/             # Pages de l'application
├── services/          # Services métier
├── styles/            # Styles globaux
└── types/             # Types TypeScript
```

**Composants essentiels:**
- `Chat.tsx` : Interface principale de chat
- `ConfigWizard.tsx` : Assistant de configuration
- `GoogleDriveConfig.tsx` : Configuration de Google Drive
- `MicrosoftTeamsConfig.tsx` : Configuration de Microsoft Teams

### 2. Serveur IA local (port 8000)

Un serveur Python fonctionnant sur le port 8000, utilisant Transformers pour la génération de texte.

- Exécuté via `serve_model.py`
- Utilise des modèles comme Mistral, Llama, ou d'autres modèles compatibles
- Peut fonctionner entièrement en local sans dépendance externe

### 3. Base de données Supabase

Stocke toutes les données de l'application, y compris:

#### Tables principales

| Table                      | Description                                        |
|----------------------------|----------------------------------------------------|
| `documents`                | Documents indexés et leurs métadonnées             |
| `document_embeddings`      | Embeddings vectoriels des chunks de documents      |
| `indexing_progress`        | Suivi de la progression d'indexation               |
| `chat_conversations`       | Conversations avec l'IA                            |
| `chat_messages`            | Messages individuels des conversations             |
| `oauth_tokens`             | Tokens OAuth pour Google Drive et Microsoft Teams  |
| `service_configurations`   | Configuration des services externes                |
| `user_ai_configs`          | Configuration des modèles d'IA par utilisateur     |

#### Règles RLS importantes

- Les utilisateurs ne peuvent accéder qu'à leurs propres documents et conversations
- Les tokens OAuth sont protégés et accessibles uniquement par leur propriétaire
- Les Edge Functions utilisent le rôle de service pour des opérations privilégiées

### 4. Edge Functions

Les Edge Functions Supabase gèrent les interactions avec les services externes et les opérations intensives:

#### Fonctions critiques

| Fonction                     | Description                                          |
|------------------------------|------------------------------------------------------|
| `google-oauth`               | Gestion de l'authentification Google Drive           |
| `batch-index-google-drive`   | Indexation par lots des fichiers Google Drive        |
| `index-google-drive`         | Coordination de l'indexation Google Drive            |
| `rag-generation`             | Génération de réponses basées sur les documents      |
| `process-uploaded-files`     | Traitement des fichiers téléversés manuellement      |
| `text-generation`            | Interface avec les modèles d'IA                      |
| `generate-image`             | Génération d'images (si configurée)                  |

### 5. Services externes

- **Google Drive API**: Accès et indexation des fichiers et dossiers
- **Microsoft Graph API**: Accès aux conversations et documents Teams
- **Hugging Face (optionnel)**: Modèles d'IA dans le cloud
- **OpenAI API (optionnel)**: Modèles GPT pour la génération de texte avancée

## Flux de données

1. L'utilisateur s'authentifie et configure les sources de données
2. FileChat indexe les documents (Google Drive, Teams, upload manuel)
3. Les documents sont découpés en chunks et transformés en embeddings vectoriels
4. Ces embeddings sont stockés dans la base de données Supabase
5. L'utilisateur pose une question dans l'interface de chat
6. Le système recherche les chunks pertinents via les embeddings
7. Le contexte est envoyé au modèle d'IA (local ou cloud)
8. La réponse générée est affichée à l'utilisateur

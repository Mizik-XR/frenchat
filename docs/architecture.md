
# Architecture du Projet

## Structure des Dossiers

```
src/
├── components/        # Composants React
│   ├── auth/         # Composants d'authentification
│   ├── chat/         # Composants de chat
│   ├── config/       # Composants de configuration
│   └── ui/           # Composants UI réutilisables
├── hooks/            # Hooks React personnalisés
├── integrations/     # Intégrations externes
├── pages/           # Pages de l'application
├── services/        # Services métier
├── styles/          # Styles globaux
├── tests/           # Tests
└── types/           # Types TypeScript
```

## Composants Principaux

### AuthProvider

Gère l'authentification et l'état de connexion :
```typescript
import { useAuth } from '@/components/AuthProvider';
const { user, isLoading, signOut } = useAuth();
```

### GoogleDriveConfig

Configure l'intégration Google Drive :
```typescript
import { GoogleDriveConfig } from '@/components/config/GoogleDrive/GoogleDriveConfig';
<GoogleDriveConfig onSave={() => console.log('Configuration sauvegardée')} />
```

### Chat

Interface de chat principale :
```typescript
import { Chat } from '@/components/Chat';
<Chat />
```

## Hooks Personnalisés

### useGoogleDrive

Gère la connexion à Google Drive :
```typescript
const { isConnecting, isConnected, initiateGoogleAuth } = useGoogleDrive(user, onConfigSave);
```

### useChatMessages

Gère les messages du chat :
```typescript
const { messages, isLoading } = useChatMessages(conversationId);
```

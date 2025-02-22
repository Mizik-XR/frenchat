
# DocuChatter

Application de chat intelligente avec intégration de Google Drive et traitement de documents.

## Fonctionnalités

- 💬 Chat interactif avec IA
- 📁 Intégration Google Drive
- 📄 Traitement de documents
- 🔒 Authentification sécurisée
- 🎨 Interface utilisateur moderne avec shadcn/ui
- 🌐 Architecture full-stack avec Supabase

## Prérequis

- Node.js 18+ installé
- Un compte Supabase
- Un compte Google Cloud Platform (pour l'intégration Google Drive)

## Installation

1. Cloner le repository :
```bash
git clone <votre-repo>
cd docu-chatter
```

2. Installer les dépendances :
```bash
npm install
```

3. Configuration de l'environnement :

Créez un fichier `.env` à la racine du projet avec les variables suivantes :
```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase
```

## Configuration de Supabase

1. Créez un nouveau projet sur Supabase
2. Dans la section Authentication > Settings :
   - Activez "Enable Email Signup"
   - Configurez les URL de redirection
3. Dans Database, exécutez les migrations SQL fournies

### Configuration de Google Drive

1. Créez un projet sur Google Cloud Console
2. Activez l'API Google Drive
3. Créez des identifiants OAuth 2.0
4. Configurez les URL de redirection autorisées
5. Ajoutez les identifiants dans la configuration Supabase

## Structure du Projet

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

## Fonctions Edge Supabase

### manage-embeddings-cache

Gère le cache des embeddings :
```typescript
await supabase.functions.invoke('manage-embeddings-cache', {
  body: { 
    action: 'get|set|invalidate',
    key: 'cache-key',
    value: data,
    ttl: 3600
  }
});
```

### google-oauth

Gère l'authentification OAuth avec Google :
```typescript
await supabase.functions.invoke('google-oauth', {
  body: { code: 'auth-code' }
});
```

## Tests

L'application inclut des tests unitaires et d'intégration :

```bash
# Exécuter les tests
npm test

# Tests d'intégration
npm run test:integration

# Tests unitaires
npm run test:unit
```

## Déploiement

1. Configurez votre projet Supabase
2. Déployez les Edge Functions :
```bash
supabase functions deploy
```

3. Déployez l'application frontend :
```bash
npm run build
```

## Bonnes Pratiques

- Utilisez les composants UI de shadcn/ui pour la cohérence visuelle
- Suivez les patterns React modernes (hooks, context)
- Utilisez TypeScript pour le typage statique
- Testez les fonctionnalités critiques
- Gérez proprement les états de chargement et les erreurs

## Sécurité

- Les clés API sont stockées de manière sécurisée dans Supabase
- L'authentification utilise JWT
- Les politiques RLS Supabase contrôlent l'accès aux données
- CORS configuré pour la sécurité

## Support

Pour toute question ou problème :
1. Consultez les issues GitHub
2. Vérifiez les logs Supabase
3. Contactez l'équipe de développement


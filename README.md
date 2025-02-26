
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

1. Exécuter les tests unitaires :
```bash
npm run test:unit
```

2. Tests d'intégration :
```bash
npm run test:integration
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

## Modèles de Langage (LLM)

### Modèles Supportés

1. **Ollama (Local)**
   - Modèles disponibles : llama2, mistral, phi
   - Exécution locale sur votre machine
   - Ne nécessite pas de clé API
   - Installation via https://ollama.ai/download

2. **Hugging Face**
   - Modèles : mistral-7b, llama-2, falcon-40b
   - Plateforme open source
   - Gratuit pour les modèles de base

3. **Phi-3 (Microsoft)**
   - Versions : phi-3-small, phi-3-medium
   - Optimisé pour la compréhension
   - Open source

4. **OpenAI (Optionnel)**
   - Modèles : gpt-4-turbo, gpt-4, gpt-3.5-turbo
   - Nécessite une clé API
   - Performances supérieures

5. **DeepSeek**
   - Spécialisations : deepseek-coder, deepseek-chat
   - Nécessite une clé API
   - Optimisé pour les tâches spécifiques

### Configuration des LLM

```typescript
// Configuration du modèle
import { LLMConfigComponent } from '@/components/config/LLMConfig';

<LLMConfigComponent onSave={() => {
  console.log('Configuration LLM sauvegardée');
}} />
```

### Utilisation dans le Chat

```typescript
// Sélection du modèle dans l'interface de chat
import { AIProviderSelect } from '@/components/chat/AIProviderSelect';

<AIProviderSelect 
  aiProvider={webUIConfig.model} 
  onProviderChange={handleProviderChange}
/>
```

### Paramètres Configurables

- **Mode** : auto/manuel
- **Température** : 0.0 - 1.0 (contrôle la créativité)
- **Tokens maximum** : limite de la longueur des réponses
- **Cache** : activation/désactivation du cache des réponses
- **Taille des lots** : optimisation du traitement par lots

### Bonnes Pratiques LLM

1. **Choix du Modèle**
   - Utilisez Ollama pour le développement local
   - Hugging Face pour les déploiements simples
   - OpenAI pour les cas nécessitant plus de performances

2. **Optimisation**
   - Activez le cache pour les requêtes fréquentes
   - Ajustez la température selon le cas d'usage
   - Utilisez le mode batch pour les traitements en lots

3. **Gestion des Erreurs**
   - Implémentez des retries pour les appels API
   - Gérez les timeouts appropriés
   - Prévoyez des fallbacks entre modèles



# Intégration Microsoft Teams

## Vue d'ensemble

L'intégration Microsoft Teams permet aux utilisateurs de connecter leur compte Microsoft, d'accéder à leurs fichiers Teams et conversations, et de les indexer pour la recherche sémantique.

## Flux d'authentification OAuth

L'authentification Microsoft utilise le protocole OAuth 2.0 avec le flux d'autorisation par code.

### 1. Initiation de l'authentification

```typescript
export const initiateMicrosoftAuth = async (userId: string, tenantId: string): Promise<string> => {
  if (!userId) {
    throw new Error("Utilisateur non connecté");
  }

  const redirectUri = getMicrosoftRedirectUrl();
  
  // Récupération du client ID via Edge Function
  const { data: authData, error: authError } = await supabase.functions.invoke('microsoft-oauth', {
    body: { 
      action: 'get_client_id',
      redirectUrl: redirectUri
    }
  });

  if (authError || !authData?.client_id) {
    throw new Error("Impossible de récupérer les informations d'authentification");
  }

  // Génération d'un état OAuth sécurisé pour prévenir les attaques CSRF
  const state = generateOAuthState('microsoft');

  // Demande de scopes nécessaires pour Teams
  const scopes = encodeURIComponent(
    'user.read ' +
    'Files.Read.All ' +
    'Sites.Read.All ' +
    'ChannelMessage.Read.All ' +
    'offline_access'
  );
  
  // Construction de l'URL d'autorisation
  const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?...`;

  return authUrl;
};
```

### 2. Gestion des tokens

À l'instar de Google Drive, le système gère les tokens d'accès Microsoft :

```typescript
export const checkMicrosoftTokenStatus = async (userId: string): Promise<{isValid: boolean, expiresIn?: number}> => {
  if (!userId) return { isValid: false };
  
  try {
    // Vérification du statut via Edge Function
    const { data, error } = await supabase.functions.invoke('microsoft-oauth', {
      body: { 
        action: 'check_token_status', 
        userId: userId
      }
    });
    
    if (error) {
      return { isValid: false };
    }
    
    return data || { isValid: false };
  } catch (e) {
    return { isValid: false };
  }
};

export const refreshMicrosoftToken = async (userId: string): Promise<boolean> => {
  // ... logique de rafraîchissement du token
};
```

## Hook React `useMicrosoftTeamsStatus`

Ce hook gère l'état de connexion à Microsoft Teams et expose des méthodes pour connecter/déconnecter le compte.

```typescript
export const useMicrosoftTeamsStatus = () => {
  // État local
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [connectionData, setConnectionData] = useState<ConnectionData | null>(null);
  
  // Récupération de l'utilisateur courant
  const { user } = useAuth();

  // Vérification de la connexion
  const checkMicrosoftTeamsConnection = useCallback(async () => {
    // ... logique similaire à Google Drive
  }, [user]);

  // Méthodes de connexion/déconnexion
  const reconnectMicrosoftTeams = async () => {
    // ... logique de reconnexion
  };

  const disconnectMicrosoftTeams = async () => {
    // ... logique de déconnexion
  };

  return {
    isConnected,
    isChecking,
    connectionData,
    checkMicrosoftTeamsConnection,
    reconnectMicrosoftTeams,
    disconnectMicrosoftTeams
  };
};
```

## Accès aux ressources Teams

L'intégration permet d'accéder à différentes ressources :

1. **Fichiers partagés** - Documents partagés dans les canaux Teams
2. **Conversations** - Messages échangés dans les canaux et chats privés
3. **Bibliothèques SharePoint** - Documents stockés dans SharePoint liés à Teams

## Spécificités de l'API Microsoft Graph

L'intégration utilise l'API Microsoft Graph, qui présente quelques particularités :

- Nécessité de spécifier le tenant ID pour l'authentification
- Gestion des permissions via des scopes spécifiques
- Accès aux conversations Teams via des endpoints dédiés

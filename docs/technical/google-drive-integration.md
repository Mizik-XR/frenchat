
# Intégration Google Drive

## Vue d'ensemble

L'intégration Google Drive permet aux utilisateurs de connecter leur compte Google, d'accéder à leurs fichiers et de les indexer pour la recherche sémantique.

## Flux d'authentification OAuth

```
┌─────────────┐    ┌─────────────┐    ┌───────────┐    ┌──────────────┐
│ Application │───►│ Edge        │───►│ Google    │───►│ Application   │
│ Client      │◄───│ Function    │◄───│ OAuth API │◄───│ (Callback)    │
└─────────────┘    └─────────────┘    └───────────┘    └──────────────┘
```

### 1. Initiation de l'authentification

```typescript
export const initiateGoogleDriveAuth = async (userId: string): Promise<string> => {
  if (!userId) {
    throw new Error("Utilisateur non connecté");
  }

  const redirectUri = getGoogleRedirectUrl();
  
  // Récupération du client ID via Edge Function
  const { data, error } = await supabase.functions.invoke('google-oauth', {
    body: { 
      action: 'get_client_id',
      redirectUrl: redirectUri
    }
  });

  if (error || !data?.client_id) {
    throw new Error("Impossible de récupérer les informations d'authentification");
  }

  // Génération d'un état OAuth sécurisé pour prévenir les attaques CSRF
  const state = generateOAuthState('google');
  
  // Construction de l'URL d'autorisation
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?...`;

  return authUrl;
};
```

### 2. Gestion des tokens

Le système gère les tokens d'accès et les refresh tokens :

```typescript
export const checkGoogleDriveTokenStatus = async (userId: string): Promise<{isValid: boolean, expiresIn?: number}> => {
  if (!userId) return { isValid: false };
  
  try {
    // Vérification du statut via Edge Function
    const { data, error } = await supabase.functions.invoke('google-oauth', {
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

export const refreshGoogleDriveToken = async (userId: string): Promise<boolean> => {
  // ... logique de rafraîchissement du token
};
```

## Hook React `useGoogleDriveStatus`

Ce hook gère l'état de connexion à Google Drive et expose des méthodes pour connecter/déconnecter le compte.

```typescript
export const useGoogleDriveStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [connectionData, setConnectionData] = useState<ConnectionData | null>(null);
  const { user } = useAuth();

  // Vérifie l'état de connexion à Google Drive
  const checkGoogleDriveConnection = useCallback(async () => {
    // ... logique de vérification
  }, [user]);

  // Reconnecte l'utilisateur à Google Drive
  const reconnectGoogleDrive = async () => {
    // ... logique de reconnexion
  };

  // Déconnecte l'utilisateur de Google Drive
  const disconnectGoogleDrive = async () => {
    // ... logique de déconnexion
  };

  return {
    isConnected,
    isChecking,
    connectionData,
    checkGoogleDriveConnection,
    reconnectGoogleDrive,
    disconnectGoogleDrive
  };
};
```

## Processus d'indexation

1. L'utilisateur autorise l'accès à son Google Drive
2. L'application récupère la liste des fichiers/dossiers accessibles
3. Les fichiers sont traités par lots via les Edge Functions
4. Le contenu est extrait, découpé en chunks et transformé en embeddings
5. Les embeddings sont stockés dans la base de données pour la recherche


import { supabase, EdgeFunctionResponse } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getRedirectUrl } from '@/utils/environmentUtils';
import { generateOAuthState, validateOAuthState } from '@/utils/oauthStateManager';

/**
 * Récupère l'URL de redirection pour l'authentification OAuth Google
 * @returns L'URL complète de redirection pour Google OAuth
 */
export const getGoogleRedirectUrl = (): string => {
  return getRedirectUrl('auth/google/callback');
};

/**
 * Initie le processus d'authentification Google Drive
 * @param userId L'ID de l'utilisateur actuel
 * @returns Promise avec l'URL d'authentification Google
 */
export const initiateGoogleDriveAuth = async (userId: string): Promise<string> => {
  if (!userId) {
    throw new Error("Utilisateur non connecté");
  }

  const redirectUri = getGoogleRedirectUrl();
  console.log("URL de redirection configurée:", redirectUri);
  
  type ClientIdResponse = { client_id: string };
  
  const { data: authData, error: authError } = await supabase.functions.invoke('unified-oauth-proxy', {
    body: { 
      provider: 'google',
      action: 'get_client_id',
      redirectUrl: redirectUri
    }
  }) as EdgeFunctionResponse<ClientIdResponse>;

  if (authError || !authData?.client_id) {
    throw new Error("Impossible de récupérer les informations d'authentification");
  }

  // Génération d'un état OAuth sécurisé pour prévenir les attaques CSRF
  const state = generateOAuthState('google');

  // Demande de scopes nécessaires pour Google Drive
  const scopes = encodeURIComponent(
    'https://www.googleapis.com/auth/userinfo.email ' +
    'https://www.googleapis.com/auth/userinfo.profile ' + 
    'https://www.googleapis.com/auth/drive.readonly ' +
    'https://www.googleapis.com/auth/drive.metadata.readonly'
  );
  
  const redirectUrl = encodeURIComponent(redirectUri);
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${authData.client_id}&` +
    `redirect_uri=${redirectUrl}&` +
    `response_type=code&` +
    `scope=${scopes}&` +
    `state=${encodeURIComponent(state)}&` +
    `access_type=offline&` +
    `prompt=consent`;

  return authUrl;
};

/**
 * Échange le code d'autorisation contre des tokens d'accès
 * @param code Le code d'autorisation retourné par Google
 * @param state L'état OAuth retourné par Google
 * @returns Promise avec les informations utilisateur Google
 */
export const exchangeGoogleAuthCode = async (code: string, state: string): Promise<any> => {
  // Vérification de l'état OAuth
  if (!validateOAuthState('google', state)) {
    toast({
      title: "Erreur d'authentification",
      description: "Session OAuth expirée ou invalide. Veuillez réessayer.",
      variant: "destructive"
    });
    throw new Error("État OAuth invalide");
  }

  const redirectUrl = getGoogleRedirectUrl();
  
  const { data, error } = await supabase.functions.invoke('unified-oauth-proxy', {
    body: { 
      provider: 'google',
      code: code, 
      redirectUrl: redirectUrl,
      state: state
    }
  });
  
  if (error || !data?.success) {
    console.error("Erreur lors de l'échange du code:", error || data?.error);
    throw new Error("Échec de l'authentification Google Drive");
  }
  
  return data.user_info;
};

/**
 * Révoque le token Google Drive et supprime les enregistrements locaux
 * @param userId L'ID de l'utilisateur actuel
 * @returns Promise indiquant le succès de l'opération
 */
export const revokeGoogleDriveAccess = async (userId: string): Promise<boolean> => {
  if (!userId) {
    return false;
  }

  // Appel sécurisé à l'Edge Function pour révoquer le token sans l'exposer côté client
  const { error: revokeError } = await supabase.functions.invoke('unified-oauth-proxy', {
    body: { 
      provider: 'google',
      action: 'revoke_token',
      userId: userId
    }
  });

  if (revokeError) {
    console.error("Erreur lors de la révocation du token:", revokeError);
    throw new Error(`Erreur lors de la révocation: ${revokeError.message}`);
  }
  
  return true;
};

/**
 * Vérifie l'état du token Google Drive et le rafraîchit si nécessaire
 * @param userId L'ID de l'utilisateur actuel
 * @returns Promise indiquant si le token est valide
 */
export const checkGoogleDriveTokenStatus = async (userId: string): Promise<{isValid: boolean, expiresIn?: number}> => {
  if (!userId) return { isValid: false };
  
  try {
    type TokenStatusResponse = {isValid: boolean, expiresIn?: number};
    
    const { data, error } = await supabase.functions.invoke('unified-oauth-proxy', {
      body: { 
        provider: 'google',
        action: 'check_token_status', 
        userId: userId
      }
    }) as EdgeFunctionResponse<TokenStatusResponse>;
    
    if (error) {
      console.error("Erreur lors de la vérification du token:", error);
      return { isValid: false };
    }
    
    return data || { isValid: false };
  } catch (e) {
    console.error("Exception lors de la vérification du token:", e);
    return { isValid: false };
  }
};

/**
 * Tente de rafraîchir un token Google Drive expiré
 * @param userId L'ID de l'utilisateur actuel
 * @returns Promise indiquant le succès du rafraîchissement
 */
export const refreshGoogleDriveToken = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    type RefreshResponse = {success: boolean};
    
    const { data: refreshData, error: refreshError } = await supabase.functions.invoke('unified-oauth-proxy', {
      body: { 
        provider: 'google',
        action: 'refresh_token', 
        userId: userId,
        redirectUrl: getGoogleRedirectUrl()
      }
    }) as EdgeFunctionResponse<RefreshResponse>;
    
    if (refreshError || !refreshData?.success) {
      console.error("Erreur lors du rafraîchissement du token:", refreshError || "Token non rafraîchi");
      return false;
    }
    
    console.log("Token rafraîchi avec succès");
    return true;
  } catch (e) {
    console.error("Exception lors du rafraîchissement du token:", e);
    return false;
  }
};

/**
 * Démarre l'indexation complète d'un dossier Google Drive
 * @param folderId ID du dossier Google Drive à indexer
 * @param options Options d'indexation (récursif, profondeur, etc.)
 * @returns Promise avec l'ID du processus d'indexation
 */
export const startGlobalDriveIndexing = async (folderId: string, options: IndexingOptions = {}): Promise<string> => {
  try {
    console.log(`Démarrage de l'indexation globale pour le dossier: ${folderId}`);
    
    const { data, error } = await supabase.functions.invoke('index-google-drive', {
      body: { 
        folderId, 
        options: {
          recursive: options.recursive !== false, // Par défaut true
          maxDepth: options.maxDepth || 10,
          batchSize: options.batchSize || 100,
          fileTypes: options.fileTypes || ['document', 'spreadsheet', 'presentation', 'pdf'],
          excludeFolders: options.excludeFolders || [],
          priorityKeywords: options.priorityKeywords || []
        }
      }
    });

    if (error) {
      console.error("Erreur lors du démarrage de l'indexation:", error);
      throw new Error(`Erreur d'indexation: ${error.message}`);
    }

    if (!data?.progressId) {
      throw new Error("Aucun ID de progression retourné");
    }

    console.log(`Indexation démarrée avec l'ID de progression: ${data.progressId}`);
    return data.progressId;
  } catch (e) {
    console.error("Exception lors du démarrage de l'indexation:", e);
    throw e;
  }
};

/**
 * Vérifie si une indexation est en cours pour un utilisateur
 * @param userId ID de l'utilisateur
 * @returns Promise avec les informations sur l'indexation en cours, ou null si aucune
 */
export const checkOngoingIndexing = async (userId: string): Promise<IndexingProgress | null> => {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      .from('indexing_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'running')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Aucun résultat trouvé, pas d'indexation en cours
        return null;
      }
      throw error;
    }
    
    return data as IndexingProgress;
  } catch (e) {
    console.error("Erreur lors de la vérification d'indexation en cours:", e);
    return null;
  }
};

/**
 * Arrête une indexation en cours
 * @param progressId ID du processus d'indexation
 * @returns Promise indiquant le succès de l'opération
 */
export const stopIndexing = async (progressId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.functions.invoke('index-google-drive', {
      body: { 
        action: 'stop',
        progressId
      }
    });
    
    if (error) {
      console.error("Erreur lors de l'arrêt de l'indexation:", error);
      return false;
    }
    
    return true;
  } catch (e) {
    console.error("Exception lors de l'arrêt de l'indexation:", e);
    return false;
  }
};

/**
 * Exporte un document vers Google Drive
 * @param userId ID de l'utilisateur
 * @param fileContent Contenu du fichier à exporter
 * @param fileName Nom du fichier
 * @param mimeType Type MIME du fichier
 * @param parentFolderId ID du dossier parent (optionnel)
 * @returns Promise avec les détails du fichier créé
 */
export const exportToGoogleDrive = async (
  userId: string,
  fileContent: string | Blob,
  fileName: string,
  mimeType = 'application/pdf',
  parentFolderId?: string
): Promise<any> => {
  try {
    const { data, error } = await supabase.functions.invoke('export-to-google-drive', {
      body: { 
        fileContent,
        fileName,
        mimeType,
        parentFolderId,
        userId
      }
    });
    
    if (error) {
      console.error("Erreur lors de l'export vers Google Drive:", error);
      throw new Error(`Erreur d'export: ${error.message}`);
    }
    
    return data;
  } catch (e) {
    console.error("Exception lors de l'export vers Google Drive:", e);
    throw e;
  }
};

/**
 * Vérifie et bascule automatiquement entre les modes local et cloud
 * @param userId ID de l'utilisateur
 * @returns Promise avec le mode actif détecté
 */
export const detectAndSwitchMode = async (userId: string): Promise<'local' | 'cloud'> => {
  try {
    // Vérifier si le service local est disponible
    const localAvailable = await checkLocalServiceAvailability();
    
    // Stocker la préférence de l'utilisateur
    if (localAvailable) {
      await storeUserPreference(userId, 'ai_service_mode', 'local');
      console.log("Mode local détecté et configuré");
      return 'local';
    } else {
      await storeUserPreference(userId, 'ai_service_mode', 'cloud');
      console.log("Mode cloud configuré (service local non disponible)");
      return 'cloud';
    }
  } catch (e) {
    console.error("Erreur lors de la détection du mode:", e);
    // Par défaut, utiliser le mode cloud en cas d'erreur
    return 'cloud';
  }
};

/**
 * Vérifie si le service IA local est disponible
 * @returns Promise indiquant si le service est disponible
 */
const checkLocalServiceAvailability = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch('http://localhost:8000/health', {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (e) {
    console.log("Service local non disponible:", e);
    return false;
  }
};

/**
 * Stocke une préférence utilisateur dans la base de données
 * @param userId ID de l'utilisateur
 * @param key Clé de la préférence
 * @param value Valeur de la préférence
 */
const storeUserPreference = async (userId: string, key: string, value: any): Promise<void> => {
  if (!userId) return;
  
  try {
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        preferences: { [key]: value },
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });
    
    if (error) throw error;
  } catch (e) {
    console.error("Erreur lors du stockage de la préférence:", e);
  }
};

/**
 * Options pour l'indexation de Google Drive
 */
export interface IndexingOptions {
  recursive?: boolean;
  maxDepth?: number;
  batchSize?: number;
  fileTypes?: string[];
  excludeFolders?: string[];
  priorityKeywords?: string[];
}

/**
 * Interface pour la progression d'indexation
 */
export interface IndexingProgress {
  id: string;
  user_id: string;
  status: 'running' | 'completed' | 'error' | 'paused';
  total_files?: number;
  processed_files?: number;
  current_folder?: string;
  parent_folder?: string;
  error?: string;
  created_at: string;
  updated_at: string;
  total?: number;
  processed?: number;
}

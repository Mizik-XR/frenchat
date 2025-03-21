
import { supabase } from '@/integrations/supabase/client';
import { EdgeFunctionResponse } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { generateOAuthState, validateOAuthState } from '@/utils/oauthStateManager';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  modifiedTime?: string;
  size?: number;
  parents?: string[];
}

interface DriveFolder {
  id: string;
  name: string;
  folderColorRgb?: string;
}

const BASE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.metadata.readonly'
].join(' ');

/**
 * Génère l'URL pour l'authentification OAuth Google Drive
 */
export const getGoogleDriveAuthUrl = async (redirectPath = '/google-auth-callback') => {
  try {
    const { data: config, error } = await supabase
      .from('service_configurations')
      .select('config')
      .eq('service_type', 'google_drive')
      .single();
    
    if (error || !config) {
      throw new Error('Configuration Google Drive non trouvée');
    }
    
    const clientId = config.config.client_id;
    if (!clientId) {
      throw new Error('ID client Google non configuré');
    }
    
    // Générer un état sécurisé
    const state = await generateOAuthState('google', redirectPath);
    
    // Construire l'URL d'autorisation
    const redirectUri = `${window.location.origin}/google-auth-callback`;
    const authUrl = new URL(BASE_OAUTH_URL);
    
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', SCOPES);
    authUrl.searchParams.append('access_type', 'offline');
    authUrl.searchParams.append('prompt', 'consent');
    authUrl.searchParams.append('state', state);
    
    return authUrl.toString();
  } catch (error) {
    console.error('Erreur lors de la génération de l\'URL d\'authentification:', error);
    toast({
      title: 'Erreur de configuration',
      description: 'Impossible de générer l\'URL d\'authentification Google Drive',
      variant: 'destructive'
    });
    return null;
  }
};

/**
 * Traite le retour d'authentification OAuth
 */
export const handleGoogleAuthCallback = async (params: URLSearchParams) => {
  const code = params.get('code');
  const stateId = params.get('state');
  const error = params.get('error');
  
  if (error) {
    toast({
      title: 'Erreur d\'authentification',
      description: `Google a retourné une erreur: ${error}`,
      variant: 'destructive'
    });
    return { success: false, error };
  }
  
  if (!code || !stateId) {
    toast({
      title: 'Erreur d\'authentification',
      description: 'Paramètres manquants dans la réponse',
      variant: 'destructive'
    });
    return { success: false, error: 'Paramètres manquants' };
  }
  
  // Valider l'état pour éviter les attaques CSRF
  const { isValid, redirectPath } = validateOAuthState(stateId);
  
  if (!isValid) {
    toast({
      title: 'Erreur de sécurité',
      description: 'La validation de la session a échoué',
      variant: 'destructive'
    });
    return { success: false, error: 'État invalide' };
  }
  
  try {
    // Échanger le code contre un token via la fonction Edge
    const { data, error: exchangeError } = await supabase.functions.invoke('google-oauth', {
      body: { code, redirect_uri: `${window.location.origin}/google-auth-callback` }
    });
    
    if (exchangeError || !data?.success) {
      throw new Error(exchangeError || 'Échec de l\'échange de code');
    }
    
    toast({
      title: 'Connexion réussie',
      description: 'Votre compte Google Drive a été connecté avec succès',
    });
    
    return { success: true, redirectPath };
  } catch (error) {
    console.error('Erreur lors de l\'échange du code:', error);
    toast({
      title: 'Erreur d\'authentification',
      description: 'Impossible d\'échanger le code d\'autorisation',
      variant: 'destructive'
    });
    return { success: false, error };
  }
};

/**
 * Récupère les dossiers racine de Google Drive
 */
export const getRootFolders = async (): Promise<DriveFolder[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-google-drive-root');
    
    if (error) throw error;
    return data?.folders || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des dossiers racine:', error);
    return [];
  }
};

/**
 * Récupère les fichiers et sous-dossiers d'un dossier Google Drive
 */
export const getFolderContents = async (folderId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('index-google-drive', {
      body: { folder_id: folderId, depth: 1 }
    });
    
    if (error) throw error;
    
    return {
      files: data?.files || [],
      folders: data?.folders || []
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du contenu du dossier:', error);
    return { files: [], folders: [] };
  }
};

/**
 * Indexe un dossier Google Drive (analyse récursive)
 */
export const indexFolder = async (folderId: string, depth = 3) => {
  try {
    const { data, error } = await supabase.functions.invoke('batch-index-google-drive', {
      body: { folder_id: folderId, depth, process_files: true }
    });
    
    if (error) throw error;
    
    return { 
      success: true, 
      indexId: data?.indexId,
      message: `Indexation du dossier ${folderId} démarrée` 
    };
  } catch (error) {
    console.error('Erreur lors de l\'indexation du dossier:', error);
    return { 
      success: false, 
      message: 'Erreur lors de l\'indexation du dossier' 
    };
  }
};

/**
 * Convertit un fichier Google Drive au format demandé
 */
export const exportDriveFile = async (fileId: string, mimeType: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('export-google-drive', {
      body: { file_id: fileId, mime_type: mimeType }
    });
    
    if (error) throw error;
    
    return {
      success: true,
      fileData: data.folderId
    };
  } catch (error) {
    console.error('Erreur lors de l\'exportation du fichier:', error);
    return { success: false };
  }
};

export default {
  getGoogleDriveAuthUrl,
  handleGoogleAuthCallback,
  getRootFolders,
  getFolderContents,
  indexFolder,
  exportDriveFile
};


import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/types/database';

export interface FolderPermissions {
  can_read: boolean;
  can_query: boolean;
  can_reindex: boolean;
}

export interface Folder {
  id: string;
  name: string;
  path: string;
  metadata?: Record<string, any>;
  is_shared?: boolean;
  shared_with?: string[];
  permissions?: FolderPermissions;
  owner_email?: string;
}

export function useGoogleDriveFolders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [sharedFolders, setSharedFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSharedLoading, setIsSharedLoading] = useState(false);

  // Fonction optimisée pour récupérer les dossiers personnels
  const fetchFolders = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('google_drive_folders')
        .select('folder_id, name, path, metadata, is_shared, shared_with, permissions')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      
      setFolders(data.map(folder => ({
        id: folder.folder_id,
        name: folder.name,
        path: folder.path || folder.name,
        metadata: folder.metadata as Record<string, any>,
        is_shared: folder.is_shared,
        shared_with: folder.shared_with,
        permissions: folder.permissions as FolderPermissions
      })));
    } catch (error) {
      console.error('Erreur lors du chargement des dossiers:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les dossiers Google Drive",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Nouvelle fonction pour récupérer les dossiers partagés avec l'utilisateur
  const fetchSharedWithMe = useCallback(async () => {
    if (!user?.email) return;
    
    setIsSharedLoading(true);
    try {
      // Utilise l'index GIN sur shared_with pour optimiser la recherche
      const { data, error } = await supabase
        .from('google_drive_folders')
        .select('id, folder_id, name, path, metadata, shared_with, permissions, user_id')
        .neq('user_id', user.id)
        .eq('is_shared', true)
        .filter('shared_with', 'cs', `{${user.email}}`)
        .order('name');

      if (error) throw error;
      
      // Récupérer les emails des propriétaires
      const ownerIds = [...new Set(data.map(folder => folder.user_id))];
      const { data: ownerData, error: ownerError } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', ownerIds);

      if (ownerError) throw ownerError;
      
      // Créer un dictionnaire d'ID -> email
      const ownerEmailMap = (ownerData || []).reduce((acc, owner) => {
        acc[owner.id] = owner.email;
        return acc;
      }, {} as Record<string, string>);
      
      setSharedFolders(data.map(folder => ({
        id: folder.folder_id,
        name: folder.name,
        path: folder.path || folder.name,
        metadata: folder.metadata as Record<string, any>,
        is_shared: true,
        shared_with: folder.shared_with,
        permissions: folder.permissions as FolderPermissions,
        owner_email: ownerEmailMap[folder.user_id]
      })));
    } catch (error) {
      console.error('Erreur lors du chargement des dossiers partagés:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les dossiers partagés",
        variant: "destructive",
      });
    } finally {
      setIsSharedLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchFolders();
    fetchSharedWithMe();
  }, [fetchFolders, fetchSharedWithMe]);

  // Mise à jour des permissions d'un dossier partagé
  const updateFolderPermissions = async (folderId: string, permissions: Partial<FolderPermissions>) => {
    if (!user) return false;
    
    try {
      const { data: folderData, error: folderError } = await supabase
        .from('google_drive_folders')
        .select('permissions')
        .eq('folder_id', folderId)
        .single();
      
      if (folderError) throw folderError;
      
      // Fusion des permissions existantes avec les nouvelles
      const updatedPermissions = {
        ...folderData.permissions,
        ...permissions
      };
      
      const { error } = await supabase
        .from('google_drive_folders')
        .update({ permissions: updatedPermissions })
        .eq('folder_id', folderId);
      
      if (error) throw error;
      
      toast({
        title: "Permissions mises à jour",
        description: "Les permissions du dossier ont été mises à jour avec succès",
      });
      
      // Actualiser les listes
      fetchFolders();
      fetchSharedWithMe();
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des permissions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les permissions du dossier",
        variant: "destructive",
      });
      return false;
    }
  };

  // Fonction pour arrêter de partager un dossier
  const stopSharingFolder = async (folderId: string) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('google_drive_folders')
        .update({ 
          is_shared: false,
          shared_with: null 
        })
        .eq('folder_id', folderId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Partage désactivé",
        description: "Le dossier n'est plus partagé",
      });
      
      // Actualiser les listes
      fetchFolders();
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la désactivation du partage:', error);
      toast({
        title: "Erreur",
        description: "Impossible de désactiver le partage du dossier",
        variant: "destructive",
      });
      return false;
    }
  };

  // Fonction pour mettre à jour la liste des personnes avec qui un dossier est partagé
  const updateSharedWith = async (folderId: string, emails: string[]) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('google_drive_folders')
        .update({ 
          is_shared: emails.length > 0,
          shared_with: emails.length > 0 ? emails : null 
        })
        .eq('folder_id', folderId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Partage mis à jour",
        description: `Le dossier est maintenant partagé avec ${emails.length} personne(s)`,
      });
      
      // Actualiser les listes
      fetchFolders();
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du partage:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le partage du dossier",
        variant: "destructive",
      });
      return false;
    }
  };

  const refreshFolders = () => {
    fetchFolders();
    fetchSharedWithMe();
  };

  return { 
    folders, 
    sharedFolders,
    isLoading, 
    isSharedLoading,
    refreshFolders,
    updateFolderPermissions,
    stopSharingFolder,
    updateSharedWith
  };
}

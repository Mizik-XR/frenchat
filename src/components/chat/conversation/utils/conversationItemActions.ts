
import { toast } from "@/hooks/use-toast";
import { Conversation } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const handlePinConversation = (
  conversation: Conversation,
  onUpdateConversation: (params: { id: string; isPinned?: boolean }) => void
) => {
  onUpdateConversation({ id: conversation.id, isPinned: !conversation.isPinned });
  toast({
    title: conversation.isPinned ? "Conversation désépinglée" : "Conversation épinglée",
    description: conversation.isPinned ? 
      "La conversation n'apparaîtra plus en haut de la liste" : 
      "La conversation apparaîtra en haut de la liste"
  });
};

export const handleArchiveConversation = (
  conversation: Conversation,
  onUpdateConversation: (params: { id: string; isArchived?: boolean }) => void
) => {
  onUpdateConversation({ id: conversation.id, isArchived: !conversation.isArchived });
  toast({
    title: conversation.isArchived ? "Conversation désarchivée" : "Conversation archivée",
    description: conversation.isArchived ?
      "La conversation est de nouveau active" :
      "La conversation a été déplacée dans les archives"
  });
};

export const handleExportDocument = (
  onExportToDoc: ((id: string) => void) | undefined,
  conversationId: string
) => {
  if (onExportToDoc) {
    onExportToDoc(conversationId);
    toast({
      title: "Export en cours",
      description: "Le document est en cours de génération..."
    });
  }
};

export const handleExportToDrive = async (
  isDriveConnected: boolean,
  conversationId: string,
  title: string
) => {
  if (!isDriveConnected) {
    toast({
      title: "Google Drive non connecté",
      description: "Veuillez connecter votre compte Google Drive pour utiliser cette fonctionnalité",
      variant: "destructive"
    });
    return false;
  }

  try {
    // Appel à l'Edge Function pour exporter vers Google Drive
    const { data, error } = await supabase.functions.invoke('export-to-google-drive', {
      body: { 
        conversationId,
        title
      }
    });

    if (error) throw error;
    
    toast({
      title: "Export réussi",
      description: "La conversation a été exportée vers Google Drive avec succès",
    });
    return true;
  } catch (error) {
    console.error("Erreur lors de l'export vers Google Drive:", error);
    toast({
      title: "Erreur d'export",
      description: "Impossible d'exporter la conversation vers Google Drive",
      variant: "destructive"
    });
    return false;
  }
};

export const handleDeleteConversation = (
  onDelete: ((id: string) => void) | undefined,
  conversationId: string
) => {
  if (onDelete) {
    // Confirmation avant suppression
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette conversation ? Cette action est irréversible.")) {
      onDelete(conversationId);
      toast({
        title: "Conversation supprimée",
        description: "La conversation a été définitivement supprimée",
        variant: "destructive"
      });
      return true;
    }
  }
  return false;
};

export const formatConversationDate = (timestamp: number) => {
  return format(
    new Date(timestamp), 
    'dd MMM yyyy', 
    { locale: fr }
  );
};

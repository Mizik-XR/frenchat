
import { useState, useEffect  } from '@/core/reactInstance';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Template {
  id: string;
  name: string;
  description: string | null;
  template_type: string;
  content_structure: any;
  user_id?: string;
}

export const useTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        console.warn("Aucun utilisateur connecté pour charger les templates");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('user_id', userData.user.id);

      if (error) throw error;

      setTemplates(data);
    } catch (error) {
      console.error("Erreur lors du chargement des templates:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les templates",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplate = async (template: Template) => {
    setIsLoading(true);
    try {
      // Récupérer l'utilisateur actuel
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error("Utilisateur non connecté");
      
      // Préparer l'objet à sauvegarder
      const templateToSave = {
        ...template,
        user_id: userData.user.id
      };

      const { error } = await supabase
        .from('document_templates')
        .upsert(templateToSave);

      if (error) throw error;

      toast({
        title: "Template sauvegardé",
        description: "Le template a été mis à jour avec succès"
      });

      loadTemplates();
      return true;
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le template",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error("Utilisateur non connecté");

      const { error } = await supabase
        .from('document_templates')
        .delete()
        .eq('id', id)
        .eq('user_id', userData.user.id);

      if (error) throw error;

      setTemplates(templates.filter(t => t.id !== id));
      toast({
        title: "Template supprimé",
        description: "Le template a été supprimé avec succès"
      });
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le template",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    templates,
    isLoading,
    loadTemplates,
    saveTemplate,
    deleteTemplate
  };
};

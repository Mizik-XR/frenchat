
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Template } from '@/components/documents/template/types';

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);

  const loadTemplates = useCallback(async () => {
    const { data, error } = await supabase
      .from('document_templates')
      .select('*');

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les templates",
        variant: "destructive"
      });
      return;
    }

    setTemplates(data);
  }, []);

  const saveTemplate = useCallback(async (template: Template) => {
    try {
      const { error } = await supabase
        .from('document_templates')
        .upsert({
          ...template,
          id: template.id || undefined
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Template sauvegardé avec succès"
      });

      await loadTemplates();
      return true;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le template",
        variant: "destructive"
      });
      return false;
    }
  }, [loadTemplates]);

  const deleteTemplate = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('document_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Template supprimé avec succès"
      });

      await loadTemplates();
      return true;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le template",
        variant: "destructive"
      });
      return false;
    }
  }, [loadTemplates]);

  return {
    templates,
    loadTemplates,
    saveTemplate,
    deleteTemplate
  };
}

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Save, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useRAG } from "@/hooks/use-rag";

interface Template {
  id: string;
  name: string;
  description: string | null;
  template_type: string;
  content_structure: Record<string, any>;
}

export function TemplateManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { generateFromTemplate } = useRAG();
  const [generationQuery, setGenerationQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
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
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate({
      id: '',
      name: 'Nouveau template',
      description: '',
      template_type: 'default',
      content_structure: {
        title: { type: 'text', instructions: "Générer un titre accrocheur" },
        introduction: { type: 'text', instructions: "Écrire une introduction claire" },
        content: { type: 'text', instructions: "Développer le contenu principal" },
        conclusion: { type: 'text', instructions: "Conclure de manière impactante" }
      }
    });
    setIsEditing(true);
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      const { error } = await supabase
        .from('document_templates')
        .upsert({
          ...selectedTemplate,
          id: selectedTemplate.id || undefined
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Template sauvegardé avec succès"
      });

      loadTemplates();
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le template",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTemplate = async (id: string) => {
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

      loadTemplates();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le template",
        variant: "destructive"
      });
    }
  };

  const handleGenerate = async (templateId: string) => {
    if (!generationQuery.trim()) {
      toast({
        title: "Requête requise",
        description: "Veuillez entrer une requête pour la génération",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      await generateFromTemplate(templateId, generationQuery);
    } finally {
      setIsGenerating(false);
      setGenerationQuery('');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Gestionnaire de Templates</CardTitle>
          <Button onClick={handleCreateTemplate}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Nouveau Template
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing && selectedTemplate ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nom du template</Label>
              <Input
                id="name"
                value={selectedTemplate.name}
                onChange={(e) => setSelectedTemplate({
                  ...selectedTemplate,
                  name: e.target.value
                })}
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={selectedTemplate.description || ''}
                onChange={(e) => setSelectedTemplate({
                  ...selectedTemplate,
                  description: e.target.value
                })}
              />
            </div>

            <div>
              <Label htmlFor="structure">Structure (JSON)</Label>
              <Textarea
                id="structure"
                value={JSON.stringify(selectedTemplate.content_structure, null, 2)}
                onChange={(e) => {
                  try {
                    const structure = JSON.parse(e.target.value);
                    setSelectedTemplate({
                      ...selectedTemplate,
                      content_structure: structure
                    });
                  } catch (error) {
                    // Ignorer les erreurs de parsing pendant l'édition
                  }
                }}
                className="font-mono"
                rows={10}
              />
            </div>

            <Button onClick={handleSaveTemplate}>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((template) => (
              <Card key={template.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{template.name}</h3>
                    <p className="text-sm text-gray-500">{template.description}</p>
                  </div>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setIsEditing(true);
                      }}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Input
                    placeholder="Entrez votre requête pour générer un document..."
                    value={generationQuery}
                    onChange={(e) => setGenerationQuery(e.target.value)}
                  />
                  <Button
                    onClick={() => handleGenerate(template.id)}
                    disabled={isGenerating}
                  >
                    {isGenerating ? 'Génération...' : 'Générer un Document'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

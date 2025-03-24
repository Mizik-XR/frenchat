
import { useEffect, useState  } from '@/core/reactInstance';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Template } from './types';
import { TemplateForm } from './TemplateForm';
import { TemplateCard } from './TemplateCard';
import { useTemplates } from '@/hooks/useTemplates';

export function TemplateManager() {
  const { templates, loadTemplates, saveTemplate, deleteTemplate } = useTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

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
    const success = await saveTemplate(selectedTemplate);
    if (success) {
      setIsEditing(false);
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
          <TemplateForm
            template={selectedTemplate}
            onTemplateChange={setSelectedTemplate}
            onSave={handleSaveTemplate}
          />
        ) : (
          <div className="space-y-4">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onEdit={() => {
                  setSelectedTemplate(template);
                  setIsEditing(true);
                }}
                onDelete={() => deleteTemplate(template.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

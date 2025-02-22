
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface DocumentPreviewProps {
  file: File;
}

export const DocumentPreview = ({ file }: DocumentPreviewProps) => {
  const [preview, setPreview] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [isEdited, setIsEdited] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!file) return;

    // Prévisualisation pour les images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    // Prévisualisation pour les fichiers texte
    if (file.type === 'text/plain' || file.type === 'text/markdown') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setContent(reader.result as string);
        setIsEdited(false);
      };
      reader.readAsText(file);
    }
  }, [file]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsEdited(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Création d'un nouveau fichier avec le contenu modifié
      const blob = new Blob([content], { type: file.type });
      const newFile = new File([blob], file.name, { type: file.type });
      
      // TODO: Implémenter la sauvegarde dans Supabase ici
      // Pour l'instant, on simule une sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEdited(false);
      toast({
        title: "Modifications enregistrées",
        description: "Le document a été mis à jour avec succès."
      });
    } catch (error) {
      toast({
        title: "Erreur lors de la sauvegarde",
        description: "Une erreur est survenue lors de l'enregistrement des modifications.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const renderPreview = () => {
    if (file.type.startsWith('image/')) {
      return (
        <div className="flex justify-center animate-fadeIn">
          <img
            src={preview}
            alt="Prévisualisation"
            className="max-w-full max-h-[500px] object-contain transition-all duration-300 hover:scale-105"
          />
        </div>
      );
    }

    if (file.type === 'application/pdf') {
      return (
        <iframe
          src={URL.createObjectURL(file)}
          className="w-full h-[500px] animate-slideIn"
          title="PDF preview"
        />
      );
    }

    if (file.type === 'text/plain' || file.type === 'text/markdown') {
      return (
        <Tabs defaultValue="preview" className="w-full animate-fadeIn">
          <TabsList>
            <TabsTrigger value="preview">Prévisualisation</TabsTrigger>
            <TabsTrigger value="edit">Éditer</TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="animate-fadeIn">
            <Card className="p-4">
              <pre className="whitespace-pre-wrap">{content}</pre>
            </Card>
          </TabsContent>
          <TabsContent value="edit" className="animate-fadeIn">
            <div className="space-y-4">
              <Textarea
                value={content}
                onChange={handleContentChange}
                className="min-h-[400px] font-mono resize-vertical"
              />
              {isEdited && (
                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="animate-scale-in"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      );
    }

    return (
      <div className="text-center p-4 text-gray-500 animate-fadeIn">
        Prévisualisation non disponible pour ce type de fichier
      </div>
    );
  };

  return (
    <div className="w-full">
      {renderPreview()}
    </div>
  );
};

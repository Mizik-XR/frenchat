
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface DocumentPreviewProps {
  file: File;
}

export const DocumentPreview = ({ file }: DocumentPreviewProps) => {
  const [preview, setPreview] = useState<string>('');
  const [content, setContent] = useState<string>('');

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
      };
      reader.readAsText(file);
    }
  }, [file]);

  const renderPreview = () => {
    if (file.type.startsWith('image/')) {
      return (
        <div className="flex justify-center">
          <img
            src={preview}
            alt="Prévisualisation"
            className="max-w-full max-h-[500px] object-contain"
          />
        </div>
      );
    }

    if (file.type === 'application/pdf') {
      return (
        <iframe
          src={URL.createObjectURL(file)}
          className="w-full h-[500px]"
          title="PDF preview"
        />
      );
    }

    if (file.type === 'text/plain' || file.type === 'text/markdown') {
      return (
        <Tabs defaultValue="preview" className="w-full">
          <TabsList>
            <TabsTrigger value="preview">Prévisualisation</TabsTrigger>
            <TabsTrigger value="edit">Éditer</TabsTrigger>
          </TabsList>
          <TabsContent value="preview">
            <Card className="p-4">
              <pre className="whitespace-pre-wrap">{content}</pre>
            </Card>
          </TabsContent>
          <TabsContent value="edit">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[400px] font-mono"
            />
          </TabsContent>
        </Tabs>
      );
    }

    return (
      <div className="text-center p-4 text-gray-500">
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

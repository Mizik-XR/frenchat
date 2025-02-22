
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUploader } from '../config/ImportMethod/FileUploader';
import { DocumentPreview } from './DocumentPreview';
import { DocumentList } from './DocumentList';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Loader2 } from 'lucide-react';

export const DocumentManager = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const { user } = useAuth();

  const handleFilesSelected = async (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const uploadDocument = async (file: File) => {
    if (!user) return;

    setIsUploading(true);
    try {
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      
      // Upload du fichier dans le bucket
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Création de l'entrée dans la base de données
      const { data: documentData, error: dbError } = await supabase
        .from('uploaded_documents')
        .insert({
          title: file.name,
          file_path: filePath,
          file_type: file.name.split('.').pop() || '',
          mime_type: file.type,
          size: file.size,
          user_id: user.id
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast({
        title: "Document téléchargé",
        description: "Le document a été téléchargé avec succès.",
      });

      // Mise à jour de la liste des documents
      setDocuments(prev => [...prev, documentData]);
      setSelectedFile(null);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du téléchargement.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Gestionnaire de documents</h2>
        <FileUploader
          onFilesSelected={handleFilesSelected}
          loading={isUploading}
        />
      </Card>

      {selectedFile && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Prévisualisation</h3>
          <DocumentPreview file={selectedFile} />
          <div className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setSelectedFile(null)}>
              Annuler
            </Button>
            <Button 
              onClick={() => selectedFile && uploadDocument(selectedFile)}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Téléchargement...
                </>
              ) : (
                'Télécharger'
              )}
            </Button>
          </div>
        </Card>
      )}

      <DocumentList documents={documents} />
    </div>
  );
};

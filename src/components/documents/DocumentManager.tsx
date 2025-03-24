import React, { useState, useEffect } from '@/core/reactInstance';
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
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [documentContent, setDocumentContent] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (selectedDocumentId) {
      fetchDocumentContent(selectedDocumentId);
    }
  }, [selectedDocumentId]);

  const fetchDocumentContent = async (docId: string) => {
    if (!user) return;

    try {
      const { data: document, error: documentError } = await supabase
        .from('indexed_documents')
        .select('*')
        .eq('id', docId)
        .single();

      if (documentError) throw documentError;

      const contentText = document.content_text;

      setDocumentContent(contentText || "Ce document n'a pas de contenu");
    } catch (error: any) {
      console.error('Erreur lors de la récupération du contenu:', error);
      setDocumentContent("Impossible de charger le contenu du document");
      toast({
        title: "Erreur",
        description: "Impossible de charger le contenu du document",
        variant: "destructive",
      });
    }
  };

  const handleFilesSelected = async (files: File[]) => {
    if (files.length > 0) {
      await uploadDocument(files[0]);
    }
  };

  const uploadDocument = async (file: File) => {
    if (!user) return;

    setIsUploading(true);
    try {
      const filePath = `${user.id}/${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('indexed_documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: documentData, error: dbError } = await supabase
        .from('indexed_documents')
        .insert({
          title: file.name,
          file_path: filePath,
          mime_type: file.type,
          file_size: file.size,
          user_id: user.id,
          status: 'pending',
          provider_type: 'local'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast({
        title: "Document téléchargé",
        description: "Le document a été téléchargé avec succès.",
      });

      setDocuments(prev => [...prev, documentData]);
      setSelectedDocumentId(documentData.id);
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

      {selectedDocumentId && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Prévisualisation</h3>
          <DocumentPreview 
            documentId={selectedDocumentId} 
            content={documentContent}
          />
        </Card>
      )}

      <DocumentList documents={documents} onSelect={setSelectedDocumentId} />
    </div>
  );
};


import { useState } from 'react';
import { useOpenAIRag } from '@/utils/openai/openaiRagClient';
import { useAuth } from '@/components/AuthProvider';
import { toast } from '@/hooks/use-toast';

export const useOpenAIRagHook = () => {
  const { user } = useAuth();
  const openAIRag = useOpenAIRag(user?.id);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const queryDocument = async (documentContent: string, query: string) => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await openAIRag.queryDocument(documentContent, query);
      setResult(response);
      return response;
    } catch (error) {
      console.error("Erreur lors de l'interrogation du document avec OpenAI RAG:", error);
      toast({
        title: "Erreur d'interrogation",
        description: "Une erreur est survenue lors de l'interrogation du document",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const createAssistantWithFiles = async (
    name: string, 
    instructions: string, 
    fileContents: { content: string, filename: string }[]
  ) => {
    setIsLoading(true);
    
    try {
      // Créer les fichiers
      const fileIds = [];
      for (const file of fileContents) {
        const fileId = await openAIRag.createFile(file.content, file.filename);
        if (fileId) fileIds.push(fileId);
      }
      
      if (fileIds.length === 0) {
        throw new Error("Aucun fichier n'a pu être créé");
      }
      
      // Créer l'assistant
      const assistantId = await openAIRag.createAssistant(name, instructions, fileIds);
      
      if (!assistantId) {
        throw new Error("Impossible de créer l'assistant");
      }
      
      // Créer un thread pour cet assistant
      const threadId = await openAIRag.createThread();
      
      if (!threadId) {
        throw new Error("Impossible de créer le thread");
      }
      
      return {
        assistantId,
        threadId,
        fileIds
      };
    } catch (error) {
      console.error("Erreur lors de la création de l'assistant:", error);
      toast({
        title: "Erreur de création",
        description: "Une erreur est survenue lors de la création de l'assistant",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const sendMessageToAssistant = async (
    threadId: string,
    assistantId: string,
    message: string
  ) => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await openAIRag.sendMessage(threadId, assistantId, message);
      setResult(response);
      return response;
    } catch (error) {
      console.error("Erreur lors de l'envoi du message à l'assistant:", error);
      toast({
        title: "Erreur d'envoi",
        description: "Une erreur est survenue lors de l'envoi du message",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    queryDocument,
    createAssistantWithFiles,
    sendMessageToAssistant,
    isLoading,
    result
  };
};

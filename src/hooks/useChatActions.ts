
import { useState } from "react";
import { AnalysisMode, WebUIConfig, Message } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useChatActions(
  selectedConversationId: string | null,
  webUIConfig: WebUIConfig,
  processMessage: (message: string, config: WebUIConfig, documentId: string | null, context?: string) => Promise<any>,
  clearMessages: () => void,
  createNewConversation: (config: WebUIConfig) => Promise<any>,
  messages: Message[]
) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent, input: string, setInput: (input: string) => void, selectedDocumentId: string | null, llmStatus: string) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (llmStatus !== 'configured') {
      toast({
        title: "Configuration requise",
        description: "Veuillez configurer un modèle de langage dans les paramètres",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      let currentConversationId = selectedConversationId;
      if (!currentConversationId) {
        const newConv = await createNewConversation(webUIConfig);
        currentConversationId = newConv.id;
      }

      const conversationContext = webUIConfig.useMemory 
        ? messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')
        : '';

      const message = input;
      setInput('');
      
      await processMessage(
        message, 
        webUIConfig,
        selectedDocumentId,
        conversationContext
      );
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetConversation = () => {
    clearMessages();
    toast({
      title: "Conversation réinitialisée",
      description: "L'historique a été effacé",
    });
  };

  const handleAnalysisModeChange = (mode: AnalysisMode) => {
    toast({
      title: "Mode d'analyse modifié",
      description: `Mode ${mode} activé`,
    });
    return mode;
  };

  const handleFilesSelected = async (files: File[]) => {
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        await supabase.functions.invoke('upload-chat-file', {
          body: formData
        });

        toast({
          title: "Fichier ajouté",
          description: `${file.name} a été uploadé avec succès`,
        });
      }
      return true;
    } catch (error) {
      toast({
        title: "Erreur d'upload",
        description: "Une erreur est survenue lors de l'upload du fichier",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    isProcessing,
    handleSubmit,
    handleResetConversation,
    handleAnalysisModeChange,
    handleFilesSelected
  };
}

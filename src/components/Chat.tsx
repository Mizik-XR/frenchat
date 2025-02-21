
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { AIProvider, WebUIConfig, Message } from "@/types/chat";
import { useHuggingFace } from "@/hooks/useHuggingFace";
import { useServiceConfig } from '@/hooks/useServiceConfig';
import { useChatMessages } from '@/hooks/useChatMessages';
import { ChatHeader } from "./chat/ChatHeader";
import { ChatInput } from "./chat/ChatInput";
import { SettingsPanel } from "./chat/SettingsPanel";
import { MessageList } from "./chat/MessageList";

import "@/styles/chat.css";

export const Chat = () => {
  const [input, setInput] = useState('');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  const [webUIConfig, setWebUIConfig] = useState<WebUIConfig>({
    mode: 'auto',
    model: 'huggingface',
    maxTokens: 2000,
    temperature: 0.7,
    streamResponse: true
  });

  const {
    messages,
    isLoading,
    setIsLoading,
    addUserMessage,
    updateLastMessage,
    setAssistantResponse
  } = useChatMessages();

  const huggingFaceModel = useHuggingFace('huggingface');
  const { saveConfig, getConfig } = useServiceConfig();

  const handleProviderChange = (provider: AIProvider) => {
    setWebUIConfig(prev => ({ ...prev, model: provider }));
    toast({
      title: "Modèle IA changé",
      description: `Modèle changé pour : ${provider}`,
    });
  };

  const { data: documents } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('id, title, content');
      if (error) throw error;
      return data;
    }
  });

  const determineProvider = async (message: string) => {
    if (webUIConfig.mode === 'manual') {
      return webUIConfig.model;
    }

    // Mode auto : analyse le message pour choisir le meilleur modèle
    if (message.toLowerCase().includes('image') || message.toLowerCase().includes('graphique')) {
      return 'openai'; // Pour la génération d'images
    } else if (message.toLowerCase().includes('document') || message.toLowerCase().includes('fichier')) {
      return selectedDocumentId ? 'google_drive' : 'microsoft_teams';
    }
    return 'huggingface'; // Modèle par défaut pour le texte
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);
    addUserMessage(message);
    setInput('');

    try {
      let context = '';
      if (selectedDocumentId && documents) {
        const selectedDoc = documents.find(doc => doc.id === selectedDocumentId);
        if (selectedDoc) {
          context = `Document analysé: ${selectedDoc.title}\nContenu: ${selectedDoc.content}`;
        }
      }

      const provider = await determineProvider(message);
      const prompt = context 
        ? `[INST] Context: ${context}\n\nQuestion: ${message} [/INST]`
        : `[INST] ${message} [/INST]`;

      if (webUIConfig.streamResponse) {
        let partialResponse = '';
        const words = "Traitement de votre demande...".split(' ');
        
        for (const word of words) {
          partialResponse += word + ' ';
          updateLastMessage(partialResponse, context);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      let result;
      switch (provider) {
        case 'google_drive':
        case 'microsoft_teams':
          // Logique pour interroger les documents
          break;
        case 'openai':
          // Logique pour génération d'images ou texte avancé
          break;
        default:
          result = await huggingFaceModel(prompt, {
            max_length: webUIConfig.maxTokens,
            temperature: webUIConfig.temperature,
            top_p: 0.95,
          });
      }

      setAssistantResponse(result ? result[0].generated_text : "Je n'ai pas pu traiter votre demande.", context);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleWebUIConfigChange = (config: Partial<WebUIConfig>) => {
    setWebUIConfig(prev => ({ ...prev, ...config }));
  };

  useEffect(() => {
    toast({
      title: "Chat initialisé",
      description: "Interface de chat chargée avec succès",
    });
  }, []);

  return (
    <Card className="flex flex-col h-[600px] p-4 relative bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-lg">
      <ChatHeader 
        mode={webUIConfig.mode}
        onModeChange={(mode) => handleWebUIConfigChange({ mode })}
        onToggleSettings={() => setShowSettings(!showSettings)} 
      />

      {showSettings && (
        <SettingsPanel
          webUIConfig={webUIConfig}
          onWebUIConfigChange={handleWebUIConfigChange}
          onProviderChange={handleProviderChange}
        />
      )}

      <div className="flex-1 overflow-y-auto mb-4 bg-white/60 rounded-lg p-4">
        <MessageList messages={messages} />
      </div>

      <ChatInput
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        selectedDocumentId={selectedDocumentId}
        onSubmit={handleSubmit}
      />
    </Card>
  );
};

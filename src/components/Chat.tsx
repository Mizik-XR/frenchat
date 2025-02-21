
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { AIProvider, WebUIConfig } from "@/types/chat";
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

      const result = await huggingFaceModel(prompt, {
        max_length: webUIConfig.maxTokens,
        temperature: webUIConfig.temperature,
        top_p: 0.95,
      });

      setAssistantResponse(result[0].generated_text, context);
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

  const handleGDriveConfig = async () => {
    try {
      const config = {
        clientId: "your-client-id",
        clientSecret: "your-client-secret",
        redirectUri: window.location.origin
      };
      
      await saveConfig('google_drive', config);
      
      toast({
        title: "Configuration Google Drive",
        description: "Configuration enregistrée avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors de la configuration de Google Drive:', error);
    }
  };

  const handleTeamsConfig = async () => {
    try {
      const config = {
        tenantId: "your-tenant-id",
        clientId: "your-client-id",
        clientSecret: "your-client-secret"
      };
      
      await saveConfig('microsoft_teams', config);
      
      toast({
        title: "Configuration Microsoft Teams",
        description: "Configuration enregistrée avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors de la configuration de Microsoft Teams:', error);
    }
  };

  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const [gdriveConfig, teamsConfig] = await Promise.all([
          getConfig('google_drive'),
          getConfig('microsoft_teams')
        ]);
        
        console.log('Configurations chargées:', { gdriveConfig, teamsConfig });
      } catch (error) {
        console.error('Erreur lors du chargement des configurations:', error);
      }
    };

    loadConfigs();
    
    toast({
      title: "Chat initialisé",
      description: "Interface OpenWebUI chargée avec succès",
    });
  }, []);

  return (
    <Card className="flex flex-col h-[600px] p-4 relative bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-lg">
      <ChatHeader onToggleSettings={() => setShowSettings(!showSettings)} />

      {showSettings && (
        <SettingsPanel
          webUIConfig={webUIConfig}
          onWebUIConfigChange={handleWebUIConfigChange}
          onProviderChange={handleProviderChange}
          onGDriveConfig={handleGDriveConfig}
          onTeamsConfig={handleTeamsConfig}
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

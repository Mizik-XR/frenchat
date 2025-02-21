
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Send, Bot, Settings, Cloud, Key } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Message, AIProvider, WebUIConfig } from "@/types/chat";
import { useHuggingFace } from "@/hooks/useHuggingFace";
import { AIProviderSelect } from "./chat/AIProviderSelect";
import { MessageList } from "./chat/MessageList";
import { DocumentList } from "./chat/DocumentList";
import { useServiceConfig } from '@/hooks/useServiceConfig';

import "@/styles/chat.css";

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  const [webUIConfig, setWebUIConfig] = useState<WebUIConfig>({
    model: 'huggingface',
    maxTokens: 2000,
    temperature: 0.7,
    streamResponse: true
  });

  const huggingFaceModel = useHuggingFace('huggingface');

  const { saveConfig, getConfig, isLoading: configLoading } = useServiceConfig();

  const handleProviderChange = (provider: AIProvider) => {
    setWebUIConfig(prev => ({ ...prev, model: provider }));
    toast({
      title: "Modèle IA changé",
      description: `Modèle changé pour : ${provider}`,
    });
  };

  useEffect(() => {
    toast({
      title: "Chat initialisé",
      description: "Interface OpenWebUI chargée avec succès",
    });

    console.log("Chat component initialized", {
      model: webUIConfig.model,
      huggingFaceModel: Boolean(huggingFaceModel)
    });
  }, []);

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
    setMessages(prev => [...prev, { role: 'user', content: message }]);
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
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              role: 'assistant',
              content: partialResponse,
              context: context || undefined
            };
            return newMessages;
          });
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      const result = await huggingFaceModel(prompt, {
        max_length: webUIConfig.maxTokens,
        temperature: webUIConfig.temperature,
        top_p: 0.95,
      });

      const assistantMessage = result[0].generated_text;

      setMessages(prev => [
        ...prev.slice(0, -1),
        { 
          role: 'assistant', 
          content: assistantMessage,
          context: context || undefined
        }
      ]);
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
  }, []);

  return (
    <Card className="flex flex-col h-[600px] p-4 relative bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-lg">
      <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-800">Assistant IA</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSettings(!showSettings)}
          className="hover:bg-blue-50 transition-colors"
        >
          <Settings className="h-5 w-5 text-blue-600" />
        </Button>
      </div>

      {showSettings && (
        <Card className="absolute top-16 right-4 z-10 p-4 w-80 bg-white/95 backdrop-blur-sm shadow-xl border border-blue-100 rounded-xl">
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-800 border-b pb-2 mb-4">Paramètres IA</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-600">Modèle IA</label>
                  <AIProviderSelect 
                    aiProvider={webUIConfig.model} 
                    onProviderChange={handleProviderChange}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-600">Température</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={webUIConfig.temperature}
                      onChange={(e) => setWebUIConfig(prev => ({
                        ...prev,
                        temperature: parseFloat(e.target.value)
                      }))}
                      className="flex-1 accent-blue-500"
                    />
                    <span className="text-xs text-gray-500 w-8 text-right">
                      {webUIConfig.temperature}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-600">Tokens maximum</label>
                  <Input
                    type="number"
                    min="100"
                    max="4000"
                    value={webUIConfig.maxTokens}
                    onChange={(e) => setWebUIConfig(prev => ({
                      ...prev,
                      maxTokens: parseInt(e.target.value)
                    }))}
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 border-b pb-2 mb-4">Intégrations externes</h3>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={handleGDriveConfig}
                >
                  <Cloud className="h-4 w-4 mr-2" />
                  Configurer Google Drive
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={handleTeamsConfig}
                >
                  <Key className="h-4 w-4 mr-2" />
                  Configurer Microsoft Teams
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="flex-1 overflow-y-auto mb-4 bg-white/60 rounded-lg p-4">
        <MessageList messages={messages} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 bg-white p-2 rounded-lg shadow-sm">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={selectedDocumentId 
            ? "Posez une question sur le document..." 
            : "Posez votre question..."
          }
          disabled={isLoading}
          className="flex-1 border-blue-200 focus:border-blue-500"
        />
        <Button 
          type="submit" 
          disabled={isLoading || !input.trim()}
          className="bg-blue-500 hover:bg-blue-600 transition-colors"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
};

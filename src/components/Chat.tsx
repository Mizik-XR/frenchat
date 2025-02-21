import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Send, Bot, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Message, AIProvider, WebUIConfig } from "@/types/chat";
import { useHuggingFace } from "@/hooks/useHuggingFace";
import { AIProviderSelect } from "./chat/AIProviderSelect";
import { MessageList } from "./chat/MessageList";
import { DocumentList } from "./chat/DocumentList";

import "@/styles/chat.css";

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  // Configuration OpenWebUI avec le bon type
  const [webUIConfig, setWebUIConfig] = useState<WebUIConfig>({
    model: 'llama-2-70b-chat',
    maxTokens: 2000,
    temperature: 0.7,
    streamResponse: true
  });

  // Utilisation du type correct pour le modèle
  const huggingFaceModel = useHuggingFace('huggingface');

  useEffect(() => {
    toast({
      title: "Chat initialisé",
      description: "Interface OpenWebUI chargée avec succès",
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
        // Simulation de streaming pour la démo
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

  return (
    <Card className="flex flex-col h-[600px] p-4 relative">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-semibold">Assistant IA</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {showSettings && (
        <Card className="absolute top-16 right-4 z-10 p-4 w-72 space-y-4 bg-white shadow-lg">
          <h3 className="font-medium">Paramètres du chat</h3>
          <div className="space-y-2">
            <label className="text-sm">Température</label>
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
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Tokens maximum</label>
            <Input
              type="number"
              min="100"
              max="4000"
              value={webUIConfig.maxTokens}
              onChange={(e) => setWebUIConfig(prev => ({
                ...prev,
                maxTokens: parseInt(e.target.value)
              }))}
            />
          </div>
        </Card>
      )}

      <MessageList messages={messages} />

      <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={selectedDocumentId 
            ? "Posez une question sur le document..." 
            : "Posez votre question..."
          }
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
};

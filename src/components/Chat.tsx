
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Message, AIProvider } from "@/types/chat";
import { useHuggingFace } from "@/hooks/useHuggingFace";
import { AIProviderSelect } from "./chat/AIProviderSelect";
import { MessageList } from "./chat/MessageList";
import { DocumentList } from "./chat/DocumentList";

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [aiProvider, setAIProvider] = useState<AIProvider>('huggingface');
  const [showTutorial, setShowTutorial] = useState(true);

  const huggingFaceModel = useHuggingFace(aiProvider);

  useEffect(() => {
    if (showTutorial) {
      toast({
        title: "Bienvenue dans l'interface de chat !",
        description: "Vous pouvez choisir entre OpenAI (nécessite une clé API) ou Hugging Face (gratuit, local)",
        duration: 5000,
      });

      toast({
        title: "Comment ça marche ?",
        description: "Sélectionnez un document à analyser et posez vos questions. L'IA vous aidera à l'analyser.",
        duration: 5000,
      });

      setShowTutorial(false);
    }
  }, [showTutorial]);

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

      let assistantMessage = '';

      if (aiProvider === 'huggingface' && huggingFaceModel) {
        const prompt = context 
          ? `Contexte: ${context}\n\nQuestion: ${message}\n\nRéponse:`
          : `Question: ${message}\n\nRéponse:`;

        const result = await huggingFaceModel(prompt, {
          max_length: 500,
          temperature: 0.7,
          top_p: 0.95,
        });

        assistantMessage = result[0].generated_text;
      } else {
        const { data, error } = await supabase.functions.invoke('chat', {
          body: { 
            message,
            context: context || undefined,
            provider: 'openai'
          }
        });

        if (error) throw error;
        assistantMessage = data.choices[0].message.content;
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: assistantMessage,
        context: context || undefined
      }]);
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

  const handleSelectDocument = async (documentId: string) => {
    setSelectedDocumentId(documentId);
    toast({
      title: "Document sélectionné",
      description: "Le document sera utilisé comme contexte pour l'analyse",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <AIProviderSelect 
          aiProvider={aiProvider}
          onProviderChange={setAIProvider}
        />
        {documents && <DocumentList
          documents={documents}
          selectedDocumentId={selectedDocumentId}
          onDocumentSelect={handleSelectDocument}
        />}
      </Card>

      <Card className="flex flex-col h-[600px] p-4">
        <MessageList messages={messages} />
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={selectedDocumentId 
              ? "Posez une question sur le document..." 
              : "Posez votre question..."
            }
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
};

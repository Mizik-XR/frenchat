
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Send, Bot, FileText, Paperclip } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  context?: string;
}

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  // Charger les documents disponibles
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
      // Si un document est sélectionné, on l'inclut comme contexte
      let context = '';
      if (selectedDocumentId && documents) {
        const selectedDoc = documents.find(doc => doc.id === selectedDocumentId);
        if (selectedDoc) {
          context = `Document analysé: ${selectedDoc.title}\nContenu: ${selectedDoc.content}`;
        }
      }

      const { data, error } = await supabase.functions.invoke('chat', {
        body: { 
          message,
          context: context || undefined
        }
      });

      if (error) throw error;

      const assistantMessage = data.choices[0].message.content;
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
      {documents && documents.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents disponibles
          </h3>
          <div className="flex flex-wrap gap-2">
            {documents.map((doc) => (
              <Button
                key={doc.id}
                variant={selectedDocumentId === doc.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleSelectDocument(doc.id)}
              >
                <Paperclip className="h-4 w-4 mr-1" />
                {doc.title}
              </Button>
            ))}
          </div>
        </Card>
      )}

      <Card className="flex flex-col h-[600px] p-4">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.role === 'assistant' && (
                  <Bot className="h-4 w-4 mb-1 inline-block mr-2" />
                )}
                {message.context && (
                  <div className="text-xs text-gray-500 mb-1">
                    <FileText className="h-3 w-3 inline-block mr-1" />
                    Analyse basée sur le document sélectionné
                  </div>
                )}
                {message.content}
              </div>
            </div>
          ))}
        </div>

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

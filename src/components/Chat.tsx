import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Send, Bot, FileText, Paperclip, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { pipeline } from "@huggingface/transformers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  context?: string;
}

type AIProvider = 'openai' | 'huggingface';

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [aiProvider, setAIProvider] = useState<AIProvider>('huggingface');
  const [showTutorial, setShowTutorial] = useState(true);
  const [huggingFaceModel, setHuggingFaceModel] = useState<any>(null);

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

  useEffect(() => {
    const initHuggingFace = async () => {
      if (aiProvider === 'huggingface' && !huggingFaceModel) {
        try {
          toast({
            title: "Chargement du modèle",
            description: "Le modèle Hugging Face est en cours de chargement...",
          });

          const model = await pipeline(
            'text-generation',
            'mistral-7b-instruct-v0.2',
            { device: 'cpu' }
          );

          setHuggingFaceModel(model);
          
          toast({
            title: "Modèle chargé",
            description: "Le modèle Hugging Face est prêt à être utilisé !",
          });
        } catch (error) {
          console.error('Erreur lors du chargement du modèle:', error);
          toast({
            title: "Erreur de chargement",
            description: "Impossible de charger le modèle Hugging Face. Basculement vers OpenAI.",
            variant: "destructive"
          });
          setAIProvider('openai');
        }
      }
    };

    initHuggingFace();
  }, [aiProvider]);

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

  const handleAIProviderChange = (value: AIProvider) => {
    setAIProvider(value);
    if (value === 'openai') {
      toast({
        title: "Configuration OpenAI",
        description: "Assurez-vous d'avoir configuré votre clé API OpenAI dans les paramètres.",
      });
    } else {
      toast({
        title: "Mode Hugging Face",
        description: "Le traitement sera effectué localement dans votre navigateur. Le modèle est en cours de chargement...",
      });
    }
  };

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

  const handleConfigureAI = () => {
    if (aiProvider === 'openai') {
      toast({
        title: "Configuration OpenAI",
        description: "Pour utiliser OpenAI, vous devez configurer votre clé API. Coût : ~0.01$ par 1000 tokens.",
      });
    } else {
      toast({
        title: "Configuration Hugging Face",
        description: "Hugging Face est gratuit et fonctionne localement. Le modèle est déjà en cours de chargement !",
      });
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
        <div className="flex items-center justify-between mb-4">
          <Select
            value={aiProvider}
            onValueChange={(value: AIProvider) => handleAIProviderChange(value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Choisir le modèle IA" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI (API Key requise)</SelectItem>
              <SelectItem value="huggingface">Hugging Face (Gratuit, Local)</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleConfigureAI}>
            <Settings className="h-4 w-4 mr-2" />
            Configurer l'IA
          </Button>
        </div>

        {documents && documents.length > 0 && (
          <div>
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
          </div>
        )}
      </Card>

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
